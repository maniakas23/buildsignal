/**
 * Live Intelligence Router — v3 (Engine-Proxy)
 *
 * All provider/event data is fetched from Kestovar Engine via service binding.
 */

import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getEngineProxy } from "./lib/engine-proxy";

export const liveIntelligenceRouter = createRouter({
  providers: authedQuery
    .input(z.object({
      providerType: z.string().optional(),
      jurisdictionLevel: z.string().optional(),
      validationStatus: z.string().optional(),
      limit: z.number().default(50),
    }).optional())
    .query(async ({ input, ctx }) => {
      try {
        const engine = getEngineProxy(ctx.env ?? {});
        const result = await engine.call("provider.list", {});
        let providers = (result as any)?.providers || [];

        if (input?.providerType) providers = providers.filter((p: any) => (p.type || "") === input.providerType);
        if (input?.validationStatus) providers = providers.filter((p: any) => (p.status || "") === input.validationStatus);

        return providers.slice(0, input?.limit || 50);
      } catch { return []; }
    }),

  providerStats: authedQuery.query(async ({ ctx }) => {
    try {
      const engine = getEngineProxy(ctx.env ?? {});
      const result = await engine.call("provider.list", {});
      const providers = (result as any)?.providers || [];

      const byType = new Map<string, { count: number; avgHealth: number; avgReliability: number }>();
      for (const p of providers) {
        const t = p.type || "unknown";
        const entry = byType.get(t) || { count: 0, avgHealth: 0, avgReliability: 0 };
        entry.count++;
        entry.avgHealth += p.health_score || 0;
        entry.avgReliability += p.historicalReliability || 0;
        byType.set(t, entry);
      }

      return Array.from(byType.entries()).map(([type, d]) => ({
        type,
        count: d.count,
        avgHealth: Math.round(d.avgHealth / Math.max(d.count, 1)),
        avgReliability: Math.round(d.avgReliability / Math.max(d.count, 1)),
      }));
    } catch { return []; }
  }),

  registerSource: authedQuery
    .input(z.object({
      providerName: z.string(),
      providerType: z.string(),
      jurisdictionLevel: z.string(),
      coverageArea: z.string(),
      dataCategories: z.string(),
      importMethod: z.string(),
      refreshSchedule: z.string(),
      apiEndpoint: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Source registration is proxied to Engine
      try {
        const engine = getEngineProxy(ctx.env ?? {});
        await engine.call("provider.create", { ...input, validationStatus: "pending", healthScore: 100 });
        return { success: true, providerId: Math.floor(Math.random() * 100000) };
      } catch (e: any) {
        console.error("[live.registerSource] Error:", e.message);
        return { success: false, error: e.message };
      }
    }),

  dashboard: authedQuery.query(async ({ ctx }) => {
    try {
      const engine = getEngineProxy(ctx.env ?? {});
      const [eventResult, providerResult] = await Promise.all([
        engine.call("live.signals", { limit: 5000 }),
        engine.call("provider.list", {}),
      ]);

      const events = (eventResult as any)?.signals || [];
      const providers = (providerResult as any)?.providers || [];

      const eventTypes = new Map<string, number>();
      for (const e of events) {
        const t = e.event_type || "unknown";
        eventTypes.set(t, (eventTypes.get(t) || 0) + 1);
      }

      return {
        totalEvents: events.length,
        totalProviders: providers.length,
        eventTypes: Array.from(eventTypes.entries()).map(([type, count]) => ({ type, count })),
        recentActivity: events.slice(0, 10).map((e: any) => ({
          id: e.id || e.event_id,
          title: e.title || e.name || "Unknown",
          type: e.event_type || "unknown",
          source: e.data_source || "Unknown",
          timestamp: e.ingested_at || new Date().toISOString(),
        })),
      };
    } catch {
      return { totalEvents: 0, totalProviders: 0, eventTypes: [], recentActivity: [] };
    }
  }),
});
