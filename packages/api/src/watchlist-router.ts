import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const watchlistRouter = createRouter({
  list: authedQuery
    .input(z.object({ userId: z.number() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const uid = input?.userId ?? 1;
      return db
        .select()
        .from(schema.watchlists)
        .where(eq(schema.watchlists.userId, uid))
        .orderBy(desc(schema.watchlists.createdAt));
    }),

  create: authedQuery
    .input(z.object({ name: z.string(), userId: z.number(), counties: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(schema.watchlists).values({
        name: input.name,
        userId: input.userId,
        counties: JSON.stringify(input.counties),
      });
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schema.watchlists).where(eq(schema.watchlists.id, input.id));
      return { success: true };
    }),
});
