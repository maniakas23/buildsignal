/**
 * BuildSignal v5.3 — Audit Log Router
 *
 * Durable audit logging with tenant-scoped queries.
 * All queries are scoped to the verified organization.
 * Client-supplied orgId is never trusted — uses D1-verified tenant context.
 */

import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { resolveTenant, auditLog } from "./lib/tenant";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const auditRouter = createRouter({
  // ─── List audit logs (tenant-scoped) ───
  list: adminQuery
    .input(z.object({
      userId: z.string().optional(),
      action: z.string().optional(),
      resource: z.string().optional(),
      limit: z.number().min(1).max(500).default(50),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ input, ctx }) => {
      const tenant = await resolveTenant(ctx);
      const db = getDb();

      try {
        // v5.3: Always scope to verified tenant orgId — never trust client-supplied orgId
        const conditions = [eq(schema.auditLogs.orgId, tenant.orgId)];

        if (input?.userId) conditions.push(eq(schema.auditLogs.userId, input.userId));
        if (input?.action) conditions.push(eq(schema.auditLogs.action, input.action));
        if (input?.resource) conditions.push(eq(schema.auditLogs.resource, input.resource));

        const logs = await db
          .select()
          .from(schema.auditLogs)
          .where(and(...conditions))
          .orderBy(desc(schema.auditLogs.timestamp))
          .limit(input?.limit || 50)
          .offset(input?.offset || 0);

        const countRow = await db
          .select({ count: sql<number>`count(*)` })
          .from(schema.auditLogs)
          .where(and(...conditions));

        return {
          logs,
          total: countRow[0]?.count || 0,
          orgId: tenant.orgId, // provenance: verified scope
        };
      } catch {
        return { logs: [], total: 0, orgId: tenant.orgId };
      }
    }),

  // ─── Summary stats (tenant-scoped) ───
  summary: adminQuery.query(async ({ ctx }) => {
    const tenant = await resolveTenant(ctx);
    const db = getDb();

    try {
      const totalEvents = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.auditLogs)
        .where(eq(schema.auditLogs.orgId, tenant.orgId));

      const today = new Date().toISOString().slice(0, 10);
      const todayEvents = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.auditLogs)
        .where(
          and(
            eq(schema.auditLogs.orgId, tenant.orgId),
            sql`${schema.auditLogs.timestamp} LIKE ${today + '%'}`
          )
        );

      return {
        totalEvents: totalEvents[0]?.count || 0,
        todayEvents: todayEvents[0]?.count || 0,
        orgId: tenant.orgId,
      };
    } catch {
      return { totalEvents: 0, todayEvents: 0, orgId: tenant.orgId };
    }
  }),

  // ─── Log a security event ───
  log: adminQuery
    .input(z.object({
      action: z.string(),
      resource: z.string(),
      resourceId: z.string().optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const tenant = await resolveTenant(ctx);
      await auditLog(ctx, tenant, input.action, input.resource, input.resourceId, input.metadata);
      return { success: true };
    }),
});

// ─── Feedback Queue Router (stub — operations moved to Kestovar Engine) ───
export const feedbackQueueRouter = createRouter({
  list: adminQuery.query(async ({ ctx }) => {
    const tenant = await resolveTenant(ctx);
    return { status: "UNAVAILABLE" as const, items: [], orgId: tenant.orgId, message: "Feedback queue managed by Kestovar Engine" };
  }),

  process: adminQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx }) => {
      const tenant = await resolveTenant(ctx);
      await auditLog(ctx, tenant, "feedbackQueue.process", "feedback");
      return { status: "UNAVAILABLE" as const, success: false, message: "Processing handled by Kestovar Engine" };
    }),
});
