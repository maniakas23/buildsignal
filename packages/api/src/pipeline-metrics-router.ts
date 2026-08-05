import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { desc } from "drizzle-orm";

export const pipelineMetricsRouter = createRouter({
  summary: publicQuery.query(async () => {
    const db = getDb();
    const all = await db.select().from(schema.dataSources);
    const active = all.filter((d: { status: string }) => d.status === "active").length;
    const total = all.length;
    const avgLatency = all.length > 0
      ? Math.round(all.reduce((s: number, d: { latencyMs: number | null }) => s + (d.latencyMs ?? 0), 0) / all.length)
      : 0;
    return { total, active, degraded: total - active, avgLatency };
  }),

  sources: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(schema.dataSources).orderBy(desc(schema.dataSources.lastUpdated));
  }),
});
