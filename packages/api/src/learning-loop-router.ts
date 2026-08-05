/**
 * Learning Loop Router — Gate 19 Section 7
 * Capture feedback events that continuously improve recommendation quality.
 */

import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";

function getD1(ctx: any): D1Database | null {
  return (ctx.env?.DB as D1Database) || null;
}

export const LEARNING_EVENT_TYPES = [
  "accepted", "rejected", "false_positive", "false_negative",
  "manual_correction", "confidence_adjusted", "pattern_evolved",
] as const;

export const learningLoopRouter = createRouter({
  // ─── Record a learning event ───
  record: authedQuery
    .input(z.object({
      eventType: z.enum(LEARNING_EVENT_TYPES),
      recommendationId: z.number().optional(),
      patternId: z.number().optional(),
      previousValue: z.string().optional(),
      newValue: z.string().optional(),
      userId: z.number().optional(),
      feedback: z.string().optional(),
      adjustmentReason: z.string().optional(),
      impactScore: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const d1 = getD1(ctx);
      if (!d1) return { success: false, id: null };
      try {
        const result = await d1.prepare(
          `INSERT INTO learning_events (eventType, recommendationId, patternId, previousValue, newValue, userId, feedback, adjustmentReason, impactScore)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(input.eventType, input.recommendationId || null, input.patternId || null,
          input.previousValue || null, input.newValue || null, input.userId || null,
          input.feedback || null, input.adjustmentReason || null, input.impactScore || 0).run();
        return { success: true, id: result.meta?.last_row_id };
      } catch { return { success: false, id: null }; }
    }),

  // ─── List learning events ───
  list: authedQuery
    .input(z.object({
      eventType: z.string().optional(),
      recommendationId: z.number().optional(),
      days: z.number().default(30),
    }).optional())
    .query(async ({ input, ctx }) => {
      const d1 = getD1(ctx);
      if (!d1) return { status: "UNAVAILABLE" as const, events: [] };
      try {
        const days = Math.min(Math.max(input?.days || 30, 1), 365);
        let sql = `SELECT * FROM learning_events WHERE createdAt >= datetime('now', ?)`;
        const params: (string | number)[] = [`-${days} days`];
        if (input?.eventType) { sql += ` AND eventType = ?`; params.push(input.eventType); }
        if (input?.recommendationId) { sql += ` AND recommendationId = ?`; params.push(input.recommendationId); }
        sql += ` ORDER BY createdAt DESC LIMIT 100`;
        const { results } = await d1.prepare(sql).bind(...params).all();
        return { events: results || [] };
      } catch { return { status: "UNAVAILABLE" as const, events: [] }; }
    }),

  // ─── Distribution of learning events by type ───
  distribution: authedQuery.query(async ({ ctx }) => {
    const d1 = getD1(ctx);
    if (!d1) return { status: "UNAVAILABLE" as const, distribution: [] };
    try {
      const { results } = await d1.prepare(
        `SELECT eventType, COUNT(*) as count, AVG(impactScore) as avgImpact FROM learning_events GROUP BY eventType ORDER BY count DESC`
      ).all();
      return { distribution: results || [] };
    } catch { return { status: "UNAVAILABLE" as const, distribution: [] }; }
  }),

  // ─── Impact summary ───
  impact: authedQuery.query(async ({ ctx }) => {
    const d1 = getD1(ctx);
    if (!d1) return { status: "UNAVAILABLE" as const, totalEvents: 0, totalImpact: 0, avgImpact: 0, accepted: 0, rejected: 0, manualCorrections: 0 };
    try {
      const total = await d1.prepare(`SELECT COUNT(*) as c FROM learning_events`).first<{ c: number }>();
      const totalImpact = await d1.prepare(`SELECT SUM(impactScore) as c FROM learning_events`).first<{ c: number }>();
      const avgImpact = await d1.prepare(`SELECT AVG(impactScore) as c FROM learning_events`).first<{ c: number }>();
      const accepted = await d1.prepare(`SELECT COUNT(*) as c FROM learning_events WHERE eventType = 'accepted'`).first<{ c: number }>();
      const rejected = await d1.prepare(`SELECT COUNT(*) as c FROM learning_events WHERE eventType = 'rejected'`).first<{ c: number }>();
      const corrections = await d1.prepare(`SELECT COUNT(*) as c FROM learning_events WHERE eventType = 'manual_correction'`).first<{ c: number }>();
      return {
        totalEvents: total?.c || 0,
        totalImpact: totalImpact?.c || 0,
        avgImpact: Math.round(avgImpact?.c || 0),
        accepted: accepted?.c || 0,
        rejected: rejected?.c || 0,
        manualCorrections: corrections?.c || 0,
      };
    } catch { return { status: "UNAVAILABLE" as const, totalEvents: 0, totalImpact: 0, avgImpact: 0, accepted: 0, rejected: 0, manualCorrections: 0 }; }
  }),
});



