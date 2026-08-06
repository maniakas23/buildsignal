/**
 * Export Router — Sprint 4
 * Data export jobs: CSV, JSON, XLSX with R2 storage
 */

import { createRouter, protectedQuery } from "./middleware";
import { getDbFromContext } from "./queries/connection";
import { exportJobs } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const exportSchema = z.object({
  name: z.string().min(1).max(200),
  format: z.enum(["csv", "json", "xlsx"]),
  entityType: z.enum(["opportunities", "counties", "providers", "recommendations", "watchlists"]),
  filters: z.record(z.any()).optional(),
});

export const exportRouter = createRouter({
  // ─── Create export job ───
  create: protectedQuery
    .input(exportSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDbFromContext(ctx.env);
      const userId = ctx.user.id;
      const orgId = ctx.user.orgId ?? null;

      const [job] = await db
        .insert(exportJobs)
        .values({
          userId,
          orgId,
          name: input.name,
          format: input.format,
          entityType: input.entityType,
          filters: input.filters ? JSON.stringify(input.filters) : null,
        })
        .returning();

      return { success: true, job };
    }),

  // ─── List export jobs ───
  list: protectedQuery.query(async ({ ctx }) => {
    const db = getDbFromContext(ctx.env);
    const userId = ctx.user.id;

    const jobs = await db
      .select()
      .from(exportJobs)
      .where(eq(exportJobs.userId, userId))
      .orderBy(desc(exportJobs.createdAt))
      .limit(50);

    return jobs;
  }),

  // ─── Get export job status ───
  get: protectedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDbFromContext(ctx.env);
      const userId = ctx.user.id;

      const [job] = await db
        .select()
        .from(exportJobs)
        .where(eq(exportJobs.id, input.id))
        .limit(1);

      if (!job || job.userId !== userId) {
        throw new Error("Export job not found");
      }

      return job;
    }),

  // ─── Cancel export job ───
  cancel: protectedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDbFromContext(ctx.env);
      const userId = ctx.user.id;

      const [job] = await db
        .update(exportJobs)
        .set({ status: "cancelled" })
        .where(eq(exportJobs.id, input.id))
        .returning();

      if (!job || job.userId !== userId) {
        throw new Error("Export job not found");
      }

      return { success: true };
    }),
});

export type ExportRouter = typeof exportRouter;
