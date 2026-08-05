/**
 * Data Governance Router — v3 (Engine-Proxy)
 *
 * All event/provider data is fetched from Kestovar Engine via service binding.
 * Audit logging uses BuildSignal's local D1 (data_audit_log table).
 */

import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getEngineProxy } from "./lib/engine-proxy";

function getD1(ctx: any): D1Database | null {
  return (ctx.env?.DB as D1Database) || null;
}

export const dataGovernanceRouter = createRouter({
  lineage: adminQuery
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const engine = getEngineProxy(ctx.env ?? {});
        // Fetch the event from Engine
        const result = await engine.call("live.signals", { limit: 1000 });
        const events = (result as any)?.signals || [];
        const event = events.find((e: any) => e.id === input.eventId || e.event_id === input.eventId);
        if (!event) return { status: "UNAVAILABLE" as const, lineage: { eventId: input.eventId, provider: "Unknown", eventType: "unknown", ingestionChain: [], recommendations: [], retention: { category: "intelligence_events", retentionYears: 10, scheduledDeletion: null } } };

        // Fetch related recommendations
        const recResult = await engine.call("recommendation.list", { limit: 500 });
        const recs = (result as any)?.recommendations || [];
        const usedIn = recs.filter((r: any) => {
          const rationale = (r.rationale || "").toLowerCase();
          const summary = (r.summary || "").toLowerCase();
          const eventTitle = (event.title || event.name || "").toLowerCase();
          return rationale.includes(eventTitle) || summary.includes(eventTitle);
        });

        return {
          lineage: {
            eventId: input.eventId,
            provider: event.data_source || event.source || "Unknown",
            eventType: event.event_type || "unknown",
            ingestionChain: [
              { stage: "raw_collection", timestamp: event.ingested_at || new Date().toISOString(), source: event.data_source || "API" },
              { stage: "normalization", timestamp: event.ingested_at || new Date().toISOString(), source: "Kestovar Engine" },
              { stage: "pattern_matching", timestamp: event.ingested_at || new Date().toISOString(), source: "Pattern Engine" },
            ],
            recommendations: usedIn.map((r: any) => r.id),
            retention: { category: "intelligence_events", retentionYears: 10, scheduledDeletion: null },
          },
        };
      } catch { return { status: "UNAVAILABLE" as const, lineage: { eventId: input.eventId, provider: "Unknown", eventType: "unknown", ingestionChain: [], recommendations: [], retention: { category: "intelligence_events", retentionYears: 10, scheduledDeletion: null } } }; }
    }),

  auditLog: adminQuery
    .input(z.object({ entityType: z.string().optional(), action: z.string().optional(), days: z.number().default(30), limit: z.number().default(100) }).optional())
    .query(async ({ input, ctx }) => {
      const d1 = getD1(ctx);
      if (!d1) return { status: "UNAVAILABLE" as const, entries: [] };
      try {
        const days = Math.min(Math.max(input?.days || 30, 1), 365);
        let sql = `SELECT * FROM data_audit_log WHERE timestamp >= datetime('now', ?)`;
        const params: (string | number)[] = [`-${days} days`];
        if (input?.entityType) { sql += ` AND entityType = ?`; params.push(input.entityType); }
        if (input?.action) { sql += ` AND action = ?`; params.push(input.action); }
        sql += ` ORDER BY timestamp DESC LIMIT ?`; params.push(input?.limit || 100);
        const { results } = await d1.prepare(sql).bind(...params).all();
        return { entries: results || [] };
      } catch { return { status: "UNAVAILABLE" as const, entries: [] }; }
    }),

  report: adminQuery.query(async ({ ctx }) => {
    try {
      const engine = getEngineProxy(ctx.env ?? {});
      const [eventResult, providerResult, patternResult] = await Promise.all([
        engine.call("live.signals", { limit: 5000 }),
        engine.call("provider.list", {}),
        engine.call("pattern.list", {}),
      ]);

      const events = (eventResult as any)?.signals || [];
      const providers = (providerResult as any)?.providers || [];
      const patterns = (patternResult as any)?.patterns || [];

      const validatedEvents = events.filter((e: any) => (e.status || "") === "validated").length;

      return {
        totalEvents: events.length,
        totalProviders: providers.length,
        totalPatterns: patterns.length,
        validatedEvents,
        sourceBreakdown: Object.entries(
          providers.reduce((acc: Record<string, number>, p: any) => {
            const t = p.type || "unknown";
            acc[t] = (acc[t] || 0) + 1;
            return acc;
          }, {})
        ).map(([type, count]) => ({ type, count })),
        licensingStatus: [{ validationStatus: "validated", count: providers.filter((p: any) => (p.status || "") === "active").length }],
      };
    } catch { return { status: "UNAVAILABLE" as const, totalEvents: 0, totalProviders: 0, totalPatterns: 0, validatedEvents: 0, sourceBreakdown: [], licensingStatus: [] }; }
  }),

  recordAudit: adminQuery
    .input(z.object({ entityType: z.string(), entityId: z.number(), action: z.string(), details: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const d1 = getD1(ctx);
      if (!d1) return { success: false };
      try {
        await d1.prepare(
          `INSERT INTO data_audit_log (entityType, entityId, action, userId, details, timestamp) VALUES (?, ?, ?, ?, ?, datetime('now'))`
        ).bind(input.entityType, input.entityId, input.action, null, input.details || null).run();
        return { success: true };
      } catch { return { success: false }; }
    }),
});

