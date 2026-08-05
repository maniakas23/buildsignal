import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const notificationsRouter = createRouter({
  list: authedQuery
    .input(z.object({ userId: z.number() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const uid = input?.userId ?? 1;
      return db
        .select()
        .from(schema.notifications)
        .where(eq(schema.notifications.userId, uid))
        .orderBy(desc(schema.notifications.createdAt))
        .limit(50);
    }),

  unreadCount: authedQuery
    .input(z.object({ userId: z.number() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const uid = input?.userId ?? 1;
      const all = await db
        .select()
        .from(schema.notifications)
        .where(eq(schema.notifications.userId, uid));
      return { count: all.filter((n: { read: boolean }) => !n.read).length };
    }),

  markRead: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(schema.notifications)
        .set({ read: true })
        .where(eq(schema.notifications.id, input.id));
      return { success: true };
    }),
});
