/**
 * Recommendation Router — Build 110 / v1.1.0
 * Uses recommendations table with recommendationId column
 */

import { createRouter, protectedQuery } from "./middleware";
import { getDbFromContext } from "./queries/connection";
import { recommendations } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";

export const recommendationRouter = createRouter({
  // ─── List recommendations for user ───
  list: protectedQuery.query(async ({ ctx }) => {
    const db = getDbFromContext(ctx.env);
    const userId = ctx.user.id;

    const recs = await db
      .select()
      .from(recommendations)
      .where(eq(recommendations.userId, userId))
      .orderBy(desc(recommendations.createdAt))
      .limit(50);

    return recs.map((r) => ({
      ...r,
      metadata: r.metadata ? JSON.parse(r.metadata) : {},
    }));
  }),

  // ─── Get single recommendation ───
  get: protectedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDbFromContext(ctx.env);
      const userId = ctx.user.id;

      const [rec] = await db
        .select()
        .from(recommendations)
        .where(and(eq(recommendations.id, input.id), eq(recommendations.userId, userId)))
        .limit(1);

      if (!rec) throw new Error("Recommendation not found");

      return {
        ...rec,
        metadata: rec.metadata ? JSON.parse(rec.metadata) : {},
      };
    }),

  // ─── Update recommendation status ───
  updateStatus: protectedQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "accepted", "rejected", "implemented"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDbFromContext(ctx.env);
      const userId = ctx.user.id;

      const [rec] = await db
        .update(recommendations)
        .set({ status: input.status, updatedAt: new Date() })
        .where(and(eq(recommendations.id, input.id), eq(recommendations.userId, userId)))
        .returning();

      if (!rec) throw new Error("Recommendation not found");

      return rec;
    }),
});

export type RecommendationRouter = typeof recommendationRouter;
