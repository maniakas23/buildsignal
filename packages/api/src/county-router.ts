import { t, publicQuery, authedQuery } from "./router";
import { z } from "zod";
import { counties } from "../db/schema";
import { eq, desc, and, like } from "drizzle-orm";

export const countyRouter = t.router({
  list: publicQuery
    .input(
      z.object({
        state: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(500).default(100),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input?.state) conditions.push(eq(counties.state, input.state));
      if (input?.search) conditions.push(like(counties.name, `%${input.search}%`));

      const results = await ctx.db
        .select()
        .from(counties)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(counties.signalScore))
        .limit(input?.limit || 100)
        .offset(input?.offset || 0);

      return { counties: results };
    }),

  get: publicQuery
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(counties)
        .where(eq(counties.id, input.id))
        .limit(1);
      return result[0] || null;
    }),

  byState: publicQuery
    .input(z.object({ state: z.string() }))
    .query(async ({ ctx, input }) => {
      const results = await ctx.db
        .select()
        .from(counties)
        .where(eq(counties.state, input.state))
        .orderBy(desc(counties.signalScore));
      return { counties: results };
    }),

  top: publicQuery
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const results = await ctx.db
        .select()
        .from(counties)
        .orderBy(desc(counties.signalScore))
        .limit(input?.limit || 10);
      return { counties: results };
    }),
});
