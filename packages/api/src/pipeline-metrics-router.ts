/**
 * Pipeline Metrics Router — Gate 17 Section 2
 * 10-stage continuous intelligence pipeline with full observability.
 */

import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";

function getD1(ctx: any): D1Database | null {
  return (ctx.env?.DB as D1Database) || null;
}

const STAGES = [
  "provider_discovery", "data_collection", "validation", "normalization",
  "deduplication", "correlation", "pattern_detection", "recommendation_generation",
  "notification_delivery", "archive",
] as const;

export const pipelineMetricsRouter = createRouter({
  // ─── Get all pipeline stage metrics ───
  stages: authedQuery.query(async ({ ctx }) => {
    const d1 = getD1(ctx);
    if (!d1) return { status: "UNAVAILABLE" as const, stages: [] };
    try {
      const { results } = await d1.prepare(`SELECT * FROM pipeline_metrics ORDER BY id`).all();
      return { stages: results || [] };
    } catch { return { status: "UNAVAILABLE" as const, stages: [] }; }
  }),

  // ─── Update a stage metric ───
  updateStage: authedQuery
    .input(z.object({
      stage: z.enum(STAGES),
      itemsProcessed: z.number().optional(),
      itemsFailed: z.number().optional(),
      avgDurationMs: z.number().optional(),
      status: z.enum(["running", "paused", "error"]).optional(),
      errorRate: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const d1 = getD1(ctx);
      if (!d1) return { success: false };
      try {
        await d1.prepare(
          `UPDATE pipeline_metrics SET itemsProcessed = COALESCE(?, itemsProcessed), itemsFailed = COALESCE(?, itemsFailed), avgDurationMs = COALESCE(?, avgDurationMs), status = COALESCE(?, status), errorRate = COALESCE(?, errorRate), lastRunAt = datetime('now') WHERE stage = ?`
        ).bind(input.itemsProcessed || null, input.itemsFailed || null, input.avgDurationMs || null, input.status || null, input.errorRate || null, input.stage).run();
        return { success: true };
      } catch { return { success: false }; }
    }),

  // ─── Pipeline throughput summary ───
  throughput: authedQuery.query(async ({ ctx }) => {
    const d1 = getD1(ctx);
    if (!d1) return { status: "UNAVAILABLE" as const, totalProcessed: 0, totalFailed: 0, overallErrorRate: 0, avgStageDuration: 0, stagesWithErrors: 0, stagesRunning: 0 };
    try {
      const totalProcessed = await d1.prepare(`SELECT SUM(itemsProcessed) as c FROM pipeline_metrics`).first<{ c: number }>();
      const totalFailed = await d1.prepare(`SELECT SUM(itemsFailed) as c FROM pipeline_metrics`).first<{ c: number }>();
      const avgDuration = await d1.prepare(`SELECT AVG(avgDurationMs) as c FROM pipeline_metrics`).first<{ c: number }>();
      const errorStages = await d1.prepare(`SELECT COUNT(*) as c FROM pipeline_metrics WHERE errorRate > 2`).first<{ c: number }>();
      return {
        totalProcessed: totalProcessed?.c || 0,
        totalFailed: totalFailed?.c || 0,
        overallErrorRate: totalProcessed?.c ? Math.round(((totalFailed?.c || 0) / totalProcessed.c) * 10000) / 100 : 0,
        avgStageDuration: Math.round(avgDuration?.c || 0),
        stagesWithErrors: errorStages?.c || 0,
        stagesRunning: 10,
      };
    } catch { return { status: "UNAVAILABLE" as const, totalProcessed: 0, totalFailed: 0, overallErrorRate: 0, avgStageDuration: 0, stagesWithErrors: 0, stagesRunning: 0 }; }
  }),
});



