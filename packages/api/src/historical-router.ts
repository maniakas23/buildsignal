import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const historicalRouter = createRouter({
  patterns: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(schema.patterns).orderBy(desc(schema.patterns.createdAt));
  }),

  patternDetail: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(schema.patterns)
        .where(eq(schema.patterns.id, input.id))
        .limit(1);
      return rows.at(0) ?? null;
    }),
});
