import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { eq, and } from "drizzle-orm";

export const geographicRouter = createRouter({
  counties: publicQuery
    .input(
      z.object({
        state: z.string().optional(),
        limit: z.number().min(1).max(500).default(100),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      if (input.state) {
        return db
          .select()
          .from(schema.counties)
          .where(eq(schema.counties.state, input.state))
          .limit(input.limit);
      }
      return db.select().from(schema.counties).limit(input.limit);
    }),

  countyByFips: publicQuery
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
