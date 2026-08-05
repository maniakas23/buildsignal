import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { confidenceScores, recommendationOutcomes, patternLibrary } from "@db/schema-sqlite";
import { eq, desc, and, sql } from "drizzle-orm";
import { getDbFromContext } from "./queries/connection";

export const recommendationV2Router = createRouter({
  confidence: authedQuery.input(z.object({ entityType: z.string(), entityId: z.number() })).query(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    const rows = await db.select().from(confidenceScores).where(and(eq(confidenceScores.entityType,input.entityType),eq(confidenceScores.entityId,input.entityId))).orderBy(desc(confidenceScores.calculatedAt)).limit(1);
    return rows[0] || null;
  }),

  calculateConfidence: authedQuery.input(z.object({
    entityType: z.enum(["recommendation","pattern","event","provider"]), entityId: z.number(),
    providerReliability: z.number().min(0).max(100).optional(), historicalAccuracy: z.number().min(0).max(100).optional(),
    crossSourceAgreement: z.number().min(0).max(100).optional(), dataFreshness: z.number().min(0).max(100).optional(),
    patternMatch: z.number().min(0).max(100).optional(), geographicContext: z.number().min(0).max(100).optional(),
    eventCorrelation: z.number().min(0).max(100).optional(), historicalOutcomes: z.number().min(0).max(100).optional(),
    explanation: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    const weights = { providerReliability:0.15, historicalAccuracy:0.20, crossSourceAgreement:0.15, dataFreshness:0.10, patternMatch:0.15, geographicContext:0.10, eventCorrelation:0.10, historicalOutcomes:0.05 };
    let overallScore = 0, totalWeight = 0;
    const factors: Record<string,number> = {};
    for (const [key,weight] of Object.entries(weights)) { const value = (input as any)[key]; if (value !== undefined) { factors[key] = value; overallScore += value * weight; totalWeight += weight; } }
    if (totalWeight > 0) overallScore = Math.round(overallScore / totalWeight);
    const result = await db.insert(confidenceScores).values({
      entityType: input.entityType, entityId: input.entityId, overallScore,
      providerReliability: input.providerReliability||0, historicalAccuracy: input.historicalAccuracy||0,
      crossSourceAgreement: input.crossSourceAgreement||0, dataFreshness: input.dataFreshness||0,
      patternMatch: input.patternMatch||0, geographicContext: input.geographicContext||0,
      eventCorrelation: input.eventCorrelation||0, historicalOutcomes: input.historicalOutcomes||0,
      explanation: input.explanation || `Calculated confidence: ${overallScore}%`,
    }).returning();
    return { success: true, score: result[0], factors, overallScore };
  }),

  outcomes: authedQuery.input(z.object({
    status: z.enum(["pending","confirmed","partially_confirmed","incorrect","expired","all"]).optional().default("all"),
    limit: z.number().min(1).max(200).optional().default(50),
  }).optional()).query(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    const conditions = [];
    if (input?.status && input.status !== "all") conditions.push(eq(recommendationOutcomes.outcomeStatus, input.status));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const rows = await db.select().from(recommendationOutcomes).where(where).orderBy(desc(recommendationOutcomes.createdAt)).limit(input?.limit || 50);
    const statusCounts = await db.select({ status: recommendationOutcomes.outcomeStatus, count: sql<number>`count(*)` }).from(recommendationOutcomes).groupBy(recommendationOutcomes.outcomeStatus);
    const byStatus: Record<string,number> = {}; for (const s of statusCounts) byStatus[s.status] = s.count;
    return { outcomes: rows, total: rows.length, byStatus };
  }),

  recordOutcome: authedQuery.input(z.object({
    recommendationId: z.number(), patternId: z.number().optional(), county: z.string().optional(),
    state: z.string().optional(), predictedEventTypes: z.string().optional(), actualEventTypes: z.string().optional(),
    outcomeStatus: z.enum(["pending","confirmed","partially_confirmed","incorrect","expired"]),
    accuracyScore: z.number().min(0).max(100).optional(), timeToDevelopmentDays: z.number().optional(),
    confidenceAtPrediction: z.number().optional(), lessonsLearned: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    const result = await db.insert(recommendationOutcomes).values({ ...input, validatedAt: input.outcomeStatus !== "pending" ? new Date() : undefined }).returning();
    return { success: true, outcome: result[0] };
  }),

  patterns: authedQuery.input(z.object({ patternType: z.string().optional(), isActive: z.boolean().optional() }).optional()).query(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    const conditions = [];
    if (input?.patternType) conditions.push(eq(patternLibrary.patternType, input.patternType));
    if (input?.isActive !== undefined) conditions.push(eq(patternLibrary.isActive, input.isActive));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const rows = await db.select().from(patternLibrary).where(where).orderBy(desc(patternLibrary.historicalSuccessRate));
    return { patterns: rows };
  }),

  stats: authedQuery.query(async ({ ctx }) => {
    const db = getDbFromContext(ctx.env);
    const [outcomes, patterns] = await Promise.all([
      db.select().from(recommendationOutcomes),
      db.select().from(patternLibrary).where(eq(patternLibrary.isActive, true)),
    ]);
    const confirmed = outcomes.filter((o:any)=>o.outcomeStatus==="confirmed");
    const accuracy = outcomes.length>0 ? Math.round(outcomes.reduce((sum:number,o:any)=>sum+(o.accuracyScore||0),0)/outcomes.length) : 0;
    const statusMap: Record<string,number> = {}; for (const o of outcomes) statusMap[o.outcomeStatus] = (statusMap[o.outcomeStatus]||0)+1;
    const typeMap = new Map(); for (const p of patterns) typeMap.set(p.patternType,(typeMap.get(p.patternType)||0)+1);
    return { totalOutcomes:outcomes.length, confirmed:confirmed.length, accuracy, avgConfidence:outcomes.length>0?Math.round(outcomes.reduce((sum:number,o:any)=>sum+(o.confidenceAtPrediction||0),0)/outcomes.length):0, patternsActive:patterns.length, patternsByType:Array.from(typeMap.entries()).map(([t,c])=>({type:t,count:c})), outcomesByStatus:statusMap };
  }),
});

