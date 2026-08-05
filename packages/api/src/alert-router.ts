/**
 * Alert Router — BuildSignal v5.4.7
 * Bidirectional alert system:
 *   - Receives alerts from Kestovar Engine (webhook)
 *   - Stores BuildSignal-generated alerts (provider failures, data freshness, etc.)
 *   - Organization-scoped delivery with acknowledgment tracking
 */

import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// Use intelligenceAlerts table — the 'alerts' table already exists with a different schema (user watchlist alerts)
const alertsTable = schema.intelligenceAlerts;

export const alertRouter = createRouter({
  // ─── List alerts for an organization ───
  list: authedQuery
    .input(z.object({
      severity: z.string().optional(),
      type: z.string().optional(),
      acknowledged: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(50),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const orgId = ctx.user?.orgId;
      if (!orgId) return { alerts: [], total: 0 };

      const conditions = [
        eq(alertsTable.organizationId, orgId),
      ];
      if (input?.severity) conditions.push(eq(alertsTable.severity, input.severity));
      if (input?.type) conditions.push(eq(alertsTable.type, input.type));
      if (input?.acknowledged !== undefined) {
        conditions.push(eq(alertsTable.acknowledged, input.acknowledged));
      }

      const rows = await db.select().from(alertsTable)
        .where(and(...conditions))
        .orderBy(desc(alertsTable.createdAt))
        .limit(input?.limit || 50);

      const totalResult = await db.select({ count: sql<number>`count(*)` })
        .from(alertsTable)
        .where(eq(alertsTable.organizationId, orgId));

      return {
        alerts: rows.map((r: (typeof rows)[0]) => ({
          ...r,
          metadata: r.metadata ? JSON.parse(r.metadata) : null,
        })),
        total: totalResult[0]?.count ?? 0,
      };
    }),

  // ─── Get a single alert ───
  get: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const orgId = ctx.user?.orgId;
      if (!orgId) return null;

      const row = await db.select().from(alertsTable)
        .where(and(
          eq(alertsTable.id, input.id),
          eq(alertsTable.organizationId, orgId),
        ))
        .get();

      if (!row) return null;
      return {
        ...row,
        metadata: row.metadata ? JSON.parse(row.metadata) : null,
      };
    }),

  // ─── Receive alert from Kestovar (webhook/internal) ───
  // Used by the Kestovar → BuildSignal alert ingestion endpoint
  receive: adminQuery
    .input(z.object({
      alertId: z.string(),
      organizationId: z.number(),
      type: z.enum([
        "recommendation",
        "anomaly",
        "pattern_change",
        "dependency_warning",
        "kg_change",
        "supervisor_action",
      ]),
      severity: z.enum(["critical", "standard", "low"]),
      title: z.string(),
      message: z.string(),
      recommendationId: z.string().optional(),
      patternId: z.string().optional(),
      confidence: z.number().optional(),
      metadata: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(alertsTable).values({
        alertId: input.alertId,
        organizationId: input.organizationId,
        type: input.type,
        source: "kestovar",
        severity: input.severity,
        title: input.title,
        message: input.message,
        recommendationId: input.recommendationId,
        patternId: input.patternId,
        confidence: input.confidence,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      }).returning();
      return result[0];
    }),

  // ─── Create internal alert (provider failure, data freshness, etc.) ───
  createInternal: adminQuery
    .input(z.object({
      alertId: z.string(),
      organizationId: z.number().optional(),
      type: z.enum([
        "provider_failure",
        "data_freshness",
        "ingestion_anomaly",
        "feedback_quality",
        "cross_source_conflict",
      ]),
      severity: z.enum(["critical", "standard", "low"]),
      title: z.string(),
      message: z.string(),
      metadata: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(alertsTable).values({
        alertId: input.alertId,
        organizationId: input.organizationId ?? null,
        type: input.type,
        source: "buildsignal",
        severity: input.severity,
        title: input.title,
        message: input.message,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      }).returning();
      return result[0];
    }),

  // ─── Acknowledge an alert ───
  acknowledge: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const orgId = ctx.user?.orgId;
      if (!orgId) return { success: false };

      await db.update(alertsTable)
        .set({ acknowledged: true, acknowledgedAt: new Date() })
        .where(and(
          eq(alertsTable.id, input.id),
          eq(alertsTable.organizationId, orgId),
        ));
      return { success: true };
    }),

  // ─── Summary ───
  summary: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const orgId = ctx.user?.orgId;
    if (!orgId) return { total: 0, critical: 0, unacknowledged: 0, byType: [] };

    const total = await db.select({ count: sql<number>`count(*)` })
      .from(alertsTable)
      .where(eq(alertsTable.organizationId, orgId));

    const critical = await db.select({ count: sql<number>`count(*)` })
      .from(alertsTable)
      .where(and(
        eq(alertsTable.organizationId, orgId),
        eq(alertsTable.severity, "critical"),
      ));

    const unacknowledged = await db.select({ count: sql<number>`count(*)` })
      .from(alertsTable)
      .where(and(
        eq(alertsTable.organizationId, orgId),
        eq(alertsTable.acknowledged, false),
      ));

    const byType = await db.select({
      type: alertsTable.type,
      count: sql<number>`count(*)`,
    })
      .from(alertsTable)
      .where(eq(alertsTable.organizationId, orgId))
      .groupBy(alertsTable.type);

    return {
      total: total[0]?.count ?? 0,
      critical: critical[0]?.count ?? 0,
      unacknowledged: unacknowledged[0]?.count ?? 0,
      byType: byType.map((r: (typeof byType)[0]) => ({ type: r.type, count: r.count })),
    };
  }),
});

