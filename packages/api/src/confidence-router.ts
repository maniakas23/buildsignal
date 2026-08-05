/**
 * Confidence Intelligence Router — Gate 19 Section 4
 * Explainable confidence scoring for every recommendation using 7 dimensions.
 */

import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";

function getD1(ctx: any): D1Database | null {
  return (ctx.env?.DB as D1Database) || null;
}

export const confidenceRouter = createRouter({
  // ─── Calculate confidence for a recommendation ───
  calculate: authedQuery
    .input(z.object({
      entityType: z.string(),
      entityId: z.number(),
      providerReliability: z.number().min(0).max(100),
      historicalAccuracy: z.number().min(0).max(100),
      crossSourceAgreement: z.number().min(0).max(100),
      dataFreshness: z.number().min(0).max(100),
      patternMatch: z.number().min(0).max(100),
      geographicContext: z.number().min(0).max(100),
      eventCorrelation: z.number().min(0).max(100),
      historicalOutcomes: z.number().min(0).max(100),
    }))
    .query(async ({ input, ctx }) => {
      const weights = {
        providerReliability: 0.15,
        historicalAccuracy: 0.20,
        crossSourceAgreement: 0.10,
        dataFreshness: 0.10,
        patternMatch: 0.15,
        geographicContext: 0.10,
        eventCorrelation: 0.10,
        historicalOutcomes: 0.10,
      };

      const overall = Math.round(
        input.providerReliability * weights.providerReliability +
        input.historicalAccuracy * weights.historicalAccuracy +
        input.crossSourceAgreement * weights.crossSourceAgreement +
        input.dataFreshness * weights.dataFreshness +
        input.patternMatch * weights.patternMatch +
        input.geographicContext * weights.geographicContext +
        input.eventCorrelation * weights.eventCorrelation +
        input.historicalOutcomes * weights.historicalOutcomes
      );

      const breakdown = [
        { dimension: "Provider Reliability", score: input.providerReliability, weight: weights.providerReliability, weighted: Math.round(input.providerReliability * weights.providerReliability) },
        { dimension: "Historical Accuracy", score: input.historicalAccuracy, weight: weights.historicalAccuracy, weighted: Math.round(input.historicalAccuracy * weights.historicalAccuracy) },
        { dimension: "Cross-Source Agreement", score: input.crossSourceAgreement, weight: weights.crossSourceAgreement, weighted: Math.round(input.crossSourceAgreement * weights.crossSourceAgreement) },
        { dimension: "Data Freshness", score: input.dataFreshness, weight: weights.dataFreshness, weighted: Math.round(input.dataFreshness * weights.dataFreshness) },
        { dimension: "Pattern Match", score: input.patternMatch, weight: weights.patternMatch, weighted: Math.round(input.patternMatch * weights.patternMatch) },
        { dimension: "Geographic Context", score: input.geographicContext, weight: weights.geographicContext, weighted: Math.round(input.geographicContext * weights.geographicContext) },
        { dimension: "Event Correlation", score: input.eventCorrelation, weight: weights.eventCorrelation, weighted: Math.round(input.eventCorrelation * weights.eventCorrelation) },
        { dimension: "Historical Outcomes", score: input.historicalOutcomes, weight: weights.historicalOutcomes, weighted: Math.round(input.historicalOutcomes * weights.historicalOutcomes) },
      ];

      const explanation = generateExplanation(breakdown, overall);

      // Store in D1
      const d1 = getD1(ctx);
      if (d1) {
        try {
          await d1.prepare(`INSERT INTO confidence_scores
            (entityType, entityId, overallScore, providerReliability, historicalAccuracy, crossSourceAgreement,
             dataFreshness, patternMatch, geographicContext, eventCorrelation, historicalOutcomes, explanation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .bind(input.entityType, input.entityId, overall,
              input.providerReliability, input.historicalAccuracy, input.crossSourceAgreement,
              input.dataFreshness, input.patternMatch, input.geographicContext,
              input.eventCorrelation, input.historicalOutcomes, explanation)
            .run();
        } catch { /* silent fail on store */ }
      }

      return { overall, breakdown, explanation };
    }),

  // ─── Get confidence for an entity ───
  get: authedQuery
    .input(z.object({ entityType: z.string(), entityId: z.number() }))
    .query(async ({ input, ctx }) => {
      const d1 = getD1(ctx);
      if (!d1) return { score: null };
      try {
        const row = await d1.prepare(
          `SELECT * FROM confidence_scores WHERE entityType = ? AND entityId = ? ORDER BY calculatedAt DESC LIMIT 1`
        ).bind(input.entityType, input.entityId).first();
        return { score: row };
      } catch { return { score: null }; }
    }),

  // ─── Confidence trends over time ───
  trends: authedQuery
    .input(z.object({ entityType: z.string().optional(), days: z.number().default(30) }).optional())
    .query(async ({ input, ctx }) => {
      const d1 = getD1(ctx);
      if (!d1) return { status: "UNAVAILABLE" as const, trends: [] };
      try {
        const days = Math.min(Math.max(input?.days || 30, 1), 365);
        const interval = `-${days} days`;
        let sql = `SELECT date(calculatedAt) as date, AVG(overallScore) as avgScore, COUNT(*) as count FROM confidence_scores WHERE calculatedAt >= datetime('now', ?)`;
        const params: (string | number)[] = [interval];
        if (input?.entityType) { sql += ` AND entityType = ?`; params.push(input.entityType); }
        sql += ` GROUP BY date ORDER BY date DESC`;
        const { results } = await d1.prepare(sql).bind(...params).all();
        return { trends: results || [] };
      } catch { return { status: "UNAVAILABLE" as const, trends: [] }; }
    }),

  // ─── Dimension averages ───
  dimensionSummary: authedQuery.query(async ({ ctx }) => {
    const d1 = getD1(ctx);
    if (!d1) return { status: "UNAVAILABLE" as const, providerReliability: 0, historicalAccuracy: 0, crossSourceAgreement: 0, dataFreshness: 0, patternMatch: 0, geographicContext: 0, eventCorrelation: 0, historicalOutcomes: 0 };
    try {
      const row = await d1.prepare(`SELECT
        AVG(providerReliability) as providerReliability,
        AVG(historicalAccuracy) as historicalAccuracy,
        AVG(crossSourceAgreement) as crossSourceAgreement,
        AVG(dataFreshness) as dataFreshness,
        AVG(patternMatch) as patternMatch,
        AVG(geographicContext) as geographicContext,
        AVG(eventCorrelation) as eventCorrelation,
        AVG(historicalOutcomes) as historicalOutcomes
        FROM confidence_scores`).first();
      const r = row as Record<string, number | null> | null;
      return {
        providerReliability: Math.round(r?.providerReliability ?? 0),
        historicalAccuracy: Math.round(r?.historicalAccuracy ?? 0),
        crossSourceAgreement: Math.round(r?.crossSourceAgreement ?? 0),
        dataFreshness: Math.round(r?.dataFreshness ?? 0),
        patternMatch: Math.round(r?.patternMatch ?? 0),
        geographicContext: Math.round(r?.geographicContext ?? 0),
        eventCorrelation: Math.round(r?.eventCorrelation ?? 0),
        historicalOutcomes: Math.round(r?.historicalOutcomes ?? 0),
      };
    } catch { return { status: "UNAVAILABLE" as const, providerReliability: 0, historicalAccuracy: 0, crossSourceAgreement: 0, dataFreshness: 0, patternMatch: 0, geographicContext: 0, eventCorrelation: 0, historicalOutcomes: 0 }; }
  }),
});

function generateExplanation(breakdown: Array<{ dimension: string; score: number; weighted: number }>, overall: number): string {
  const sorted = [...breakdown].sort((a, b) => b.score - a.score);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  let explanation = `Overall confidence ${overall}% — `;
  if (overall >= 85) explanation += "Strong recommendation backed by multiple high-confidence signals. ";
  else if (overall >= 70) explanation += "Moderate confidence with reasonable supporting evidence. ";
  else if (overall >= 50) explanation += "Tentative signal — additional verification recommended. ";
  else explanation += "Low confidence — significant uncertainty remains. ";

  explanation += `Strongest dimension: ${strongest.dimension} at ${strongest.score}%. `;
  if (weakest.score < 50) explanation += `Weakest dimension: ${weakest.dimension} at ${weakest.score}% — this limits overall confidence.`;
  else explanation += `Weakest dimension: ${weakest.dimension} at ${weakest.score}% — still within acceptable range.`;

  return explanation;
}



