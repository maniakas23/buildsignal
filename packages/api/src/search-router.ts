import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { like, desc } from "drizzle-orm";

export const searchRouter = createRouter({
  opportunities: publicQuery
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(schema.opportunities)
        .where(like(schema.opportunities.title, `%${input.query}%`))
        .limit(input.limit)
        .orderBy(desc(schema.opportunities.createdAt));
    }),

  counties: publicQuery
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(schema.counties)
        .where(like(schema.counties.name, `%${input.query}%`))
        .limit(input.limit);
    }),
});
