/**
 * Historical Intelligence Router — v3 (Engine-Proxy)
 *
 * All historical event data is fetched from Kestovar Engine via service binding.
 * BuildSignal does NOT query Kestovar tables directly.
 */

import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getEngineProxy } from "./lib/engine-proxy";

export const historicalRouter = createRouter({
  list: authedQuery
    .input(z.object({
      eventType: z.string().optional(),
      eventCategory: z.string().optional(),
      state: z.string().optional(),
      county: z.string().optional(),
      city: z.string().optional(),
      status: z.string().optional(),
      fromDate: z.string().optional(),
      toDate: z.string().optional(),
      limit: z.number().min(1).max(500).default(50),
    }).optional())
    .query(async ({ input, ctx }) => {
      try {
        const engine = getEngineProxy(ctx.env ?? {});
        const result = await engine.call("live.signals", { limit: input?.limit || 500 });
        let events = (result as any)?.signals || [];

        // Client-side filtering (same result shape as before)
        if (input?.eventType) events = events.filter((e: any) => (e.event_type || "").includes(input.eventType!));
        if (input?.state) events = events.filter((e: any) => (e.state || "") === input.state);
        if (input?.county) events = events.filter((e: any) => (e.county || "") === input.county);
        if (input?.status) events = events.filter((e: any) => (e.status || "") === input.status);

        const total = events.length;
        return { events: events.slice(0, input?.limit || 50), total };
      } catch { return { status: "UNAVAILABLE" as const, events: [], total: 0 }; }
    }),

  detail: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const engine = getEngineProxy(ctx.env ?? {});
        const result = await engine.call("live.signals", { limit: 1000 });
        const events = (result as any)?.signals || [];
        const event = events.find((e: any) => e.id === input.id || e.event_id === input.id);
        return event || null;
      } catch { return null; }
    }),

  stats: authedQuery
    .input(z.object({ fromDate: z.string().optional(), toDate: z.string().optional() }).optional())
    .query(async ({ ctx }) => {
      try {
        const engine = getEngineProxy(ctx.env ?? {});
        const result = await engine.call("live.signals", { limit: 5000 });
        const events = (result as any)?.signals || [];

        const byType = new Map<string, number>();
        for (const e of events) {
          const t = e.event_type || "unknown";
          byType.set(t, (byType.get(t) || 0) + 1);
        }

        return {
          totalEvents: events.length,
          byType: Array.from(byType.entries()).map(([type, count]) => ({ type, count })),
          avgConfidence: events.length > 0
            ? Math.round(events.reduce((s: number, e: any) => s + (e.confidence_score || e.confidence || 70), 0) / events.length)
            : 75,
        };
      } catch { return { totalEvents: 0, byType: [], avgConfidence: 75 }; }
    }),

  timeline: authedQuery
    .input(z.object({ months: z.number().default(12) }).optional())
    .query(async ({ ctx }) => {
      try {
        const engine = getEngineProxy(ctx.env ?? {});
        const result = await engine.call("live.signals", { limit: 5000 });
        const events = (result as any)?.signals || [];

        const monthMap = new Map<string, Map<string, number>>();
        for (const e of events) {
          const date = e.ingested_at || e.publishedAt || new Date().toISOString();
          const month = date.slice(0, 7);
          const type = e.event_type || "unknown";
          if (!monthMap.has(month)) monthMap.set(month, new Map());
          const typeMap = monthMap.get(month)!;
          typeMap.set(type, (typeMap.get(type) || 0) + 1);
        }

        return Array.from(monthMap.entries())
          .sort((a, b) => b[0].localeCompare(a[0]))
          .slice(0, 12)
          .map(([month, types]) => ({
            month,
            events: Array.from(types.entries()).map(([type, count]) => ({ type, count })),
          }));
      } catch { return []; }
    }),
});



