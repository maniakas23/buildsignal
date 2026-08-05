import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { desc } from "drizzle-orm";

export const pipelineRouter = createRouter({
  status: publicQuery.query(async () => {
    const db = getDb();
    const all = await db.select().from(schema.dataSources);
    const active = all.filter((d: { status: string }) => d.status === "active").length;
    const total = all.length;
    const avgLatency = all.length > 0
      ? Math.round(all.reduce((s: number, d: { latencyMs: number | null }) => s + (d.latencyMs ?? 0), 0) / all.length)
      : 0;
    return { total, active, degraded: total - active, avgLatency, sources: all };
  }),
});
