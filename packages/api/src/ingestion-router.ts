import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { ingestionSources } from "@db/schema-sqlite";
import { eq, desc, and } from "drizzle-orm";
import { getDbFromContext } from "./queries/connection";

export const ingestionRouter = createRouter({
  list: adminQuery.input(z.object({
    sourceType: z.string().optional(),
    jurisdictionLevel: z.string().optional(),
    isActive: z.boolean().optional(),
    status: z.enum(["healthy","degraded","error","all"]).optional().default("all"),
  }).optional()).query(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    const conditions = [];
    if (input?.sourceType) conditions.push(eq(ingestionSources.sourceType, input.sourceType));
    if (input?.jurisdictionLevel) conditions.push(eq(ingestionSources.jurisdictionLevel, input.jurisdictionLevel));
    if (input?.isActive !== undefined) conditions.push(eq(ingestionSources.isActive, input.isActive));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const rows = await db.select().from(ingestionSources).where(where).orderBy(desc(ingestionSources.updatedAt));
    let filtered = rows;
    if (input?.status && input.status !== "all") {
      filtered = rows.filter((r: any) => {
        if (input.status === "healthy") return (r.healthScore||0) >= 80;
        if (input.status === "degraded") return (r.healthScore||0) >= 40 && (r.healthScore||0) < 80;
        if (input.status === "error") return (r.healthScore||0) < 40;
        return true;
      });
    }
    return { sources: filtered, total: filtered.length };
  }),

  getById: adminQuery.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    const rows = await db.select().from(ingestionSources).where(eq(ingestionSources.id, input.id));
    return rows[0] || null;
  }),

  register: adminQuery.input(z.object({
    sourceName: z.string().min(1),
    sourceType: z.enum(["building_permits","planning_agendas","rezoning","dot_projects","utilities","capital_improvement","economic_dev","government_spending","public_meetings","school_construction","environmental_notices","federal_infrastructure"]),
    jurisdictionLevel: z.enum(["federal","state","county","city","utility_district"]).default("county"),
    coverageArea: z.string(),
    endpointUrl: z.string().optional(),
    importMethod: z.enum(["api","webhook","scraper","manual","ftp","sftp","email"]).default("api"),
    authType: z.enum(["none","api_key","oauth2","basic_auth","custom"]).default("none"),
    schedule: z.enum(["realtime","hourly","daily","weekly","monthly"]).default("daily"),
  })).mutation(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    const result = await db.insert(ingestionSources).values({ ...input, healthScore: 100, isActive: true }).returning();
    return { success: true, source: result[0] };
  }),

  updateHealth: adminQuery.input(z.object({
    id: z.number(), healthScore: z.number().min(0).max(100),
    recordsLast30Days: z.number().optional(), avgLatencyMs: z.number().optional(),
    errorCount30d: z.number().optional(), lastSyncAt: z.string().optional(), nextSyncAt: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    const { id, ...data } = input;
    await db.update(ingestionSources).set({ ...data, lastSyncAt: data.lastSyncAt?new Date(data.lastSyncAt):undefined, nextSyncAt: data.nextSyncAt?new Date(data.nextSyncAt):undefined, updatedAt: new Date() }).where(eq(ingestionSources.id, id));
    return { success: true };
  }),

  toggleActive: adminQuery.input(z.object({ id: z.number(), isActive: z.boolean() })).mutation(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    await db.update(ingestionSources).set({ isActive: input.isActive, updatedAt: new Date() }).where(eq(ingestionSources.id, input.id));
    return { success: true };
  }),

  stats: adminQuery.query(async ({ ctx }) => {
    const db = getDbFromContext(ctx.env);
    const all = await db.select().from(ingestionSources);
    const active = all.filter((s:any)=>s.isActive);
    const healthy = active.filter((s:any)=>(s.healthScore||0)>=80);
    const degraded = active.filter((s:any)=>{ const h=s.healthScore||0; return h>=40&&h<80; });
    const error = active.filter((s:any)=>(s.healthScore||0)<40);
    const totalRecords30d = active.reduce((sum:number,s:any)=>sum+(s.recordsLast30Days||0),0);
    const avgHealth = active.length>0 ? Math.round(active.reduce((sum:number,s:any)=>sum+(s.healthScore||0),0)/active.length) : 0;
    const typeMap=new Map(), scheduleMap=new Map();
    for (const s of active) { typeMap.set(s.sourceType,(typeMap.get(s.sourceType)||0)+1); scheduleMap.set(s.schedule,(scheduleMap.get(s.schedule)||0)+1); }
    return { totalSources:all.length, activeSources:active.length, healthySources:healthy.length, degradedSources:degraded.length, errorSources:error.length, totalRecords30d, avgHealthScore:avgHealth, byType:Array.from(typeMap.entries()).map(([t,c])=>({type:t,count:c})), bySchedule:Array.from(scheduleMap.entries()).map(([s,c])=>({schedule:s,count:c})) };
  }),

  sourceTypes: adminQuery.query(() => ({
    types: [
      { id:"building_permits", label:"Building Permits", category:"permits" },
      { id:"planning_agendas", label:"Planning Agendas", category:"planning" },
      { id:"rezoning", label:"Rezoning", category:"zoning" },
      { id:"dot_projects", label:"DOT Projects", category:"transportation" },
      { id:"utilities", label:"Utilities", category:"infrastructure" },
      { id:"capital_improvement", label:"Capital Improvement Plans", category:"planning" },
      { id:"economic_dev", label:"Economic Development", category:"economic" },
      { id:"government_spending", label:"Government Spending", category:"financial" },
      { id:"public_meetings", label:"Public Meetings", category:"governance" },
      { id:"school_construction", label:"School Construction", category:"education" },
      { id:"environmental_notices", label:"Environmental Notices", category:"environmental" },
      { id:"federal_infrastructure", label:"Federal Infrastructure Programs", category:"federal" },
    ],
  })),
});

