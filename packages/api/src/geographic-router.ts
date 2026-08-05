/**
 * Geographic Router — Gate 17 Section 5
 * Multi-level geographic expansion: states, counties, cities, regions, utility districts.
 */

import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";

function getD1(ctx: any): D1Database | null {
  return (ctx.env?.DB as D1Database) || null;
}

export const geographicRouter = createRouter({
  // ─── List zones (optionally filtered by type) ───
  list: authedQuery
    .input(z.object({ type: z.string().optional(), state: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const d1 = getD1(ctx);
      if (!d1) return { status: "UNAVAILABLE" as const, zones: [] };
      try {
        const conditions: string[] = [];
        const params: (string | number)[] = [];
        if (input?.type) { conditions.push(`type = ?`); params.push(input.type); }
        if (input?.state) { conditions.push(`state = ?`); params.push(input.state); }
        const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const sql = `SELECT * FROM geographic_zones ${where} ORDER BY type, name`;
        const { results } = await d1.prepare(sql).bind(...params).all();
        return { status: "LIVE" as const, zones: results || [] };
      } catch { return { status: "UNAVAILABLE" as const, zones: [] }; }
    }),

  // ─── Zone coverage summary ───
  summary: authedQuery.query(async ({ ctx }) => {
    const d1 = getD1(ctx);
    if (!d1) return { status: "UNAVAILABLE" as const, totalZones: 0, states: 0, counties: 0, cities: 0, avgCoverage: 0 };
    try {
      const { results: byType } = await d1.prepare(`SELECT type, COUNT(*) as count, SUM(population) as pop, AVG(coveragePercentage) as avgCoverage FROM geographic_zones GROUP BY type`).all<{ type: string; count: number; pop: number; avgCoverage: number }>();
      const states = byType?.find((t) => t.type === "state");
      const regions = byType?.find((t) => t.type === "region");
      return {
        totalStates: states?.count || 0,
        totalRegions: regions?.count || 0,
        totalPopulation: states?.pop || 0,
        avgCoverage: Math.round(states?.avgCoverage || 0),
        activeZones: await d1.prepare(`SELECT COUNT(*) as c FROM geographic_zones WHERE healthStatus = 'active'`).first<{ c: number }>().then((r) => r?.c || 0),
        plannedZones: await d1.prepare(`SELECT COUNT(*) as c FROM geographic_zones WHERE healthStatus = 'planned'`).first<{ c: number }>().then((r) => r?.c || 0),
      };
    } catch { return { status: "UNAVAILABLE" as const, totalZones: 0, states: 0, counties: 0, cities: 0, avgCoverage: 0 }; }
  }),
});

