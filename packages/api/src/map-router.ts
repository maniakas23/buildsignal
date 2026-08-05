import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const mapRouter = createRouter({
  counties: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(schema.counties).orderBy(desc(schema.counties.permitVolume));
  }),

  countyDetail: publicQuery
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
