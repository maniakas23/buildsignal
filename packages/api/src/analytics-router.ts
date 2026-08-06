/**
 * Analytics Router — Build 110 / v1.1.0
 * Updated with 4-tier canonical pricing plans
 */

import { createRouter, publicQuery } from "./middleware";

export const analyticsRouter = createRouter({
  // ─── Plan breakdown (4-tier) ───
  planBreakdown: publicQuery.query(async () => {
    return {
      tiers: [
        { name: "Scout", monthlyPrice: 99, users: 0, description: "Solo contractor / small crew" },
        { name: "Professional", monthlyPrice: 249, users: 0, description: "Small to mid-size business" },
        { name: "Business", monthlyPrice: 599, users: 0, description: "Growing multi-crew operation" },
        { name: "Enterprise", monthlyPrice: 0, users: 0, description: "Custom pricing" },
      ],
      totalUsers: 0,
      totalMrr: 0,
      totalArr: 0,
      updatedAt: new Date().toISOString(),
    };
  }),

  // ─── Revenue metrics (zero-initialized) ───
  revenue: publicQuery.query(async () => {
    return {
      mrr: 0,
      arr: 0,
      newCustomers: 0,
      churnedCustomers: 0,
      upgrades: 0,
      downgrades: 0,
      avgRevenuePerUser: 0,
      period: "month",
      updatedAt: new Date().toISOString(),
    };
  }),

  // ─── Usage metrics (zero-initialized) ───
  usage: publicQuery.query(async () => {
    return {
      totalSearches: 0,
      totalAlerts: 0,
      totalExports: 0,
      totalWebhooks: 0,
      totalNotifications: 0,
      activeUsers: 0,
      dailyActiveUsers: 0,
      period: "month",
      updatedAt: new Date().toISOString(),
    };
  }),
});

export type AnalyticsRouter = typeof analyticsRouter;
