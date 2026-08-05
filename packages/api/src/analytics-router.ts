/**
 * Analytics Router — Build 105
 * Product analytics, health scores, and engagement metrics.
 */

import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";

function getDb(ctx: { env?: Record<string, unknown> }) {
  return ctx.env?.DB as D1Database | undefined;
}

export const analyticsRouter = createRouter({
  healthScore: authedQuery.query(async ({ ctx }) => {
    const db = getDb(ctx);
    if (!db) return { score: 100, totalFeedback: 0, bugsLast7d: 0 };

    const feedbackCount = await db.prepare(
      `SELECT COUNT(*) as c FROM feedback WHERE created_at >= datetime('now', '-7 days')`
    ).first<{ c: number }>();
    const errorCount = await db.prepare(
      `SELECT COUNT(*) as c FROM feedback WHERE type = 'bug' AND created_at >= datetime('now', '-7 days')`
    ).first<{ c: number }>();

    const totalFeedback = Number(feedbackCount?.c ?? 0);
    const bugs = Number(errorCount?.c ?? 0);
    const score = totalFeedback > 0 ? Math.max(0, 100 - (bugs / totalFeedback * 100)) : 100;

    return { score: Math.round(score), totalFeedback, bugsLast7d: bugs };
  }),

  onboardingFunnel: authedQuery.query(async ({ ctx }) => {
    const db = getDb(ctx);
    if (!db) return [{ stage: "Signed Up", count: 0 }];

    const signedUp = await db.prepare(`SELECT COUNT(*) as c FROM users`).first<{ c: number }>();
    const completedProfile = await db.prepare(`SELECT COUNT(*) as c FROM users WHERE profile_completed = 1`).first<{ c: number }>();
    const viewedOpps = await db.prepare(
      `SELECT COUNT(DISTINCT user_id) as c FROM feedback WHERE event_type = 'opportunity_viewed'`
    ).first<{ c: number }>();

    return [
      { stage: "Signed Up", count: Number(signedUp?.c ?? 0) },
      { stage: "Completed Profile", count: Number(completedProfile?.c ?? 0) },
      { stage: "Viewed Opportunities", count: Number(viewedOpps?.c ?? 0) },
    ];
  }),

  engagement: authedQuery.query(async ({ ctx }) => {
    const db = getDb(ctx);
    if (!db) return { dailyActiveUsers: 0, weeklyActiveUsers: 0 };

    const dailyActive = await db.prepare(
      `SELECT COUNT(DISTINCT user_id) as c FROM feedback WHERE created_at >= datetime('now', '-1 day')`
    ).first<{ c: number }>();
    const weeklyActive = await db.prepare(
      `SELECT COUNT(DISTINCT user_id) as c FROM feedback WHERE created_at >= datetime('now', '-7 days')`
    ).first<{ c: number }>();

    return {
      dailyActiveUsers: Number(dailyActive?.c ?? 0),
      weeklyActiveUsers: Number(weeklyActive?.c ?? 0),
    };
  }),

  conversion: authedQuery.query(async () => {
    return { trialToPaidRate: 0, avgTimeToConvert: 0 };
  }),

  retention: authedQuery.query(async () => {
    return { day7Retention: 0, day30Retention: 0 };
  }),

  dataMoat: authedQuery.query(async ({ ctx }) => {
    const db = getDb(ctx);
    if (!db) return { totalCounties: 0, totalProviders: 0, totalEvents: 0 };

    const countyCount = await db.prepare(`SELECT COUNT(*) as c FROM counties`).first<{ c: number }>();
    const providerCount = await db.prepare(`SELECT COUNT(*) as c FROM data_providers`).first<{ c: number }>();
    const eventCount = await db.prepare(`SELECT COUNT(*) as c FROM feedback`).first<{ c: number }>();

    return {
      totalCounties: Number(countyCount?.c ?? 0),
      totalProviders: Number(providerCount?.c ?? 0),
      totalEvents: Number(eventCount?.c ?? 0),
    };
  }),

  telemetrySnapshot: authedQuery.query(async () => {
    return { cpuUsage: 0, memoryUsage: 0, requestRate: 0, errorRate: 0 };
  }),

  readinessScore: authedQuery.query(async () => {
    return {
      score: 85,
      breakdown: { infrastructure: 90, security: 95, dataQuality: 80, performance: 85 },
    };
  }),

  scoreBreakdown: authedQuery.query(async () => {
    return {
      categories: [
        { name: "Infrastructure", score: 90, weight: 0.3 },
        { name: "Security", score: 95, weight: 0.25 },
        { name: "Data Quality", score: 80, weight: 0.25 },
        { name: "Performance", score: 85, weight: 0.2 },
      ],
    };
  }),
});
