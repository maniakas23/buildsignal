import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { dailyBriefings } from "@db/schema-sqlite";
import { eq, desc, and } from "drizzle-orm";
import { getDbFromContext } from "./queries/connection";

export const briefingRouter = createRouter({
  list: authedQuery.input(z.object({
    scope: z.enum(["national","state","county","user"]).optional(),
    deliveryStatus: z.enum(["draft","reviewed","delivered","archived","all"]).optional().default("all"),
    limit: z.number().min(1).max(100).optional().default(30),
  }).optional()).query(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    const conditions = [];
    if (input?.scope) conditions.push(eq(dailyBriefings.scope, input.scope));
    if (input?.deliveryStatus && input.deliveryStatus !== "all") conditions.push(eq(dailyBriefings.deliveryStatus, input.deliveryStatus));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const rows = await db.select().from(dailyBriefings).where(where).orderBy(desc(dailyBriefings.briefingDate)).limit(input?.limit || 30);
    return { briefings: rows, total: rows.length };
  }),

  today: authedQuery.input(z.object({
    scope: z.enum(["national","state","county","user"]).optional().default("national"),
    scopeId: z.string().optional(),
  }).optional()).query(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    const today = new Date().toISOString().split("T")[0];
    const conditions = [eq(dailyBriefings.briefingDate, today), eq(dailyBriefings.scope, input?.scope || "national")];
    if (input?.scopeId) conditions.push(eq(dailyBriefings.scopeId, input.scopeId));
    const rows = await db.select().from(dailyBriefings).where(and(...conditions));
    return rows[0] || null;
  }),

  getByDate: authedQuery.input(z.object({ date: z.string(), scope: z.enum(["national","state","county","user"]).optional().default("national"), scopeId: z.string().optional() })).query(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    const conditions = [eq(dailyBriefings.briefingDate, input.date), eq(dailyBriefings.scope, input.scope)];
    if (input.scopeId) conditions.push(eq(dailyBriefings.scopeId, input.scopeId));
    const rows = await db.select().from(dailyBriefings).where(and(...conditions));
    return rows[0] || null;
  }),

  generate: authedQuery.input(z.object({
    briefingDate: z.string(), scope: z.enum(["national","state","county","user"]).default("national"), scopeId: z.string().optional(),
    topOpportunities: z.string().optional(), newActivity: z.string().optional(),
    priorityCounties: z.string().optional(), recommendationChanges: z.string().optional(),
    providerHealth: z.string().optional(), coverageGrowth: z.string().optional(),
    operationalSummary: z.string().optional(), executiveActions: z.string().optional(), narrative: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    const existing = await db.select().from(dailyBriefings).where(and(eq(dailyBriefings.briefingDate, input.briefingDate), eq(dailyBriefings.scope, input.scope)));
    if (existing.length > 0) {
      await db.update(dailyBriefings).set({ ...input, deliveryStatus: "draft" as const }).where(eq(dailyBriefings.id, existing[0].id));
      return { success: true, briefing: { ...existing[0], ...input }, updated: true };
    }
    const result = await db.insert(dailyBriefings).values({ ...input, deliveryStatus: "draft" }).returning();
    return { success: true, briefing: result[0], updated: false };
  }),

  deliver: authedQuery.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    await db.update(dailyBriefings).set({ deliveryStatus: "delivered", deliveredAt: new Date() }).where(eq(dailyBriefings.id, input.id));
    return { success: true };
  }),

  stats: authedQuery.query(async ({ ctx }) => {
    const db = getDbFromContext(ctx.env);
    const all = await db.select().from(dailyBriefings);
    const now = new Date(); const weekAgo = new Date(now.getTime()-7*24*60*60*1000); const twoWeeksAgo = new Date(now.getTime()-14*24*60*60*1000);
    const scopeMap = new Map(); for (const b of all) scopeMap.set(b.scope, (scopeMap.get(b.scope)||0)+1);
    return { totalBriefings:all.length, delivered:all.filter((b:any)=>b.deliveryStatus==="delivered").length, draft:all.filter((b:any)=>b.deliveryStatus==="draft").length, reviewed:all.filter((b:any)=>b.deliveryStatus==="reviewed").length, archived:all.filter((b:any)=>b.deliveryStatus==="archived").length, byScope:Array.from(scopeMap.entries()).map(([scope,count])=>({scope,count})), thisWeek:all.filter((b:any)=>new Date(b.generatedAt)>=weekAgo).length, lastWeek:all.filter((b:any)=>{ const d=new Date(b.generatedAt); return d>=twoWeeksAgo&&d<weekAgo; }).length };
  }),

  template: authedQuery.query(() => ({
    sections: [
      { id: "topOpportunities", label: "Top Opportunities", required: true },
      { id: "newActivity", label: "New Infrastructure Activity", required: true },
      { id: "priorityCounties", label: "Priority Counties", required: false },
      { id: "recommendationChanges", label: "Recommendation Changes", required: true },
      { id: "providerHealth", label: "Provider Health", required: true },
      { id: "coverageGrowth", label: "Coverage Growth", required: false },
      { id: "operationalSummary", label: "Operational Summary", required: true },
      { id: "executiveActions", label: "Executive Actions", required: true },
      { id: "narrative", label: "Executive Narrative", required: true },
    ],
  })),
});
