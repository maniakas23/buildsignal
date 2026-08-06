/**
 * Cloudflare-compatible Hono application.
 *
 * This module exports the Hono app with all API routes, middleware,
 * health endpoints, tRPC, Stripe webhooks, and OAuth — without any
 * Node.js-specific dependencies. It can run on Cloudflare Pages
 * Functions, Cloudflare Workers, or any other edge runtime.
 *
 * For Node.js production server with static file serving, use api/boot.ts
 * which imports this app and adds the Node.js server layer.
 */

import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { handleStripeWebhook } from "./stripe-router";
import { Paths } from "@contracts/constants";
import { getDb } from "./queries/connection";
import { sql } from "drizzle-orm";

// ─── Server start time for uptime tracking ───
const serverStartTime = Date.now();

// ─── Hono App ───
const app = new Hono();

// Security headers on all responses
app.use(secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", env.kimiAuthUrl || "", env.kimiOpenUrl || ""],
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS — must include all frontend origins
app.use(cors({
  origin: [
    env.kimiAuthUrl || "",
    env.kimiOpenUrl || "",
    "https://buildsignal.net",
    "https://www.buildsignal.net",
    "http://localhost:3000",
    "http://localhost:5173",
  ],
  credentials: true,
}));

// ─── Health Endpoints ───

app.get("/health", (c) => c.json({
  service: "buildsignal",
  version: "1.0.0",
  environment: env.isProduction ? "production" : "development",
  status: "healthy",
  uptimeSeconds: Math.floor((Date.now() - serverStartTime) / 1000),
  timestamp: new Date().toISOString(),
}));

interface CheckResult {
  status: "passed" | "failed" | "degraded";
  latencyMs?: number;
  detail?: string;
}

app.get("/ready", async (c) => {
  const checks: Record<string, CheckResult> = {};

  // 1. Database configuration
  const dbStart = Date.now();
  if (!env.databaseUrl) {
    checks.database = { status: "failed", detail: "DATABASE_URL not configured" };
  } else {
    try {
      const db = getDb();
      await db.select({ one: sql`1` });
      checks.database = { status: "passed", latencyMs: Date.now() - dbStart };
    } catch {
      checks.database = { status: "failed", latencyMs: Date.now() - dbStart, detail: "Query failed" };
    }
  }

  // 2. Authentication configuration
  if (!env.appId || !env.appSecret) {
    checks.authentication = { status: "failed", detail: "APP_ID or APP_SECRET not configured" };
  } else {
    checks.authentication = { status: "passed" };
  }

  // 3. Stripe configuration
  if (!env.stripeSecretKey) {
    checks.stripe = { status: "failed", detail: "STRIPE_SECRET_KEY not configured" };
  } else {
    checks.stripe = { status: "passed" };
  }

  // 4. Kestovar Engine connectivity
  const engineStart = Date.now();
  // Try workers.dev direct URL first (avoids 522 custom domain routing issues)
  const engineUrls = [
    "https://kestovar-engine.kemsoftball.workers.dev/health",
    "https://engine.buildsignal.net/health",
  ];
  let enginePassed = false;
  let lastError = "";
  for (const url of engineUrls) {
    try {
      const engineResp = await fetch(url, { signal: AbortSignal.timeout(5000), cf: { cacheTtl: 0 } });
      if (engineResp.ok) {
        const ct = engineResp.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          checks.kestovarEngine = { status: "passed", latencyMs: Date.now() - engineStart };
          enginePassed = true;
          break;
        }
      }
      lastError = `HTTP ${engineResp.status}`;
    } catch (e: any) {
      lastError = e.message || "timeout";
    }
  }
  if (!enginePassed) {
    checks.kestovarEngine = { status: "degraded", latencyMs: Date.now() - engineStart, detail: lastError };
  }

  // 5. Billing subsystem
  checks.billing = checks.stripe; // Mirrors Stripe status

  // 6. Analytics persistence (database-dependent)
  checks.analytics = checks.database.status === "passed"
    ? { status: "passed" }
    : { status: "failed", detail: "Requires database" };

  // 7. Reports subsystem (database-dependent)
  checks.reports = checks.database.status === "passed"
    ? { status: "passed" }
    : { status: "failed", detail: "Requires database" };

  const allReady = Object.values(checks).every((c) => c.status === "passed");
  return c.json(
    { ready: allReady, checks, timestamp: new Date().toISOString() },
    allReady ? 200 : 503,
  );
});

app.get("/version", (c) => c.json({
  application: "1.0.0",
  build: "24.0",
  deployment: env.isProduction ? "production" : "development",
  builtAt: new Date().toISOString(),
  engineApi: "v1",
  environment: env.isProduction ? "production" : "development",
}));

// Body limit for large requests
app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// OAuth callback
app.get(Paths.oauthCallback, createOAuthCallbackHandler());

// Stripe webhook — raw body required for signature verification
app.post("/api/webhooks/stripe", async (c) => {
  try {
    const body = await c.req.text();
    const signature = c.req.header("stripe-signature") ?? "";
    const result = await handleStripeWebhook(body, signature);
    return c.json(result);
  } catch {
    return c.json({ error: "Webhook processing failed" }, 400);
  }
});

// tRPC API — pass Hono context (including D1 binding) to tRPC
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext: (opts) => createContext({ ...opts, env: c.env as Record<string, unknown> }),
  });
});

// ─── Proxy /v1/* routes to Kestovar Engine via service binding ───
app.all("/v1/*", async (c) => {
  const engineBinding = (c.env as Record<string, unknown>)?.KESTOVAR as { fetch: typeof fetch } | undefined;
  if (!engineBinding) {
    return c.json({ error: "Intelligence service temporarily unavailable" }, 503);
  }
  const url = new URL(c.req.path + "?" + new URL(c.req.url).searchParams.toString(), "https://kestovar-engine.internal");
  const headers: Record<string, string> = {};
  c.req.raw.headers.forEach((v, k) => { if (k.toLowerCase() !== "host") headers[k] = v; });
  const engineReq = new Request(url, {
    method: c.req.method,
    headers,
    body: c.req.raw.body,
  });
  return engineBinding.fetch(engineReq);
});

// 404 for unmatched API routes
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;
