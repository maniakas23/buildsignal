import { t, publicQuery, authedQuery } from "./router";
import { z } from "zod";
import { intelligenceAlerts } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";

export const alertRouter = t.router({
  list: publicQuery
    .input(
      z.object({
        severity: z.enum(["critical", "warning", "info"]).optional(),
        status: z.enum(["active", "acknowledged", "archived"]).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input?.severity) conditions.push(eq(intelligenceAlerts.severity, input.severity));
      if (input?.status) conditions.push(eq(intelligenceAlerts.status, input.status));

      const alerts = await ctx.db
        .select()
        .from(intelligenceAlerts)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(intelligenceAlerts.createdAt))
        .limit(input?.limit || 50)
        .offset(input?.offset || 0);

      return { alerts };
    }),

  summary: publicQuery.query(async ({ ctx }) => {
    const allAlerts = await ctx.db.select().from(intelligenceAlerts);
    const critical = allAlerts.filter((a) => a.severity === "critical").length;
    const warning = allAlerts.filter((a) => a.severity === "warning").length;
    const info = allAlerts.filter((a) => a.severity === "info").length;
    const active = allAlerts.filter((a) => a.status === "active").length;

    return { total: allAlerts.length, critical, warning, info, active };
  }),

  acknowledge: authedQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(intelligenceAlerts)
        .set({ status: "acknowledged" })
        .where(eq(intelligenceAlerts.id, input.id));
      return { success: true };
    }),

  archive: authedQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(intelligenceAlerts)
        .set({ status: "archived" })
        .where(eq(intelligenceAlerts.id, input.id));
      return { success: true };
    }),
});
