/**
 * County Router — County Expansion Engine (Gate 12, Section 2)
 *
 * Tracks county metadata, provider coverage, available data types,
 * infrastructure sources, health status, coverage percentage, and expansion priority.
 */

import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";

export interface CountyCoverage {
  id: number;
  county: string;
  state: string;
  population: number;
  parcelCount: number;
  providerCount: number;
  availableDataTypes: string; // JSON array
  infrastructureSources: string; // JSON array
  healthStatus: "active" | "partial" | "limited" | "planned";
  coveragePercentage: number;
  expansionPriority: number; // 1-10
  lastDataRefresh: string | null;
  totalEvents: number;
  totalPatterns: number;
  totalRecommendations: number;
  createdAt: string;
  updatedAt: string;
}

function getD1(ctx: any): D1Database | null {
  return (ctx.env?.DB as D1Database) || null;
}



export const countyRouter = createRouter({
  // ─── List all counties with coverage ───
  list: authedQuery
    .input(
      z.object({
        state: z.string().optional(),
        healthStatus: z.enum(["active", "partial", "limited", "planned"]).optional(),
        minCoverage: z.number().optional(),
        sortBy: z.enum(["coverage", "population", "priority", "events"]).default("coverage"),
      }).optional()
    )
    .query(async ({ input, ctx }) => {
      const d1 = getD1(ctx);
      if (!d1) return { status: "UNAVAILABLE" as const, counties: [] };

      try {
        const conditions: string[] = [];
        const params: (string | number)[] = [];

        if (input?.state) { conditions.push(`state = ?`); params.push(input.state); }
        if (input?.healthStatus) { conditions.push(`healthStatus = ?`); params.push(input.healthStatus); }
        if (input?.minCoverage) { conditions.push(`coveragePercentage >= ?`); params.push(input.minCoverage); }

        const sortMap = {
          coverage: "coveragePercentage DESC",
          population: "population DESC",
          priority: "expansionPriority ASC",
          events: "totalEvents DESC",
        };
        const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const orderBy = sortMap[input?.sortBy || "coverage"];
        const sql = `SELECT * FROM counties ${where} ORDER BY ${orderBy}`;

        const { results } = await d1.prepare(sql).bind(...params).all<CountyCoverage>();
        return { counties: results || [] };
      } catch {
        return { counties: [] };
      }
    }),

  // ─── County coverage summary ───
  summary: adminQuery.query(async ({ ctx }) => {
    const d1 = getD1(ctx);
    if (!d1) {
      const defaults: CountyCoverage[] = [];
      return computeSummary(defaults);
    }

    try {
      const { results } = await d1.prepare(`SELECT * FROM counties`).all<CountyCoverage>();
      return computeSummary(results || []);
    } catch {
      return computeSummary([]);
    }
  }),

  // ─── Single county detail ───
  detail: authedQuery
    .input(z.object({ county: z.string(), state: z.string() }))
    .query(async ({ input, ctx }) => {
      const d1 = getD1(ctx);
      if (!d1) return { county: null };

      try {
        const row = await d1
          .prepare(`SELECT * FROM counties WHERE county = ? AND state = ?`)
          .bind(input.county, input.state)
          .first<CountyCoverage>();
        return { county: row };
      } catch {
        return { county: null };
      }
    }),
});

function computeSummary(counties: CountyCoverage[]) {
  const total = counties.length;
  const active = counties.filter((c) => c.healthStatus === "active").length;
  const partial = counties.filter((c) => c.healthStatus === "partial").length;
  const limited = counties.filter((c) => c.healthStatus === "limited").length;
  const planned = counties.filter((c) => c.healthStatus === "planned").length;
  const avgCoverage = Math.round(counties.reduce((s, c) => s + c.coveragePercentage, 0) / (total || 1));
  const totalPopulation = counties.reduce((s, c) => s + c.population, 0);
  const totalEvents = counties.reduce((s, c) => s + c.totalEvents, 0);
  const totalPatterns = counties.reduce((s, c) => s + c.totalPatterns, 0);
  const totalRecommendations = counties.reduce((s, c) => s + c.totalRecommendations, 0);

  return { total, active, partial, limited, planned, avgCoverage, totalPopulation, totalEvents, totalPatterns, totalRecommendations };
}

