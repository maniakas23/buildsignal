/**
 * BuildSignal v5.3 — Daily Operations Router
 *
 * v5.3: No hardcoded demo data. No WHERE 1=1 patterns.
 * Returns UNAVAILABLE when data is missing. All queries parameterized.
 */

import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { resolveTenant } from "./lib/tenant";

function getD1(ctx: any): D1Database | null {
  return (ctx.env?.DB as D1Database) || null;
}

export const dailyOpsRouter = createRouter({
  // ─── Get latest daily summary ───
  latest: authedQuery
    .input(z.object({
      summaryType: z.string().optional(), // national, state, county
      scopeId: z.string().optional(),
      date: z.string().optional(), // YYYY-MM-DD
    }).optional())
    .query(async ({ input, ctx }) => {
      const tenant = await resolveTenant(ctx);
      const d1 = getD1(ctx);
      if (!d1) return { status: "UNAVAILABLE" as const, summary: null, message: "Database unavailable" };

      try {
        const conditions: string[] = [];
        const params: (string | number)[] = [];

        if (input?.summaryType) { conditions.push(`summaryType = ?`); params.push(input.summaryType); }
        if (input?.scopeId) { conditions.push(`scopeId = ?`); params.push(input.scopeId); }
        if (input?.date) { conditions.push(`summaryDate = ?`); params.push(input.date); }
        else { conditions.push(`summaryDate = date('now')`); }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const sql = `SELECT * FROM daily_summaries ${whereClause} ORDER BY generatedAt DESC LIMIT 1`;

        const row = await d1.prepare(sql).bind(...params).first();

        if (!row) {
          return { status: "UNAVAILABLE" as const, summary: null, message: "No summary data for the requested period" };
        }

        return { status: "LIVE" as const, summary: row };
      } catch (err) {
        return { status: "UNAVAILABLE" as const, summary: null, message: "Query failed" };
      }
    }),

  // ─── List summaries over time ───
  history: authedQuery
    .input(z.object({
      summaryType: z.string().optional(),
      scopeId: z.string().optional(),
      days: z.number().default(7),
    }).optional())
    .query(async ({ input, ctx }) => {
      const d1 = getD1(ctx);
      if (!d1) return { status: "UNAVAILABLE" as const, summaries: [], message: "Database unavailable" };

      try {
        const days = Math.min(Math.max(input?.days || 7, 1), 365);
        const params: (string | number)[] = [input?.summaryType || "national", `-${days} days`];

        let sql = `SELECT * FROM daily_summaries WHERE summaryType = ? AND summaryDate >= date('now', ?)`;
        if (input?.scopeId) { sql += ` AND scopeId = ?`; params.push(input.scopeId); }
        sql += ` ORDER BY summaryDate DESC`;

        const { results } = await d1.prepare(sql).bind(...params).all();

        if (!results || results.length === 0) {
          return { status: "UNAVAILABLE" as const, summaries: [], message: "No historical data available" };
        }

        return { status: "LIVE" as const, summaries: results || [] };
      } catch {
        return { status: "UNAVAILABLE" as const, summaries: [], message: "Query failed" };
      }
    }),

  // ─── Activity heatmap ───
  heatmap: authedQuery
    .input(z.object({ days: z.number().default(30) }).optional())
    .query(async ({ input, ctx }) => {
      const d1 = getD1(ctx);
      if (!d1) return { status: "UNAVAILABLE" as const, heatmap: [], message: "Database unavailable" };

      try {
        const days = Math.min(Math.max(input?.days || 30, 1), 365);
        const { results } = await d1.prepare(
          `SELECT state, date(ingestedAt) as date, COUNT(*) as count FROM historical_events WHERE ingestedAt >= datetime('now', ?) GROUP BY state, date ORDER BY date DESC`
        ).bind(`-${days} days`).all();

        if (!results || results.length === 0) {
          return { status: "UNAVAILABLE" as const, heatmap: [], message: "No heatmap data available" };
        }

        return { status: "LIVE" as const, heatmap: results || [] };
      } catch {
        return { status: "UNAVAILABLE" as const, heatmap: [], message: "Query failed" };
      }
    }),

  // ─── Generate daily summary (idempotent) ───
  generate: authedQuery
    .input(z.object({ summaryType: z.string(), scopeId: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const d1 = getD1(ctx);
      if (!d1) return { status: "UNAVAILABLE" as const, success: false, message: "Database unavailable" };

      try {
        const dateStr = new Date().toISOString().slice(0, 10);
        const params: (string | number)[] = [dateStr];
        let sql = `SELECT eventType, COUNT(*) as count FROM historical_events WHERE date(ingestedAt) = ?`;
        if (input.scopeId) { sql += ` AND state = ?`; params.push(input.scopeId); }
        sql += ` GROUP BY eventType`;

        const counts = await d1.prepare(sql).bind(...params).all<{ eventType: string; count: number }>();

        const total = counts.results?.reduce((s, c) => s + c.count, 0) || 0;
        const permits = counts.results?.find(c => c.eventType === "permit")?.count || 0;
        const rezonings = counts.results?.find(c => c.eventType === "rezoning")?.count || 0;
        const meetings = counts.results?.find(c => c.eventType === "planning_meeting")?.count || 0;
        const utilities = counts.results?.find(c => c.eventType === "utility_project")?.count || 0;
        const roads = counts.results?.find(c => c.eventType === "road_project")?.count || 0;

        const topPatterns = await d1.prepare(
          `SELECT patternName, historicalSuccessRate FROM pattern_library WHERE isActive = 1 ORDER BY historicalSuccessRate DESC LIMIT 3`
        ).all();

        const insights = `Generated ${total} infrastructure events on ${dateStr}. ${permits} permits, ${rezonings} rezonings. Top pattern: ${(topPatterns.results?.[0] as any)?.patternName || "N/A"}.`;

        await d1.prepare(
          `INSERT OR REPLACE INTO daily_summaries (summaryType, scopeId, summaryDate, totalEvents, newPermits, newRezonings, newPlanningMeetings, newUtilityProjects, newRoadProjects, topPatterns, insights, confidenceTrend, generatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
        ).bind(input.summaryType, input.scopeId || null, dateStr, total, permits, rezonings, meetings, utilities, roads,
          JSON.stringify(topPatterns.results || []), insights, total > 100 ? "improving" : "stable").run();

        return { status: "LIVE" as const, success: true, summary: { summaryType: input.summaryType, scopeId: input.scopeId, summaryDate: dateStr, totalEvents: total, insights } };
      } catch {
        return { status: "UNAVAILABLE" as const, success: false, message: "Generation failed" };
      }
    }),
});
