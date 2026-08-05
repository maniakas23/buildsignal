import { t, publicQuery, authedQuery } from "./router";
import { z } from "zod";
import { recommendations } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";

export const recommendationRouter = t.router({
  list: publicQuery
    .input(
      z.object({
        status: z.enum(["new", "saved", "dismissed", "acted"]).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input?.status) conditions.push(eq(recommendations.status, input.status));

      const recs = await ctx.db
        .select()
        .from(recommendations)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(recommendations.confidence))
        .limit(input?.limit || 50)
        .offset(input?.offset || 0);

      return { recommendations: recs };
    }),

  summary: publicQuery.query(async ({ ctx }) => {
    const allRecs = await ctx.db.select().from(recommendations);
    const new_ = allRecs.filter((r) => r.status === "new").length;
    const saved = allRecs.filter((r) => r.status === "saved").length;
    const dismissed = allRecs.filter((r) => r.status === "dismissed").length;
    const acted = allRecs.filter((r) => r.status === "acted").length;

    return { total: allRecs.length, new: new_, saved, dismissed, acted };
  }),

  save: authedQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(recommendations)
        .set({ status: "saved" })
        .where(eq(recommendations.id, input.id));
      return { success: true };
    }),

  dismiss: authedQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(recommendations)
        .set({ status: "dismissed" })
        .where(eq(recommendations.id, input.id));
      return { success: true };
    }),

  act: authedQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(recommendations)
        .set({ status: "acted" })
        .where(eq(recommendations.id, input.id));
      return { success: true };
    }),
});
