import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { handleStripeWebhook } from "./stripe-router";
import { Paths } from "@contracts/constants";
import { getDbFromContext } from "./queries/connection";
import { sql } from "drizzle-orm";
import {
  checkEngineHealth,
  checkEngineReady,
  getEngineVersion,
  getCapabilities,
} from "./lib/kestovar";
import type { KestovarCapabilities } from "./lib/kestovar";

const serverStartTime = Date.now();

const app = new Hono();

app.use(secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", env.kimiAuthUrl, env.kimiOpenUrl],
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: [
    env.kimiAuthUrl,
    env.kimiOpenUrl,
    "https://buildsignal.net",
    "https://www.buildsignal.net",
    "https://app.buildsignal.net",
    "https://buildsignal-61g.pages.dev",
    "https://*.buildsignal-61g.pages.dev",
    "http://localhost:3000",
    "http://localhost:5173",
  ],
  credentials: true,
}));

app.get("/health", (c) => c.json({
  service: "buildsignal",
  version: "5.4.7",
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
  const cfEnv = c.env as Record<string, unknown>;

  const dbStart = Date.now();
  const dbBinding = cfEnv.DB as D1Database | undefined;
  if (!dbBinding) {
    checks.database = { status: "failed", detail: "D1 DB binding not configured" };
  } else {
    try {
      await dbBinding.prepare("SELECT 1").first();
      checks.database = { status: "passed", latencyMs: Date.now() - dbStart };
    } catch {
      checks.database = { status: "failed", latencyMs: Date.now() - dbStart, detail: "D1 query failed" };
    }
  }

  if (!env.appId || !env.appSecret) {
    checks.authentication = { status: "failed", detail: "APP_ID or APP_SECRET not configured" };
  } else {
    checks.authentication = { status: "passed" };
  }

  if (!env.stripeSecretKey) {
    checks.stripe = { status: "failed", detail: "STRIPE_SECRET_KEY not configured" };
  } else {
    checks.stripe = { status: "passed" };
  }

  const kEnv = {
    KESTOVAR: cfEnv.KESTOVAR as { fetch: (req: Request) => Promise<Response> } | undefined,
    KESTOVAR_API_URL: cfEnv.KESTOVAR_API_URL as string | undefined,
    KESTOVAR_API_KEY: cfEnv.KESTOVAR_API_KEY as string | undefined,
    INTERNAL_API_SECRET: cfEnv.INTERNAL_API_SECRET as string | undefined,
    APP_NAME: cfEnv.APP_NAME as string | undefined,
  };

  const engineHealth = await checkEngineHealth(kEnv);
  const engineReady = await checkEngineReady(kEnv);

  if (engineHealth.status === "passed" && engineReady.ready) {
    checks.kestovarEngine = { status: "passed", latencyMs: engineHealth.latencyMs };
  } else {
    checks.kestovarEngine = {
      status: "failed",
      latencyMs: engineHealth.latencyMs,
      detail: engineHealth.detail || engineReady.detail || "Engine not ready",
    };
  }

  const engineVersion = await getEngineVersion(kEnv);
  const capabilities = await getCapabilities(kEnv);
  let kestovarMeta: Record<string, unknown> | undefined;
  if (engineVersion || capabilities) {
    kestovarMeta = {
      version: engineVersion?.engine ?? "unknown",
      apiVersion: capabilities?.apiVersion ?? "unknown",
      capabilities: capabilities?.capabilities ?? null,
    };
    if (capabilities) {
      const required = ["recommendations", "patterns", "knowledgeGraph", "alerts"] as const;
      const missing = required.filter((c) => !capabilities.capabilities[c]);
      if (missing.length > 0) {
        checks.kestovarCapabilities = { status: "degraded", detail: `Missing: ${missing.join(", ")}` };
      } else {
        checks.kestovarCapabilities = { status: "passed" };
      }
    }
  }

  checks.billing = checks.stripe;
  checks.analytics = checks.database.status === "passed"
    ? { status: "passed" }
    : { status: "failed", detail: "Requires database" };
  checks.reports = checks.database.status === "passed"
    ? { status: "passed" }
    : { status: "failed", detail: "Requires database" };

  const criticalChecks = ["database", "authentication", "stripe", "billing"];
  const allReady = criticalChecks.every((k) => checks[k]?.status === "passed");
  const response: Record<string, unknown> = {
    ready: allReady,
    service: "buildsignal-api",
    version: "5.4.7",
    checks,
    timestamp: new Date().toISOString(),
  };
  if (kestovarMeta) {
    response.kestovar = kestovarMeta;
  }

  return c.json(response, allReady ? 200 : 503);
});

app.get("/version", (c) => c.json({
  application: "5.4.7",
  build: "24.0",
  deployment: env.isProduction ? "production" : "development",
  builtAt: new Date().toISOString(),
  engineApi: "v1",
  environment: env.isProduction ? "production" : "development",
}));

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

app.get(Paths.oauthCallback, createOAuthCallbackHandler());

app.post("/api/webhooks/stripe", async (c) => {
  try {
    const body = await c.req.text();
    const signature = c.req.header("stripe-signature") ?? "";
    const result = await handleStripeWebhook(body, signature, c.env as Record<string, unknown>);
    return c.json(result);
  } catch {
    return c.json({ error: "Webhook processing failed" }, 400);
  }
});

app.post("/api/saml/acs/:providerId", async (c) => {
  const providerId = Number(c.req.param("providerId"));
  try {
    const formData = await c.req.formData();
    const samlResponse = formData.get("SAMLResponse") as string;
    const relayState = formData.get("RelayState") as string | undefined;
    if (!samlResponse) {
      return c.json({ error: "Missing SAMLResponse" }, 400);
    }
    const caller = appRouter.createCaller({
      req: c.req.raw,
      resHeaders: new Headers(),
      env: c.env as Record<string, unknown>,
    });
    const result = await caller.saml.processAssertion({ samlResponse, relayState });
    if (result.success) {
      const cookieHeader = `sso_session=${result.sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`;
      c.header("Set-Cookie", cookieHeader);
      return c.redirect(result.redirectUrl || "/");
    }
    return c.json({ error: "SSO authentication failed" }, 401);
  } catch (err) {
    console.error("[SAML ACS] Error:", err);
    return c.json({ error: "SAML processing failed" }, 400);
  }
});

app.get("/api/saml/metadata/:providerId", async (c) => {
  const providerId = Number(c.req.param("providerId"));
  try {
    const caller = appRouter.createCaller({
      req: c.req.raw,
      resHeaders: new Headers(),
      env: c.env as Record<string, unknown>,
    });
    const result = await caller.saml.metadata({ providerId });
    c.header("Content-Type", "application/samlmetadata+xml");
    return c.text(result.metadata);
  } catch {
    return c.json({ error: "Metadata not found" }, 404);
  }
});

app.use("/api/trpc/*", async (c, next) => {
  if (c.req.method === "OPTIONS") {
    const origin = c.req.header("origin") || "*";
    c.header("Access-Control-Allow-Origin", origin);
    c.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    c.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-trpc-source");
    c.header("Access-Control-Allow-Credentials", "true");
    return c.body(null, 204);
  }
  await next();
  const origin = c.req.header("origin");
  if (origin) {
    c.header("Access-Control-Allow-Origin", origin);
    c.header("Access-Control-Allow-Credentials", "true");
  }
});

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext: (opts) => createContext({ ...opts, env: c.env as Record<string, unknown> }),
  });
});

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

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;
