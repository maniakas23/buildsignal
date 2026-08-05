/**
 * Distributed Rate Limiter
 * Uses Cloudflare Durable Objects for consistent rate limiting across
 * multiple Worker instances.
 *
 * Fallback: In-memory Map (single-instance, development only)
 */

// ─── Configuration ───
const RATE_LIMIT_WINDOW_MS = 60_000;  // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100;   // 100 requests per minute per IP

// ─── In-memory fallback (single-instance, development only) ───
interface RateLimitEntry { count: number; resetAt: number }
const memoryStore = new Map<string, RateLimitEntry>();

function checkMemoryRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = memoryStore.get(ip);
  if (!entry || now > entry.resetAt) {
    memoryStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count, resetAt: entry.resetAt };
}

// ─── Durable Object Rate Limiter ───
// Provides distributed rate limiting across all Worker instances.

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}

export class RateLimiterDO implements DurableObject {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const action = url.pathname.slice(1);

    if (action === "check") {
      const ip = url.searchParams.get("ip") || "unknown";
      const result = await this.checkRateLimit(ip);
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  private async checkRateLimit(ip: string): Promise<RateLimitResult> {
    const now = Date.now();
    const key = `rl:${ip}`;

    let entry = await this.state.storage.get<RateLimitEntry>(key);

    if (!entry || now > entry.resetAt) {
      entry = { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
      await this.state.storage.put(key, entry);
      return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetAt: entry.resetAt, limit: RATE_LIMIT_MAX_REQUESTS };
    }

    entry.count++;
    await this.state.storage.put(key, entry);

    if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt, limit: RATE_LIMIT_MAX_REQUESTS };
    }

    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count, resetAt: entry.resetAt, limit: RATE_LIMIT_MAX_REQUESTS };
  }
}

// ─── Rate Limit Checker ───
// Uses Durable Object when available, falls back to in-memory.

export async function checkRateLimit(
  ip: string,
  env?: { RATE_LIMITER?: DurableObjectNamespace }
): Promise<RateLimitResult> {
  // Production: Use Durable Object for distributed rate limiting
  if (env?.RATE_LIMITER) {
    try {
      const id = env.RATE_LIMITER.idFromName("global-rate-limiter");
      const stub = env.RATE_LIMITER.get(id);
      const response = await stub.fetch(
        new Request(`http://limiter/check?ip=${encodeURIComponent(ip)}`),
        { signal: AbortSignal.timeout(3000) } // 3s timeout — fall back to memory if DO hangs
      );
      const result = await response.json() as RateLimitResult;
      return result;
    } catch {
      // If DO fails or times out, fall through to in-memory
    }
  }

  // Development: In-memory rate limiting (single instance only)
  const result = checkMemoryRateLimit(ip);
  return { ...result, limit: RATE_LIMIT_MAX_REQUESTS };
}

export { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS };
