import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { qualityMetrics } from "@db/schema-sqlite";
import { eq, desc, and, sql } from "drizzle-orm";
import { getDbFromContext } from "./queries/connection";

export const qualityRouter = createRouter({
  record: authedQuery.input(z.object({
    metricDate: z.string(),
    recommendationPrecision: z.number().min(0).max(1).optional(),
    recommendationRecall: z.number().min(0).max(1).optional(),
    falsePositiveRate: z.number().min(0).max(1).optional(),
    falseNegativeRate: z.number().min(0).max(1).optional(),
    acceptanceRate: z.number().min(0).max(1).optional(),
    providerReliabilityAvg: z.number().min(0).max(1).optional(),
    coverageCompleteness: z.number().min(0).max(1).optional(),
    confidenceAccuracy: z.number().min(0).max(1).optional(),
    totalRecommendations: z.number().optional(),
    acceptedRecommendations: z.number().optional(),
    rejectedRecommendations: z.number().optional(),
    correctedRecommendations: z.number().optional(),
    trendDirection: z.enum(["improving","stable","declining"]).optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    const result = await db.insert(qualityMetrics).values(input).returning();
    return { success: true, metric: result[0] };
  }),

  history: authedQuery.input(z.object({
    days: z.number().min(1).max(365).optional().default(30),
    metricDateFrom: z.string().optional(), metricDateTo: z.string().optional(),
  }).optional()).query(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    const limit = input?.days || 30;
    const rows = await db.select().from(qualityMetrics).orderBy(desc(qualityMetrics.metricDate)).limit(limit);
    const sorted = [...rows].sort((a: any, b: any) => a.metricDate.localeCompare(b.metricDate));
    const firstWeek = sorted.slice(0, 7); const lastWeek = sorted.slice(-7);
    const avg = (arr: any[], field: string) => { const vals = arr.filter((r: any) => (r as any)[field] !== null && (r as any)[field] !== undefined).map((r: any) => r[field] as number); return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0; };
    const trend = { precision: avg(lastWeek, "recommendationPrecision") - avg(firstWeek, "recommendationPrecision"), recall: avg(lastWeek, "recommendationRecall") - avg(firstWeek, "recommendationRecall"), acceptance: avg(lastWeek, "acceptanceRate") - avg(firstWeek, "acceptanceRate"), confidence: avg(lastWeek, "confidenceAccuracy") - avg(firstWeek, "confidenceAccuracy") };
    return { metrics: rows, trend };
  }),

  latest: authedQuery.query(async ({ ctx }) => {
    const db = getDbFromContext(ctx.env);
    const rows = await db.select().from(qualityMetrics).orderBy(desc(qualityMetrics.metricDate)).limit(1);
    return rows[0] || null;
  }),

  dashboard: authedQuery.query(async ({ ctx }) => {
    const db = getDbFromContext(ctx.env);
    const last30 = await db.select().from(qualityMetrics).orderBy(desc(qualityMetrics.metricDate)).limit(30);
    if (last30.length === 0) return { latest: null, avgPrecision: 0, avgRecall: 0, avgAcceptance: 0, avgFalsePositive: 0, avgFalseNegative: 0, trend: "stable", dailyTrends: [] };
    const avg = (field: string) => { const vals = last30.filter((r: any) => r[field] !== null).map((r: any) => r[field] as number); return vals.length > 0 ? Math.round((vals.reduce((a: number, b: number) => a + b, 0) / vals.length) * 1000) / 1000 : 0; };
    const half = Math.floor(last30.length / 2);
    const firstHalf = last30.slice(-half); const secondHalf = last30.slice(0, half);
    const firstPrecision = firstHalf.filter((r: any) => r.recommendationPrecision).reduce((s: number, r: any) => s + r.recommendationPrecision, 0) / Math.max(firstHalf.length, 1);
    const secondPrecision = secondHalf.filter((r: any) => r.recommendationPrecision).reduce((s: number, r: any) => s + r.recommendationPrecision, 0) / Math.max(secondHalf.length, 1);
    let trend = "stable"; if (secondPrecision - firstPrecision > 0.02) trend = "improving"; else if (firstPrecision - secondPrecision > 0.02) trend = "declining";
    const dailyTrends = [...last30].reverse().map((r: any) => ({ date: r.metricDate, precision: r.recommendationPrecision, recall: r.recommendationRecall, acceptance: r.acceptanceRate, falsePositive: r.falsePositiveRate, falseNegative: r.falseNegativeRate, confidence: r.confidenceAccuracy }));
    return { latest: last30[0], avgPrecision: avg("recommendationPrecision"), avgRecall: avg("recommendationRecall"), avgAcceptance: avg("acceptanceRate"), avgFalsePositive: avg("falsePositiveRate"), avgFalseNegative: avg("falseNegativeRate"), trend, dailyTrends };
  }),

  goals: authedQuery.query(() => ({
    precision: { target: 0.85, current: 0, label: "Recommendation Precision" },
    recall: { target: 0.80, current: 0, label: "Recommendation Recall" },
    falsePositive: { target: 0.10, current: 0, label: "False Positive Rate", lowerIsBetter: true },
    falseNegative: { target: 0.15, current: 0, label: "False Negative Rate", lowerIsBetter: true },
    acceptance: { target: 0.70, current: 0, label: "Acceptance Rate" },
    providerReliability: { target: 0.90, current: 0, label: "Provider Reliability" },
    coverage: { target: 0.75, current: 0, label: "Coverage Completeness" },
    confidence: { target: 0.85, current: 0, label: "Confidence Accuracy" },
  })),
});
