/**
 * Customer Feedback Router — Build 110 / v1.1.0
 * Structured feedback collection with zero forwarding to Kestovar
 */

import { createRouter, protectedQuery } from "./middleware";
import { getDbFromContext } from "./queries/connection";
import { customerFeedback } from "../db/schema";
import { desc, eq, and } from "drizzle-orm";
import { z } from "zod";

const feedbackSchema = z.object({
  category: z.enum(["feature", "bug", "ux", "billing", "other"]),
  rating: z.number().min(1).max(5).optional(),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
  url: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
});

export const customerFeedbackRouter = createRouter({
  // ─── Submit feedback ───
  submit: protectedQuery
    .input(feedbackSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDbFromContext(ctx.env);
      const userId = ctx.user.id;
      const orgId = ctx.user.orgId ?? null;

      const [feedback] = await db
        .insert(customerFeedback)
        .values({
          userId,
          organizationId: orgId,
          category: input.category,
          rating: input.rating ?? null,
          title: input.title,
          body: input.body,
          url: input.url ?? null,
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        })
        .returning();

      return { success: true, feedback };
    }),

  // ─── List feedback for the user ───
  list: protectedQuery.query(async ({ ctx }) => {
    const db = getDbFromContext(ctx.env);
    const userId = ctx.user.id;

    const feedback = await db
      .select()
      .from(customerFeedback)
      .where(eq(customerFeedback.userId, userId))
      .orderBy(desc(customerFeedback.createdAt));

    return feedback;
  }),

  // ─── List all feedback (admin) ───
  listAll: protectedQuery.query(async ({ ctx }) => {
    // Only admin users can list all feedback
    if (!ctx.user.isAdmin) {
      throw new Error("Unauthorized: admin access required");
    }

    const db = getDbFromContext(ctx.env);
    const feedback = await db
      .select()
      .from(customerFeedback)
      .orderBy(desc(customerFeedback.createdAt))
      .limit(100);

    return feedback;
  }),

  // ─── Update feedback status ───
  updateStatus: protectedQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["open", "acknowledged", "resolved", "closed"]),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.isAdmin) {
        throw new Error("Unauthorized: admin access required");
      }

      const db = getDbFromContext(ctx.env);
      const [feedback] = await db
        .update(customerFeedback)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(customerFeedback.id, input.id))
        .returning();

      return feedback;
    }),
});

export type CustomerFeedbackRouter = typeof customerFeedbackRouter;
