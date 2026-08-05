/**
 * Notification Router — Gate 13 Section 3
 * Preferences, history, read/unread status for customer notifications.
 */

import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";

function getD1(ctx: any): D1Database | null {
  return (ctx.env?.DB as D1Database) || null;
}

export const notificationRouter = createRouter({
  // ─── Get preferences ───
  getPrefs: authedQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input, ctx }) => {
      const d1 = getD1(ctx);
      if (!d1) return { status: "UNAVAILABLE" as const, prefs: { userId: input.userId, emailEnabled: false, inAppEnabled: true, digestFrequency: "daily", alertTypes: [] } };
      try {
        const row = await d1.prepare(`SELECT * FROM notification_prefs WHERE userId = ?`).bind(input.userId).first();
        return { prefs: row || { userId: input.userId, emailEnabled: false, inAppEnabled: true, digestFrequency: "daily", alertTypes: [] } };
      } catch { return { status: "UNAVAILABLE" as const, prefs: { userId: input.userId, emailEnabled: false, inAppEnabled: true, digestFrequency: "daily", alertTypes: [] } }; }
    }),

  // ─── Update preferences ───
  updatePrefs: authedQuery
    .input(z.object({
      userId: z.number(),
      emailEnabled: z.boolean().optional(),
      inAppEnabled: z.boolean().optional(),
      dailyDigest: z.boolean().optional(),
      weeklyDigest: z.boolean().optional(),
      watchlistAlerts: z.boolean().optional(),
      infraAlerts: z.boolean().optional(),
      recAlerts: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const d1 = getD1(ctx);
      if (!d1) return { success: false };
      try {
        await d1.prepare(
          `INSERT INTO notification_prefs (userId, emailEnabled, inAppEnabled, dailyDigest, weeklyDigest, watchlistAlerts, infraAlerts, recAlerts)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(userId) DO UPDATE SET
             emailEnabled = COALESCE(?, emailEnabled),
             inAppEnabled = COALESCE(?, inAppEnabled),
             dailyDigest = COALESCE(?, dailyDigest),
             weeklyDigest = COALESCE(?, weeklyDigest),
             watchlistAlerts = COALESCE(?, watchlistAlerts),
             infraAlerts = COALESCE(?, infraAlerts),
             recAlerts = COALESCE(?, recAlerts),
             updatedAt = datetime('now')`
        ).bind(
          input.userId, bool(input.emailEnabled), bool(input.inAppEnabled), bool(input.dailyDigest), bool(input.weeklyDigest),
          bool(input.watchlistAlerts), bool(input.infraAlerts), bool(input.recAlerts),
          bool(input.emailEnabled), bool(input.inAppEnabled), bool(input.dailyDigest), bool(input.weeklyDigest),
          bool(input.watchlistAlerts), bool(input.infraAlerts), bool(input.recAlerts)
        ).run();
        return { success: true };
      } catch { return { success: false }; }
    }),

  // ─── Get notification history ───
  history: authedQuery
    .input(z.object({ userId: z.number(), limit: z.number().default(20) }))
    .query(async ({ input, ctx }) => {
      // Generate mock notification history based on audit logs
      const d1 = getD1(ctx);
      if (!d1) return { status: "UNAVAILABLE" as const, notifications: [] };
      try {
        const { results } = await d1.prepare(
          `SELECT id, action as type, details as message, resource, resourceId, createdAt, 'read' as status
           FROM audit_logs WHERE userId = ? ORDER BY createdAt DESC LIMIT ?`
        ).bind(input.userId, input.limit).all();
        return { notifications: results || [] };
      } catch { return { status: "UNAVAILABLE" as const, notifications: [] }; }
    }),
});

function bool(v?: boolean): number | null {
  return v === undefined ? null : (v ? 1 : 0);
}



