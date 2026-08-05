import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const countyRouter = createRouter({
  list: publicQuery
    .input(z.object({ state: z.string().optional(), limit: z.number().min(1).max(500).default(100) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      if (input?.state) {
        return db
          .select()
          .from(schema.counties)
          .where(eq(schema.counties.state, input.state))
          .limit(input.limit || 100);
      }
      return db.select().from(schema.counties).limit(input?.limit || 100);
    }),

  detail: publicQuery
    .input(z.object({ fips: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(schema.counties)
        .where(eq(schema.counties.fips, input.fips))
        .limit(1);
      return rows.at(0) ?? null;
    }),
});
