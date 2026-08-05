import { t, publicQuery, authedQuery } from "./router";
import { z } from "zod";
import { customerFeedback } from "../db/schema";
import { eq, desc } from "drizzle-orm";

export const customerFeedbackRouter = t.router({
  list: publicQuery.query(async ({ ctx }) => {
    const feedback = await ctx.db
      .select()
      .from(customerFeedback)
      .orderBy(desc(customerFeedback.createdAt))
      .limit(50);
    return { feedback };
  }),

  create: authedQuery
    .input(
      z.object({
        recommendationId: z.string().optional(),
        rating: z.number().min(1).max(5).optional(),
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = crypto.randomUUID();
      await ctx.db.insert(customerFeedback).values({
        id,
        userId: ctx.user.id,
        recommendationId: input.recommendationId || null,
        rating: input.rating || null,
        comment: input.comment || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { id };
    }),
});
