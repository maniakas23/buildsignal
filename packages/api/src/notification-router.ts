import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const notificationRouter = createRouter({
  list: authedQuery.query(async () => {
    const db = getDb();
    return db.select().from(schema.alerts).orderBy(desc(schema.alerts.createdAt)).limit(50);
  }),

  markRead: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(schema.alerts)
        .set({ isRead: true })
        .where(eq(schema.alerts.id, input.id));
      return { success: true };
    }),
});
