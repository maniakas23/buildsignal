/**
 * Pipeline Router — Build 110 / v1.1.0
 * Stub: queries D1 directly for real data, zero simulated metrics
 */

import { createRouter, publicQuery } from "./middleware";
import { getDbFromContext } from "./queries/connection";
import { signalcoreEvents, signalcoreProviders, signalcorePatterns } from "../db/schema";
import { count, sql, desc } from "drizzle-orm";

export const pipelineRouter = createRouter({
  // ─── Opportunities feed (from D1) ───
  feed: publicQuery.query(async ({ ctx }) => {
    const db = getDbFromContext(ctx.env);

    const events = await db
      .select()
      .from(signalcoreEvents)
      .orderBy(desc(signalcoreEvents.ingestedAt))
      .limit(50);

    return {
      events: events.map((e) => ({
        ...e,
        rawData: e.rawData ? JSON.parse(e.rawData) : null,
        normalizedData: e.normalizedData ? JSON.parse(e.normalizedData) : null,
      })),
      total: events.length,
      updatedAt: new Date().toISOString(),
    };
  }),

  // ─── Pipeline telemetry (from D1) ───
  telemetry: publicQuery.query(async ({ ctx }) => {
    const db = getDbFromContext(ctx.env);

    const [eventCount] = await db.select({ count: count() }).from(signalcoreEvents);
    const [providerCount] = await db.select({ count: count() }).from(signalcoreProviders);
    const [patternCount] = await db.select({ count: count() }).from(signalcorePatterns);

    return {
      eventsIngested: eventCount?.count ?? 0,
      providersActive: providerCount?.count ?? 0,
      patternsDetected: patternCount?.count ?? 0,
      avgLatencyMs: 0,
      errorRate: 0,
      updatedAt: new Date().toISOString(),
    };
  }),

  // ─── Provider status (from D1) ───
  providers: publicQuery.query(async ({ ctx }) => {
    const db = getDbFromContext(ctx.env);

    const providers = await db
      .select()
      .from(signalcoreProviders)
      .limit(100);

    return {
      providers: providers.map((p) => ({
        ...p,
        config: p.config ? JSON.parse(p.config) : null,
      })),
      total: providers.length,
      updatedAt: new Date().toISOString(),
    };
  }),

  // ─── Metrics (zero-initialized) ───
  metrics: publicQuery.query(async () => {
    return {
      totalRecordsProcessed: 0,
      totalRecordsAccepted: 0,
      totalRecordsRejected: 0,
      avgProcessingTimeMs: 0,
      queueDepth: 0,
      updatedAt: new Date().toISOString(),
    };
  }),
});

export type PipelineRouter = typeof pipelineRouter;
