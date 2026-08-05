import { t, publicQuery, authedQuery } from "./router";
import { z } from "zod";
import { watchlists, watchlistItems } from "../db/schema";
import { eq, desc } from "drizzle-orm";

export const watchlistRouter = t.router({
  list: authedQuery.query(async ({ ctx }) => {
    const lists = await ctx.db
      .select()
      .from(watchlists)
      .where(eq(watchlists.userId, ctx.user.id))
      .orderBy(desc(watchlists.createdAt));
    return { watchlists: lists };
  }),

  create: authedQuery
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const id = crypto.randomUUID();
      await ctx.db.insert(watchlists).values({
        id,
        userId: ctx.user.id,
        name: input.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { id };
    }),

  items: authedQuery
    .input(z.object({ watchlistId: z.string() }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.db
        .select()
        .from(watchlistItems)
        .where(eq(watchlistItems.watchlistId, input.watchlistId))
        .orderBy(desc(watchlistItems.createdAt));
      return { items };
    }),

  addItem: authedQuery
    .input(z.object({ watchlistId: z.string(), countyId: z.string(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const id = crypto.randomUUID();
      await ctx.db.insert(watchlistItems).values({
        id,
        watchlistId: input.watchlistId,
        countyId: input.countyId,
        notes: input.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { id };
    }),
});
