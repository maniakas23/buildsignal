import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { enrichmentLog } from "@db/schema-sqlite";
import { eq, desc, and } from "drizzle-orm";
import { getDbFromContext } from "./queries/connection";

export const enrichmentRouter = createRouter({
  list: authedQuery.input(z.object({
    eventId: z.number().optional(), enrichmentType: z.string().optional(), limit: z.number().min(1).max(500).optional().default(100),
  }).optional()).query(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    const conditions = [];
    if (input?.eventId) conditions.push(eq(enrichmentLog.eventId, input.eventId));
    if (input?.enrichmentType) conditions.push(eq(enrichmentLog.enrichmentType, input.enrichmentType));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const rows = await db.select().from(enrichmentLog).where(where).orderBy(desc(enrichmentLog.processedAt)).limit(input?.limit || 100);
    return { entries: rows, total: rows.length };
  }),

  enrich: authedQuery.input(z.object({
    eventId: z.number(),
    enrichmentType: z.enum(["geographic_context","nearby_infrastructure","related_projects","utility_availability","transportation_access","population_trends","historical_activity","economic_indicators","comparable_events"]),
    enrichmentData: z.string(), source: z.string(), confidence: z.number().min(0).max(100).optional().default(80),
  })).mutation(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    const result = await db.insert(enrichmentLog).values(input).returning();
    return { success: true, enrichment: result[0] };
  }),

  summary: authedQuery.input(z.object({ eventId: z.number() })).query(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    const rows = await db.select().from(enrichmentLog).where(eq(enrichmentLog.eventId, input.eventId)).orderBy(desc(enrichmentLog.processedAt));
    const types = [...new Set(rows.map((r:any)=>r.enrichmentType))];
    const avgConfidence = rows.length>0 ? Math.round(rows.reduce((sum:number,r:any)=>sum+(r.confidence||0),0)/rows.length) : 0;
    return { eventId: input.eventId, enrichments: rows, types, avgConfidence };
  }),

  stats: authedQuery.query(async ({ ctx }) => {
    const db = getDbFromContext(ctx.env);
    const all = await db.select().from(enrichmentLog);
    const typeMap=new Map(), sourceMap=new Map();
    for (const e of all) { typeMap.set(e.enrichmentType,(typeMap.get(e.enrichmentType)||0)+1); sourceMap.set(e.source,(sourceMap.get(e.source)||0)+1); }
    return { totalEnrichments:all.length, byType:Array.from(typeMap.entries()).map(([t,c])=>({type:t,count:c})), avgConfidence:all.length>0?Math.round(all.reduce((sum:number,e:any)=>sum+(e.confidence||0),0)/all.length):0, todayProcessed:all.filter((e:any)=>{ const d=new Date(e.processedAt); return d.toDateString()===new Date().toDateString(); }).length, topSources:Array.from(sourceMap.entries()).map(([s,c])=>({source:s,count:c})) };
  }),

  types: authedQuery.query(() => ({
    types: [
      { id:"geographic_context", label:"Geographic Context", description:"County, city, zip, lat/lng, boundaries" },
      { id:"nearby_infrastructure", label:"Nearby Infrastructure", description:"Roads, utilities, transit within radius" },
      { id:"related_projects", label:"Related Projects", description:"Correlated projects in same area" },
      { id:"utility_availability", label:"Utility Availability", description:"Water, sewer, electric, gas capacity" },
      { id:"transportation_access", label:"Transportation Access", description:"Highway, rail, port, airport proximity" },
      { id:"population_trends", label:"Population Trends", description:"Growth, density, demographics" },
      { id:"historical_activity", label:"Historical Activity", description:"Past permits, projects in area" },
      { id:"economic_indicators", label:"Economic Indicators", description:"Jobs, GDP, investment in area" },
      { id:"comparable_events", label:"Comparable Historical Events", description:"Similar projects and their outcomes" },
    ],
  })),
});
