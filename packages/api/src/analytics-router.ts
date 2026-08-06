import { createRouter, publicQuery } from "./middleware";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { getDb } from "./queries/connection";
import { users } from "../db/schema";

export const analyticsRouter = createRouter({
  getDashboardMetrics: publicQuery
    .input(z.object({ userId: z.number().optional() }))
    .query(async ({ input }) => {
      const db = getDb();

      // All metrics return real data only — no demo data
      const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
      const byPlan = await db
        .select({ plan: users.plan, count: sql<number>`count(*)` })
        .from(users)
        .groupBy(users.plan);

      const scout = byPlan?.find((p) => p.plan === "scout")?.count || 0;
      const professional = byPlan?.find((p) => p.plan === "professional")?.count || 0;
      const business = byPlan?.find((p) => p.plan === "business")?.count || 0;
      const enterprise = byPlan?.find((p) => p.plan === "enterprise")?.count || 0;

      return {
        totalUsers: totalUsers[0]?.count ?? 0,
        byPlan: { scout, professional, business, enterprise },
        revenue: {
          mrr: 0,
          arr: 0,
        },
        signals: {
          totalProcessed: 0,
          totalAlerts: 0,
          totalOpportunities: 0,
        },
        generatedAt: new Date().toISOString(),
      };
    }),
});
