/**
 * Learning Router — Gate 17 Section 7
 * AI Learning Engine: track accepted/rejected recommendations, false positives/negatives,
 * confidence adjustments, pattern accuracy, historical success rate.
 */

import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";

function getD1(ctx: any): D1Database | null {
  return (ctx.env?.DB as D1Database) || null;
}

export const learningRouter = createRouter({
  // ─── Log a learning event (accept, reject, confidence adjust) ───
  logEvent: authedQuery
    .input(z.object({
      recommendationId: z.number(),
      userId: z.number(),
      eventType: z.enum(["accepted", "rejected", "confidence_adjusted", "false_positive_reported", "false_negative_reported"]),
      previousConfidence: z.number().optional(),
      newConfidence: z.number().optional(),
      feedbackScore: z.number().min(1).max(5).optional(),
      patternType: z.string().optional(),
      county: z.string().optional(),
      state: z.string().optional(),
      details: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const d1 = getD1(ctx);
      if (!d1) return { success: false };
      try {
        await d1.prepare(
          `INSERT INTO learning_events (recommendationId, userId, eventType, previousConfidence, newConfidence, feedbackScore, patternType, county, state, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(input.recommendationId, input.userId, input.eventType, input.previousConfidence || null, input.newConfidence || null, input.feedbackScore || null, input.patternType || null, input.county || null, input.state || null, input.details || null).run();
        return { success: true };
      } catch { return { success: false }; }
    }),

  // ─── Get learning summary ───
  summary: authedQuery.query(async ({ ctx }) => {
    const d1 = getD1(ctx);
    if (!d1) return { status: "UNAVAILABLE" as const, accepted: 0, rejected: 0, falsePositives: 0, falseNegatives: 0, confidenceAdjusted: 0, totalFeedback: 0, accuracy: 0, patternAccuracy: [], recentEvents: [], confidenceTrend: [] };
    try {
      const accepted = await d1.prepare(`SELECT COUNT(*) as c FROM learning_events WHERE eventType = 'accepted'`).first<{ c: number }>();
      const rejected = await d1.prepare(`SELECT COUNT(*) as c FROM learning_events WHERE eventType = 'rejected'`).first<{ c: number }>();
      const fp = await d1.prepare(`SELECT COUNT(*) as c FROM learning_events WHERE eventType = 'false_positive_reported'`).first<{ c: number }>();
      const fn = await d1.prepare(`SELECT COUNT(*) as c FROM learning_events WHERE eventType = 'false_negative_reported'`).first<{ c: number }>();
      const adjusted = await d1.prepare(`SELECT COUNT(*) as c FROM learning_events WHERE eventType = 'confidence_adjusted'`).first<{ c: number }>();
      const total = (accepted?.c || 0) + (rejected?.c || 0) + (fp?.c || 0) + (fn?.c || 0);
      const accuracy = total > 0 ? Math.round(((accepted?.c || 0) / total) * 100) : 0;

      // Pattern accuracy
      const { results: patternAccuracy } = await d1.prepare(
        `SELECT patternType, eventType, COUNT(*) as count FROM learning_events WHERE patternType IS NOT NULL GROUP BY patternType, eventType`
      ).all<{ patternType: string; eventType: string; count: number }>();

      // Recent events
      const { results: recentEvents } = await d1.prepare(
        `SELECT * FROM learning_events ORDER BY createdAt DESC LIMIT 10`
      ).all();

      // Confidence trend
      const { results: confidenceTrend } = await d1.prepare(
        `SELECT date(createdAt) as date, AVG(newConfidence) as avgConfidence, COUNT(*) as count FROM learning_events WHERE newConfidence IS NOT NULL GROUP BY date(createdAt) ORDER BY date DESC LIMIT 7`
      ).all<{ date: string; avgConfidence: number; count: number }>();

      return {
        accepted: accepted?.c || 0,
        rejected: rejected?.c || 0,
        falsePositives: fp?.c || 0,
        falseNegatives: fn?.c || 0,
        confidenceAdjusted: adjusted?.c || 0,
        totalFeedback: total,
        accuracy,
        patternAccuracy: patternAccuracy || [],
        recentEvents: recentEvents || [],
        confidenceTrend: confidenceTrend || [],
      };
    } catch { return { status: "UNAVAILABLE" as const, accepted: 0, rejected: 0, falsePositives: 0, falseNegatives: 0, confidenceAdjusted: 0, totalFeedback: 0, accuracy: 0, patternAccuracy: [], recentEvents: [], confidenceTrend: [] }; }
  }),

  // ─── Pattern accuracy breakdown ───
  patternAccuracy: authedQuery.query(async ({ ctx }) => {
    const d1 = getD1(ctx);
    if (!d1) return { status: "UNAVAILABLE" as const, patterns: [] };
    try {
      const { results } = await d1.prepare(
        `SELECT patternType,
                SUM(CASE WHEN eventType = 'accepted' THEN 1 ELSE 0 END) as accepted,
                SUM(CASE WHEN eventType = 'rejected' THEN 1 ELSE 0 END) as rejected,
                SUM(CASE WHEN eventType = 'false_positive_reported' THEN 1 ELSE 0 END) as falsePositives,
                SUM(CASE WHEN eventType = 'false_negative_reported' THEN 1 ELSE 0 END) as falseNegatives,
                COUNT(*) as total,
                AVG(feedbackScore) as avgScore
         FROM learning_events WHERE patternType IS NOT NULL GROUP BY patternType`
      ).all();
      const patterns = (results || []).map((r: any) => ({
        patternType: r.patternType,
        accepted: r.accepted || 0,
        rejected: r.rejected || 0,
        falsePositives: r.falsePositives || 0,
        falseNegatives: r.falseNegatives || 0,
        total: r.total || 0,
        accuracy: r.total > 0 ? Math.round(((r.accepted || 0) / r.total) * 100) : 0,
        avgScore: r.avgScore ? Math.round(r.avgScore * 10) / 10 : 0,
      }));
      return { patterns };
    } catch { return { status: "UNAVAILABLE" as const, patterns: [] }; }
  }),
});

