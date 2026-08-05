import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const providerRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(schema.dataSources).orderBy(desc(schema.dataSources.lastUpdated));
  }),

  status: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(schema.dataSources)
        .where(eq(schema.dataSources.id, input.id))
        .limit(1);
      return rows.at(0) ?? null;
    }),
});
