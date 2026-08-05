/**
 * Historical Validation Router — Gate 18 Section 6
 * Track recommendation outcomes over time: accuracy, time-to-impact, return score.
 */

import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";

function getD1(ctx: any): D1Database | null {
  return (ctx.env?.DB as D1Database) || null;
}

export const historicalValidationRouter = createRouter({
  // ─── List historical validations ───
  list: authedQuery
    .input(z.object({ status: z.string().optional(), patternType: z.string().optional(), state: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const d1 = getD1(ctx);
      if (!d1) return { validations: [] };
      try {
        const conditions: string[] = [];
        const params: (string | number)[] = [];
        if (input?.status) { conditions.push(`currentStatus = ?`); params.push(input.status); }
        if (input?.patternType) { conditions.push(`patternType = ?`); params.push(input.patternType); }
        if (input?.state) { conditions.push(`state = ?`); params.push(input.state); }
        const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const sql = `SELECT * FROM historical_validations ${where} ORDER BY createdAt DESC LIMIT 50`;
        const { results } = await d1.prepare(sql).bind(...params).all();
        return { validations: results || [] };
      } catch { return { validations: [] }; }
    }),

  // ─── Summary stats ───
  summary: authedQuery.query(async ({ ctx }) => {
    const d1 = getD1(ctx);
    if (!d1) return { status: "UNAVAILABLE" as const, total: 0, confirmed: 0, partiallyConfirmed: 0, pending: 0, infrastructureActive: 0, avgAccuracy: 0, avgReturnScore: 0, avgTimeToImpact: 0, accuracyByPattern: [] };
    try {
      const total = await d1.prepare(`SELECT COUNT(*) as c FROM historical_validations`).first<{ c: number }>();
      const confirmed = await d1.prepare(`SELECT COUNT(*) as c FROM historical_validations WHERE currentStatus = 'confirmed_development'`).first<{ c: number }>();
      const partial = await d1.prepare(`SELECT COUNT(*) as c FROM historical_validations WHERE currentStatus = 'partially_confirmed'`).first<{ c: number }>();
      const pending = await d1.prepare(`SELECT COUNT(*) as c FROM historical_validations WHERE currentStatus = 'pending'`).first<{ c: number }>();
      const active = await d1.prepare(`SELECT COUNT(*) as c FROM historical_validations WHERE currentStatus = 'infrastructure_active'`).first<{ c: number }>();
      const avgAccuracy = await d1.prepare(`SELECT AVG(accuracy) as c FROM historical_validations WHERE accuracy IS NOT NULL`).first<{ c: number }>();
      const avgReturn = await d1.prepare(`SELECT AVG(returnScore) as c FROM historical_validations WHERE returnScore IS NOT NULL`).first<{ c: number }>();
      const avgTimeToImpact = await d1.prepare(`SELECT AVG(timeToImpact) as c FROM historical_validations WHERE timeToImpact IS NOT NULL`).first<{ c: number }>();
      const { results: byPattern } = await d1.prepare(`SELECT patternType, AVG(accuracy) as avgAccuracy, COUNT(*) as count FROM historical_validations WHERE accuracy IS NOT NULL GROUP BY patternType`).all();

      return {
        total: total?.c || 0,
        confirmed: confirmed?.c || 0,
        partiallyConfirmed: partial?.c || 0,
        pending: pending?.c || 0,
        infrastructureActive: active?.c || 0,
        avgAccuracy: Math.round(avgAccuracy?.c || 0),
        avgReturnScore: Math.round(avgReturn?.c || 0),
        avgTimeToImpact: Math.round(avgTimeToImpact?.c || 0),
        accuracyByPattern: byPattern || [],
      };
    } catch { return { status: "UNAVAILABLE" as const, total: 0, confirmed: 0, partiallyConfirmed: 0, pending: 0, infrastructureActive: 0, avgAccuracy: 0, avgReturnScore: 0, avgTimeToImpact: 0, accuracyByPattern: [] }; }
  }),

  // ─── Gate 19 Section 6: Recommendation Outcomes ───
  outcomes: authedQuery
    .input(z.object({
      outcomeStatus: z.string().optional(),
      patternId: z.number().optional(),
      state: z.string().optional(),
      limit: z.number().default(50),
    }).optional())
    .query(async ({ input, ctx }) => {
      const d1 = getD1(ctx);
      if (!d1) return { status: "UNAVAILABLE" as const, outcomes: [] };
      try {
        const conditions: string[] = [];
        const params: (string | number)[] = [];
        if (input?.outcomeStatus) { conditions.push(`outcomeStatus = ?`); params.push(input.outcomeStatus); }
        if (input?.patternId) { conditions.push(`patternId = ?`); params.push(input.patternId); }
        if (input?.state) { conditions.push(`state = ?`); params.push(input.state); }
        const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const sql = `SELECT * FROM recommendation_outcomes ${where} ORDER BY createdAt DESC LIMIT ?`;
        params.push(input?.limit || 50);
        const { results } = await d1.prepare(sql).bind(...params).all();
        return { status: "LIVE" as const, outcomes: results || [] };
      } catch { return { status: "UNAVAILABLE" as const, outcomes: [] }; }
    }),

  // ─── Record an outcome ───
  recordOutcome: authedQuery
    .input(z.object({
      recommendationId: z.number(),
      patternId: z.number().optional(),
      county: z.string().optional(),
      state: z.string().optional(),
      predictedEventTypes: z.array(z.string()).optional(),
      actualEventTypes: z.array(z.string()).optional(),
      outcomeStatus: z.enum(["pending", "confirmed", "partially_confirmed", "incorrect", "expired"]),
      accuracyScore: z.number().min(0).max(100).optional(),
      timeToDevelopmentDays: z.number().optional(),
      infrastructureCompleted: z.boolean().optional(),
      confidenceAtPrediction: z.number().optional(),
      returnScore: z.number().optional(),
      lessonsLearned: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const d1 = getD1(ctx);
      if (!d1) return { success: false, id: null };
      try {
        const result = await d1.prepare(
          `INSERT INTO recommendation_outcomes (recommendationId, patternId, county, state, predictedEventTypes, actualEventTypes, outcomeStatus, accuracyScore, timeToDevelopmentDays, infrastructureCompleted, confidenceAtPrediction, returnScore, lessonsLearned)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(input.recommendationId, input.patternId || null, input.county || null, input.state || null,
          JSON.stringify(input.predictedEventTypes || []), JSON.stringify(input.actualEventTypes || []),
          input.outcomeStatus, input.accuracyScore || null, input.timeToDevelopmentDays || null,
          input.infrastructureCompleted ? 1 : 0, input.confidenceAtPrediction || null,
          input.returnScore || null, input.lessonsLearned || null).run();
        return { success: true, id: result.meta?.last_row_id };
      } catch { return { success: false, id: null }; }
    }),

  // ─── Outcome summary ───
  outcomeSummary: authedQuery.query(async ({ ctx }) => {
    const d1 = getD1(ctx);
    if (!d1) return { status: "UNAVAILABLE" as const, total: 0, confirmed: 0, partiallyConfirmed: 0, incorrect: 0, avgAccuracy: 0, avgTimeToImpact: 0, completed: 0, byPattern: [] };
    try {
      const total = await d1.prepare(`SELECT COUNT(*) as c FROM recommendation_outcomes`).first<{ c: number }>();
      const confirmed = await d1.prepare(`SELECT COUNT(*) as c FROM recommendation_outcomes WHERE outcomeStatus = 'confirmed'`).first<{ c: number }>();
      const partial = await d1.prepare(`SELECT COUNT(*) as c FROM recommendation_outcomes WHERE outcomeStatus = 'partially_confirmed'`).first<{ c: number }>();
      const incorrect = await d1.prepare(`SELECT COUNT(*) as c FROM recommendation_outcomes WHERE outcomeStatus = 'incorrect'`).first<{ c: number }>();
      const avgAccuracy = await d1.prepare(`SELECT AVG(accuracyScore) as c FROM recommendation_outcomes WHERE accuracyScore IS NOT NULL`).first<{ c: number }>();
      const avgTime = await d1.prepare(`SELECT AVG(timeToDevelopmentDays) as c FROM recommendation_outcomes WHERE timeToDevelopmentDays IS NOT NULL`).first<{ c: number }>();
      const completed = await d1.prepare(`SELECT COUNT(*) as c FROM recommendation_outcomes WHERE infrastructureCompleted = 1`).first<{ c: number }>();
      const { results: byPattern } = await d1.prepare(`SELECT patternId, AVG(accuracyScore) as avgAccuracy, COUNT(*) as count FROM recommendation_outcomes WHERE accuracyScore IS NOT NULL GROUP BY patternId ORDER BY avgAccuracy DESC`).all();
      return {
        status: "LIVE" as const,
        total: total?.c || 0,
        confirmed: confirmed?.c || 0,
        partiallyConfirmed: partial?.c || 0,
        incorrect: incorrect?.c || 0,
        avgAccuracy: Math.round(avgAccuracy?.c || 0),
        avgTimeToDevelopment: Math.round(avgTime?.c || 0),
        infrastructureCompleted: completed?.c || 0,
        byPattern: byPattern || [],
      };
    } catch { return { status: "UNAVAILABLE" as const, total: 0, confirmed: 0, partiallyConfirmed: 0, incorrect: 0, avgAccuracy: 0, avgTimeToImpact: 0, completed: 0, byPattern: [] }; }
  }),
});

