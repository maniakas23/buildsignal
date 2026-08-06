/**
 * Alert Router — Sprint 4
 * User-configurable intelligence alerts with real-time matching
 */

import { createRouter, protectedQuery } from "./middleware";
import { getDbFromContext } from "./queries/connection";
import { intelligenceAlerts } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

const alertSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(["system", "watchlist", "provider", "custom"]).default("custom"),
  conditions: z.object({
    field: z.string(),
    operator: z.enum(["eq", "ne", "gt", "lt", "contains", "starts_with", "ends_with"]),
    value: z.string(),
  }).array().min(1),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  active: z.boolean().default(true),
});

export const alertRouter = createRouter({
  // ─── List all alerts for the user ───
  list: protectedQuery.query(async ({ ctx }) => {
    const db = getDbFromContext(ctx.env);
    const userId = ctx.user.id;

    const alerts = await db
      .select()
      .from(intelligenceAlerts)
      .where(eq(intelligenceAlerts.userId, userId))
      .orderBy(desc(intelligenceAlerts.createdAt));

    return alerts.map((alert) => ({
      ...alert,
      conditions: JSON.parse(alert.conditions),
    }));
  }),

  // ─── Create a new alert ───
  create: protectedQuery
    .input(alertSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDbFromContext(ctx.env);
      const userId = ctx.user.id;

      const [alert] = await db
        .insert(intelligenceAlerts)
        .values({
          userId,
          name: input.name,
          description: input.description,
          type: input.type,
          conditions: JSON.stringify(input.conditions),
          severity: input.severity,
          active: input.active,
        })
        .returning();

      return {
        ...alert,
        conditions: JSON.parse(alert.conditions),
      };
    }),

  // ─── Update an alert ───
  update: protectedQuery
    .input(z.object({
      id: z.number(),
      ...alertSchema.partial().shape,
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDbFromContext(ctx.env);
      const userId = ctx.user.id;
      const { id, ...updates } = input;

      const values: any = { updatedAt: new Date() };
      if (updates.name) values.name = updates.name;
      if (updates.description !== undefined) values.description = updates.description;
      if (updates.type) values.type = updates.type;
      if (updates.conditions) values.conditions = JSON.stringify(updates.conditions);
      if (updates.severity) values.severity = updates.severity;
      if (updates.active !== undefined) values.active = updates.active;

      const [alert] = await db
        .update(intelligenceAlerts)
        .set(values)
        .where(and(eq(intelligenceAlerts.id, id), eq(intelligenceAlerts.userId, userId)))
        .returning();

      if (!alert) throw new Error("Alert not found or not owned by user");

      return {
        ...alert,
        conditions: JSON.parse(alert.conditions),
      };
    }),

  // ─── Delete an alert ───
  delete: protectedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDbFromContext(ctx.env);
      const userId = ctx.user.id;

      await db
        .delete(intelligenceAlerts)
        .where(and(eq(intelligenceAlerts.id, input.id), eq(intelligenceAlerts.userId, userId)));

      return { success: true };
    }),

  // ─── Test alert conditions (simulation) ───
  test: protectedQuery
    .input(z.object({
      conditions: alertSchema.shape.conditions,
    }))
    .query(async ({ ctx, input }) => {
      // Simulate condition matching against recent data
      // In production, this would query the actual dataset
      return {
        matched: 0,
        sample: [],
        conditions: input.conditions,
      };
    }),
});

export type AlertRouter = typeof alertRouter;
