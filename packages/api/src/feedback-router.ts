import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { desc } from "drizzle-orm";

export const feedbackRouter = createRouter({
  submit: publicQuery
    .input(
      z.object({
        type: z.enum(["general", "bug", "feature_request", "data_issue", "praise", "county_request", "other"]),
        message: z.string().min(1),
        rating: z.number().min(1).max(5).optional(),
        page: z.string().optional(),
        userId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(schema.feedback).values({
        type: input.type,
        message: input.message,
        rating: input.rating ?? null,
        page: input.page ?? null,
        userId: input.userId ?? null,
      });
      return { success: true };
    }),

  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(schema.feedback).orderBy(desc(schema.feedback.createdAt)).limit(100);
  }),
});
