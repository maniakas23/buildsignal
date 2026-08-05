/**
 * Pattern Router — v3 (Engine-Proxy)
 *
 * All pattern data is fetched from Kestovar Engine via service binding.
 */

import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getEngineProxy } from "./lib/engine-proxy";

export const patternRouter = createRouter({
  list: authedQuery
    .input(z.object({
      patternType: z.string().optional(),
      state: z.string().optional(),
      isActive: z.boolean().optional(),
      limit: z.number().min(1).max(200).default(50),
    }).optional())
    .query(async ({ input, ctx }) => {
      try {
        const engine = getEngineProxy(ctx.env ?? {});
        const result = await engine.call("pattern.list", {});
        let patterns = (result as any)?.patterns || [];

        if (input?.patternType) patterns = patterns.filter((p: any) => (p.patternType || "").includes(input.patternType!));
        if (input?.state) patterns = patterns.filter((p: any) => {
          const states = (p.applicableStates || p.state || "").split(",").map((s: string) => s.trim());
          return states.includes(input.state!) || states.length === 0;
        });

        return { patterns: patterns.slice(0, input?.limit || 50), total: patterns.length };
      } catch { return { status: "UNAVAILABLE" as const, patterns: [], total: 0 }; }
    }),

  detail: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const engine = getEngineProxy(ctx.env ?? {});
        const result = await engine.call("pattern.list", {});
        const patterns = (result as any)?.patterns || [];
        return patterns.find((p: any) => p.id === input.id) || null;
      } catch { return null; }
    }),

  byState: authedQuery
    .input(z.object({ state: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const engine = getEngineProxy(ctx.env ?? {});
        const result = await engine.call("pattern.list", {});
        const patterns = (result as any)?.patterns || [];
        return patterns.filter((p: any) => {
          const states = (p.applicableStates || p.state || "").split(",").map((s: string) => s.trim());
          return states.includes(input.state) || states.length === 0;
        });
      } catch { return []; }
    }),

  stats: authedQuery.query(async ({ ctx }) => {
    try {
      const engine = getEngineProxy(ctx.env ?? {});
      const result = await engine.call("pattern.list", {});
      const patterns = (result as any)?.patterns || [];

      const byType = new Map<string, { count: number; avgSuccess: number; totalApps: number }>();
      for (const p of patterns) {
        const t = p.patternType || "unknown";
        const entry = byType.get(t) || { count: 0, avgSuccess: 0, totalApps: 0 };
        entry.count++;
        entry.avgSuccess += p.historicalSuccessRate || 0;
        entry.totalApps += p.totalApplications || 0;
        byType.set(t, entry);
      }

      return {
        totalPatterns: patterns.length,
        avgSuccessRate: patterns.length > 0
          ? Math.round(patterns.reduce((s: number, p: any) => s + (p.historicalSuccessRate || 0), 0) / patterns.length)
          : 0,
        byType: Array.from(byType.entries()).map(([type, d]) => ({
          type,
          count: d.count,
          avgSuccess: Math.round(d.avgSuccess / Math.max(d.count, 1)),
          totalApplications: d.totalApps,
        })),
      };
    } catch { return { totalPatterns: 0, avgSuccessRate: 0, byType: [] }; }
    }),
});



