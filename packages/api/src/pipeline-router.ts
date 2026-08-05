/**
 * BuildSignal v5.2 — Pipeline Router (DEPRECATED)
 *
 * ALL intelligence operations are delegated to Kestovar Engine.
 * BuildSignal does NOT execute its own pipeline.
 *
 * This router now serves as a thin proxy layer:
 *   BuildSignal API → Engine Proxy → Kestovar Engine
 *
 * The pipeline library in lib/pipeline/ is DEPRECATED and will be removed in v5.3.
 */

import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { engineCall, engineHealth, getProviders, getSignals, getPatterns, getRecommendations, getTelemetry } from "./lib/engine-adapter";
import { auditLog, resolveTenant } from "./lib/tenant";

export const pipelineRouter = createRouter({
  // ─── Health Check ───
  health: adminQuery.query(async ({ ctx }) => {
    const tenant = await resolveTenant(ctx);
    await auditLog(ctx, tenant, "pipeline.health", "pipeline");
    return engineHealth(ctx.env ?? {});
  }),

  // ─── Provider Operations (proxied to Engine) ───
  providers: createRouter({
    list: adminQuery.query(async ({ ctx }) => {
      const tenant = await resolveTenant(ctx);
      await auditLog(ctx, tenant, "pipeline.providers.list", "provider");
      return getProviders(ctx.env ?? {});
    }),

    health: adminQuery.query(async ({ ctx }) => {
      return engineCall(ctx.env ?? {}, "live.providerHealth", {});
    }),

    poll: adminQuery
      .input(z.object({ providerId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const tenant = await resolveTenant(ctx);
        await auditLog(ctx, tenant, "pipeline.providers.poll", "provider", String(input.providerId));
        return engineCall(ctx.env ?? {}, "live.pollProvider", { providerId: input.providerId });
      }),
  }),

  // ─── Events (proxied to Engine) ───
  events: createRouter({
    stats: adminQuery.query(async ({ ctx }) => {
      return engineCall(ctx.env ?? {}, "live.eventStats", {});
    }),

    recent: adminQuery
      .input(z.object({ limit: z.number().min(1).max(100).default(20) }).optional())
      .query(async ({ input, ctx }) => {
        const result = await getSignals(ctx.env ?? {}, input?.limit || 20);
        return (result as any)?.signals || [];
      }),
  }),

  // ─── Patterns (proxied to Engine) ───
  patterns: createRouter({
    stats: adminQuery.query(async ({ ctx }) => {
      return engineCall(ctx.env ?? {}, "live.patternStats", {});
    }),

    active: adminQuery
      .input(z.object({ limit: z.number().min(1).max(100).default(20) }).optional())
      .query(async ({ input, ctx }) => {
        return getPatterns(ctx.env ?? {}, input?.limit || 20);
      }),
  }),

  // ─── Recommendations (proxied to Engine) ───
  recommendations: createRouter({
    list: adminQuery
      .input(z.object({ limit: z.number().min(1).max(100).default(20) }).optional())
      .query(async ({ input, ctx }) => {
        return getRecommendations(ctx.env ?? {}, input?.limit || 20);
      }),

    submitFeedback: adminQuery
      .input(z.object({ recommendationId: z.string(), feedback: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const tenant = await resolveTenant(ctx);
        await auditLog(ctx, tenant, "pipeline.recommendations.feedback", "recommendation", input.recommendationId);
        return engineCall(ctx.env ?? {}, "live.submitFeedback", {
          recommendationId: input.recommendationId,
          feedback: input.feedback,
        });
      }),
  }),

  // ─── Telemetry (proxied to Engine) ───
  telemetry: createRouter({
    summary: adminQuery.query(async ({ ctx }) => {
      return getTelemetry(ctx.env ?? {});
    }),
  }),
});

