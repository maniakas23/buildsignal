/**
 * BuildSignal API — Cloudflare Worker Entry Point
 *
 * This is the dedicated Worker entry point for api.buildsignal.com.
 * It imports the Hono app from app.ts and runs it with Cloudflare
 * Workers env bindings.
 *
 * Rate limiting: Uses Durable Objects for distributed enforcement.
 * Fallback: In-memory Map (single-instance, development only).
 */

import { setD1Binding } from "./queries/connection";
import { checkRateLimit, RateLimiterDO, RATE_LIMIT_MAX_REQUESTS } from "./lib/rate-limiter";

// Re-export Durable Object for wrangler.toml binding
export { RateLimiterDO };

// ─── CORS Configuration ───
// Canonical domains: buildsignal.net only
const ALLOWED_ORIGINS = [
  "https://buildsignal.net",
  "https://www.buildsignal.net",
  "https://app.buildsignal.net",
  "https://buildsignal-61g.pages.dev",
  "http://localhost:3000",
  "http://localhost:5173",
];

function getOrigin(request: Request): string | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  if (origin.endsWith(".buildsignal-61g.pages.dev")) return origin;
  return null;
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
}

// Polyfill process.env from Cloudflare Workers env bindings
function polyfillProcessEnv(cfEnv: Record<string, unknown>) {
  const g = globalThis as unknown as Record<string, unknown>;
  if (!g.process) {
    g.process = { env: {} } as unknown as { env: Record<string, unknown> };
  }
  const proc = g.process as unknown as { env: Record<string, unknown> };
  if (!proc.env) {
    proc.env = {};
  }
  for (const [key, value] of Object.entries(cfEnv)) {
    if (typeof value === "string" && !proc.env[key]) {
      proc.env[key] = value;
    }
  }
}

export default {
  async fetch(request: Request, env: Record<string, unknown>, ctx: ExecutionContext): Promise<Response> {
    const origin = getOrigin(request);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: origin ? corsHeaders(origin) : {} });
    }

    // ─── Rate Limit Check (Distributed via Durable Objects) ───
    const clientIp = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "unknown";
    const rateLimit = await checkRateLimit(clientIp, env as { RATE_LIMITER?: DurableObjectNamespace });
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({
        status: "UNAVAILABLE",
        correlationId: `bs-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        message: "Rate limit exceeded. Please retry after the reset time.",
        retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
      }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX_REQUESTS),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetAt / 1000)),
          "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          ...(origin ? corsHeaders(origin) : {}),
        },
      });
    }

    // Polyfill process.env before importing any module that uses it
    polyfillProcessEnv(env);

    // Set NODE_ENV to production
    const g = globalThis as unknown as Record<string, unknown>;
    const proc = g.process as unknown as { env: Record<string, unknown> };
    proc.env.NODE_ENV = "production";

    // Bind D1 database if available
    const dbBinding = env.DB as D1Database | undefined;
    if (dbBinding) {
      (globalThis as unknown as Record<string, unknown>).__D1_BINDING__ = dbBinding;
      setD1Binding(dbBinding);
    }

    // Dynamic import so env polyfill runs BEFORE app modules evaluate
    const { default: app } = await import("./app");

    const response = await app.fetch(request, env, ctx);

    // Add CORS + rate limit headers to all responses
    if (origin) {
      for (const [key, value] of Object.entries(corsHeaders(origin))) {
        response.headers.set(key, value);
      }
    }
    response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT_MAX_REQUESTS));
    response.headers.set("X-RateLimit-Remaining", String(Math.max(0, rateLimit.remaining)));
    response.headers.set("X-RateLimit-Reset", String(Math.ceil(rateLimit.resetAt / 1000)));

    // Security headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()");
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    // CSP header — strict for API responses
    response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';");

    return response;
  },

  // ─── Queue Consumer: INGESTION_QUEUE → Kestovar ───
  // Batches normalized events from BuildSignal ingestion and forwards
  // them to Kestovar Engine for pattern analysis and recommendation
  // generation. Gracefully degrades if Kestovar is unavailable.
  async queue(
    batch: MessageBatch<Record<string, unknown>>,
    env: Record<string, unknown>,
  ): Promise<void> {
    const { sendEventBatch, KestovarError } = await import("./lib/kestovar");

    const kEnv = {
      KESTOVAR: env.KESTOVAR as { fetch: (req: Request) => Promise<Response> } | undefined,
      KESTOVAR_API_URL: env.KESTOVAR_API_URL as string | undefined,
      KESTOVAR_API_KEY: env.KESTOVAR_API_KEY as string | undefined,
      INTERNAL_API_SECRET: env.INTERNAL_API_SECRET as string | undefined,
      APP_NAME: env.APP_NAME as string | undefined,
    };

    // Group messages by organization for batch efficiency
    const messages = batch.messages;
    const events = messages.map((msg) => ({
      eventId: msg.id,
      eventType: ((msg.body.eventType as string) || "permit") as import("./lib/kestovar").KestovarEventType,
      organizationId: Number(msg.body.organizationId) || 0,
      geography: (msg.body.geography as Record<string, unknown>) || {},
      data: (msg.body.data as Record<string, unknown>) || msg.body,
      timestamp: new Date().toISOString(),
      source: (msg.body.source as string) || "buildsignal",
      sourceId: (msg.body.sourceId as string) || msg.id,
    }));

    try {
      const result = await sendEventBatch(kEnv, events);
      // Acknowledge all messages on success
      for (const msg of messages) {
        msg.ack();
      }
      // Log batch result (safe, no PII)
      console.log(`[Queue] Batch ${batch.queue} accepted=${result.accepted} rejected=${result.rejected}`);
    } catch (err) {
      if (err instanceof KestovarError && !err.isRetryable()) {
        // Non-retryable error — dead-letter these messages
        for (const msg of messages) {
          msg.ack(); // Remove from queue to prevent infinite retry
        }
        console.error(`[Queue] Batch ${batch.queue} dead-lettered: ${err.message}`);
        return;
      }
      // Retryable error — let messages go back to queue for retry
      // Cloudflare will retry with exponential backoff
      for (const msg of messages) {
        msg.retry();
      }
      console.error(`[Queue] Batch ${batch.queue} will retry: ${err instanceof Error ? err.message : "Unknown"}`);
    }
  },
};
