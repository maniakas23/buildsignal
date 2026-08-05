/**
 * Provider Router — Build 105
 * Exposes data source provider health and coverage metrics.
 */

import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";

function getDb(ctx: { env?: Record<string, unknown> }) {
  return ctx.env?.DB as D1Database | undefined;
}

export const providerRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb(ctx);
    if (!db) return [];
    const rows = await db.prepare(
      `SELECT name, type, status, last_sync_at, coverage_pct,
              records_count, error_rate, latency_ms
       FROM data_providers
       ORDER BY status DESC, name ASC`
    ).all();

    return (rows.results ?? []).map((r) => ({
      name: String(r.name),
      type: String(r.type),
      status: String(r.status) as "active" | "degraded" | "down",
      lastSync: r.last_sync_at ? new Date(String(r.last_sync_at)).toISOString() : null,
      coverage: Number(r.coverage_pct),
      records: Number(r.records_count),
      errorRate: Number(r.error_rate),
      latencyMs: Number(r.latency_ms),
    }));
  }),

  summary: authedQuery.query(async ({ ctx }) => {
    const db = getDb(ctx);
    if (!db) return { total: 0, active: 0, degraded: 0 };
    const total = await db.prepare(`SELECT COUNT(*) as c FROM data_providers`).first<{ c: number }>();
    const active = await db.prepare(`SELECT COUNT(*) as c FROM data_providers WHERE status = 'active'`).first<{ c: number }>();
    return {
      total: Number(total?.c ?? 0),
      active: Number(active?.c ?? 0),
      degraded: Number(total?.c ?? 0) - Number(active?.c ?? 0),
    };
  }),

  coverage: authedQuery.query(async ({ ctx }) => {
    const db = getDb(ctx);
    if (!db) return [];
    const rows = await db.prepare(
      `SELECT source_type, COUNT(*) as count, AVG(coverage_pct) as avg_coverage
       FROM data_providers GROUP BY source_type`
    ).all();
    return (rows.results ?? []).map((r) => ({
      sourceType: String(r.source_type),
      count: Number(r.count),
      avgCoverage: Math.round(Number(r.avg_coverage)),
    }));
  }),

  stats: authedQuery.query(async ({ ctx }) => {
    const db = getDb(ctx);
    if (!db) return { totalRecords: 0, avgLatencyMs: 0, providers: [] };
    const totalRecords = await db.prepare(`SELECT SUM(records_count) as total FROM data_providers`).first<{ total: number }>();
    const avgLatency = await db.prepare(`SELECT AVG(latency_ms) as avg FROM data_providers`).first<{ avg: number }>();
    return {
      totalRecords: Number(totalRecords?.total ?? 0),
      avgLatencyMs: Math.round(Number(avgLatency?.avg ?? 0)),
      providers: [],
    };
  }),

  health: authedQuery.query(async ({ ctx }) => {
    const db = getDb(ctx);
    if (!db) return [];
    const rows = await db.prepare(`SELECT name, status, error_rate, latency_ms FROM data_providers ORDER BY name`).all();
    return (rows.results ?? []).map((r) => ({
      name: String(r.name),
      status: String(r.status),
      errorRate: Number(r.error_rate),
      latencyMs: Number(r.latency_ms),
    }));
  }),
});

