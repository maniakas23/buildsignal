import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const learningLoopRouter = createRouter({
  status: publicQuery.query(async () => {
    const db = getDb();
    const patterns = await db.select().from(schema.patterns).orderBy(desc(schema.patterns.createdAt)).limit(5);
    return {
      activePatterns: patterns.length,
      latestPattern: patterns[0] ?? null,
      confidenceTrend: [70, 72, 75, 78, 80],
    };
  }),

  patterns: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(schema.patterns).orderBy(desc(schema.patterns.createdAt)).limit(20);
  }),
});
