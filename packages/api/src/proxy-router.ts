/**
 * Kestovar Engine Proxy Routers — BuildSignal API
 *
 * BuildSignal Powered by Kestovar. Thin proxy routers that forward intelligence
 * requests to the Kestovar Engine via Cloudflare Workers service binding.
 *
 * Architecture: API Gateway → Service Binding → Kestovar Engine
 * The API no longer owns shared business logic — it only proxies to the Engine.
 *
 * SECURITY: Error messages are sanitized — never expose internal procedure names,
 * engine paths, or raw engine error details to the client.
 */

import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getEngineProxy } from "./lib/engine-proxy";
import { TRPCError } from "@trpc/server";

/** Input schema used by all proxy procedures */
const proxyInput = z.record(z.string(), z.unknown()).default({});

/** Safely call engine with sanitized errors. Input is Record (never undefined due to .default). */
async function proxyToEngine(
  namespace: string,
  action: string,
  env: Record<string, unknown> | undefined,
  input: Record<string, unknown>,
) {
  const engine = getEngineProxy(env ?? {});
  return engine.call(`${namespace}.${action}`, input) as Promise<any>;
}

/**
 * Create a proxy router for an Engine namespace.
 * All procedures forward to the Engine via service binding.
 * Error messages are sanitized to prevent internal data leaks.
 */
function createProxyRouter(namespace: string) {
  return createRouter({
    list: authedQuery
      .input(proxyInput)
      .query(async ({ input, ctx }) => {
        try { return await proxyToEngine(namespace, "list", ctx.env, input); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Intelligence service temporarily unavailable" }); }
      }),

    detail: authedQuery
      .input(proxyInput)
      .query(async ({ input, ctx }) => {
        try { return await proxyToEngine(namespace, "detail", ctx.env, input); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Intelligence service temporarily unavailable" }); }
      }),

    match: authedQuery
      .input(proxyInput)
      .query(async ({ input, ctx }) => {
        try { return await proxyToEngine(namespace, "match", ctx.env, input); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Intelligence service temporarily unavailable" }); }
      }),

    performance: authedQuery
      .input(proxyInput)
      .query(async ({ input, ctx }) => {
        try { return await proxyToEngine(namespace, "performance", ctx.env, input); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Intelligence service temporarily unavailable" }); }
      }),

    stats: authedQuery
      .input(proxyInput)
      .query(async ({ input, ctx }) => {
        try { return await proxyToEngine(namespace, "stats", ctx.env, input); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Intelligence service temporarily unavailable" }); }
      }),

    create: authedQuery
      .input(proxyInput)
      .mutation(async ({ input, ctx }) => {
        try { return await proxyToEngine(namespace, "create", ctx.env, input); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Intelligence service temporarily unavailable" }); }
      }),

    _passthrough: authedQuery
      .input(z.object({ method: z.string(), args: z.record(z.string(), z.unknown()).default({}) }))
      .query(async ({ input, ctx }) => {
        try { return await proxyToEngine(namespace, input.method, ctx.env, input.args); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Intelligence service temporarily unavailable" }); }
      }),
  });
}

// ─── Proxy Routers — Intelligence Layer ───
export const patternProxyRouter = createProxyRouter("pattern");
export const learningProxyRouter = createProxyRouter("learning");
export const recommendationProxyRouter = createProxyRouter("recommendation");
export const confidenceProxyRouter = createProxyRouter("confidence");
export const historicalProxyRouter = createProxyRouter("historical");

// ─── Proxy Routers — Data Layer ───
export const providerProxyRouter = createProxyRouter("provider");
export const pipelineProxyRouter = createProxyRouter("pipeline");
export const analyticsProxyRouter = createProxyRouter("analytics");
export const searchProxyRouter = createProxyRouter("search");
export const warehouseProxyRouter = createProxyRouter("warehouse");
export const enrichmentProxyRouter = createProxyRouter("enrichment");

// ─── Proxy Routers — Governance Layer ───
export const governanceProxyRouter = createProxyRouter("governance");
export const validationProxyRouter = createProxyRouter("validation");
export const qualityProxyRouter = createProxyRouter("quality");

// ─── Proxy Routers — Operations Layer ───
export const briefingProxyRouter = createProxyRouter("briefing");
export const expansionProxyRouter = createProxyRouter("expansion");
export const liveProxyRouter = createProxyRouter("live");

// ─── Engine Health Check ───
export const engineHealthRouter = createRouter({
  check: authedQuery.query(async ({ ctx }) => {
    try {
      const engine = getEngineProxy(ctx.env ?? {});
      return await engine.health();
    } catch {
      return { status: "unreachable", service: "kestovar-engine" };
    }
  }),
});
