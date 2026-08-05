/**
 * Recommendations Router — BuildSignal v5.4.7
 * Stores and retrieves Kestovar-generated recommendations.
 * Organization-scoped with tenant isolation.
 */

import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const recommendationRouter = createRouter({
  // ─── List recommendations for an organization ───
  list: authedQuery
    .input(z.object({
      status: z.string().optional(),
      opportunityType: z.string().optional(),
      county: z.string().optional(),
      state: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const orgId = ctx.user?.orgId;
      if (!orgId) return { recommendations: [], total: 0 };

      const conditions = [eq(schema.recommendations.organizationId, orgId)];
      if (input?.status) conditions.push(eq(schema.recommendations.status, input.status));
      if (input?.opportunityType) conditions.push(eq(schema.recommendations.opportunityType, input.opportunityType));
      if (input?.county) conditions.push(eq(schema.recommendations.county, input.county));
      if (input?.state) conditions.push(eq(schema.recommendations.state, input.state));

      const rows = await db.select().from(schema.recommendations)
        .where(and(...conditions))
        .orderBy(desc(schema.recommendations.createdAt))
        .limit(input?.limit || 50);

      const totalResult = await db.select({ count: sql<number>`count(*)` })
        .from(schema.recommendations)
        .where(eq(schema.recommendations.organizationId, orgId));

      return {
        recommendations: rows.map((r: (typeof rows)[0]) => ({
          ...r,
          evidence: r.evidence ? JSON.parse(r.evidence) : [],
          relatedEvents: r.relatedEvents ? JSON.parse(r.relatedEvents) : [],
          patterns: r.patterns ? JSON.parse(r.patterns) : [],
          historicalComparisons: r.historicalComparisons ? JSON.parse(r.historicalComparisons) : [],
          riskFactors: r.riskFactors ? JSON.parse(r.riskFactors) : [],
          recommendedActions: r.recommendedActions ? JSON.parse(r.recommendedActions) : [],
        })),
        total: totalResult[0]?.count ?? 0,
      };
    }),

  // ─── Get a single recommendation ───
  get: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const orgId = ctx.user?.orgId;
      if (!orgId) return null;

      const row = await db.select().from(schema.recommendations)
        .where(and(
          eq(schema.recommendations.id, input.id),
          eq(schema.recommendations.organizationId, orgId),
        ))
        .get();

      if (!row) return null;
      return {
        ...row,
        evidence: row.evidence ? JSON.parse(row.evidence) : [],
        relatedEvents: row.relatedEvents ? JSON.parse(row.relatedEvents) : [],
        patterns: row.patterns ? JSON.parse(row.patterns) : [],
        historicalComparisons: row.historicalComparisons ? JSON.parse(row.historicalComparisons) : [],
        riskFactors: row.riskFactors ? JSON.parse(row.riskFactors) : [],
        recommendedActions: row.recommendedActions ? JSON.parse(row.recommendedActions) : [],
      };
    }),

  // ─── Create a recommendation (admin/kestovar webhook) ───
  create: adminQuery
    .input(z.object({
      recommendationId: z.string(),
      organizationId: z.number(),
      county: z.string().optional(),
      state: z.string().optional(),
      opportunityType: z.string(),
      executiveSummary: z.string(),
      whyItMatters: z.string().optional(),
      confidence: z.number().min(0).max(1),
      urgency: z.enum(["high", "medium", "low"]).default("medium"),
      evidence: z.array(z.object({
        type: z.string(),
        description: z.string(),
        source: z.string(),
        date: z.string(),
        relevance: z.number(),
      })).optional(),
      relatedEvents: z.array(z.object({
        eventId: z.string(),
        eventType: z.string(),
        description: z.string(),
      })).optional(),
      patterns: z.array(z.string()).optional(),
      historicalComparisons: z.array(z.object({
        period: z.string(),
        comparison: z.string(),
        relevance: z.number(),
      })).optional(),
      riskFactors: z.array(z.string()).optional(),
      recommendedActions: z.array(z.string()).optional(),
      engineVersion: z.string().optional(),
      apiContractVersion: z.string().optional(),
      generatedAt: z.string().optional(),
      freshnessTimestamp: z.string().optional(),
      provenance: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(schema.recommendations).values({
        recommendationId: input.recommendationId,
        organizationId: input.organizationId,
        county: input.county,
        state: input.state,
        opportunityType: input.opportunityType,
        executiveSummary: input.executiveSummary,
        whyItMatters: input.whyItMatters,
        confidence: input.confidence,
        urgency: input.urgency,
        evidence: input.evidence ? JSON.stringify(input.evidence) : null,
        relatedEvents: input.relatedEvents ? JSON.stringify(input.relatedEvents) : null,
        patterns: input.patterns ? JSON.stringify(input.patterns) : null,
        historicalComparisons: input.historicalComparisons ? JSON.stringify(input.historicalComparisons) : null,
        riskFactors: input.riskFactors ? JSON.stringify(input.riskFactors) : null,
        recommendedActions: input.recommendedActions ? JSON.stringify(input.recommendedActions) : null,
        engineVersion: input.engineVersion,
        apiContractVersion: input.apiContractVersion,
        generatedAt: input.generatedAt ? new Date(input.generatedAt) : new Date(),
        freshnessTimestamp: input.freshnessTimestamp ? new Date(input.freshnessTimestamp) : new Date(),
        provenance: input.provenance,
      }).returning();
      return result[0];
    }),

  // ─── Update recommendation status ───
  updateStatus: authedQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["active", "dismissed", "saved", "acted"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const orgId = ctx.user?.orgId;
      if (!orgId) return { success: false };

      await db.update(schema.recommendations)
        .set({ status: input.status })
        .where(and(
          eq(schema.recommendations.id, input.id),
          eq(schema.recommendations.organizationId, orgId),
        ));
      return { success: true };
    }),

  // ─── Summary stats ───
  summary: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const orgId = ctx.user?.orgId;
    if (!orgId) return { total: 0, byStatus: [], byType: [] };

    const total = await db.select({ count: sql<number>`count(*)` })
      .from(schema.recommendations)
      .where(eq(schema.recommendations.organizationId, orgId));

    const byStatus = await db.select({
      status: schema.recommendations.status,
      count: sql<number>`count(*)`,
    })
      .from(schema.recommendations)
      .where(eq(schema.recommendations.organizationId, orgId))
      .groupBy(schema.recommendations.status);

    const byType = await db.select({
      opportunityType: schema.recommendations.opportunityType,
      count: sql<number>`count(*)`,
      avgConfidence: sql<number>`avg(confidence)`,
    })
      .from(schema.recommendations)
      .where(eq(schema.recommendations.organizationId, orgId))
      .groupBy(schema.recommendations.opportunityType);

    return {
      total: total[0]?.count ?? 0,
      byStatus: byStatus.map((r: (typeof byStatus)[0]) => ({ status: r.status, count: r.count })),
      byType: byType.map((r: (typeof byType)[0]) => ({
        type: r.opportunityType,
        count: r.count,
        avgConfidence: Math.round((r.avgConfidence ?? 0) * 100),
      })),
    };
  }),
});

