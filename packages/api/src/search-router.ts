/**
 * Search Router — Build 105
 * Provides unified search across opportunities, counties, and signals.
 */

import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";

function getDb(ctx: { env?: Record<string, unknown> }) {
  return ctx.env?.DB as D1Database | undefined;
}

export const searchRouter = createRouter({
  global: authedQuery
    .input(z.object({
      query: z.string().min(1),
      type: z.enum(["all", "opportunities", "counties", "signals"]).default("all"),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ input, ctx }) => {
      const { query, type, limit } = input;
      const db = getDb(ctx);
      const results: Array<{
        id: string; type: string; title: string; subtitle: string;
        confidence?: number; url: string;
      }> = [];

      if (!db) return { results, total: results.length, query };

      if (type === "all" || type === "opportunities") {
        const opportunities = await db.prepare(
          `SELECT id, title, county, state, confidence_score as confidence
           FROM opportunities
           WHERE title LIKE ? OR description LIKE ? OR county LIKE ?
           ORDER BY confidence_score DESC LIMIT ?`
        ).bind(`%${query}%`, `%${query}%`, `%${query}%`, limit).all();

        for (const row of opportunities.results ?? []) {
          results.push({
            id: String(row.id), type: "opportunity",
            title: String(row.title), subtitle: `${row.county}, ${row.state}`,
            confidence: Number(row.confidence), url: `/opportunities/${row.id}`,
          });
        }
      }

      if (type === "all" || type === "counties") {
        const counties = await db.prepare(
          `SELECT id, name, state, fips FROM counties
           WHERE name LIKE ? OR state LIKE ? LIMIT ?`
        ).bind(`%${query}%`, `%${query}%`, limit).all();

        for (const row of counties.results ?? []) {
          results.push({
            id: String(row.id), type: "county",
            title: String(row.name), subtitle: String(row.state),
            url: `/counties/${row.fips}`,
          });
        }
      }

      return { results, total: results.length, query };
    }),

  byType: authedQuery
    .input(z.object({
      query: z.string().min(1),
      type: z.enum(["opportunities", "counties", "signals"]),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ input }) => {
      return { results: [], total: 0, query: input.query };
    }),
});

