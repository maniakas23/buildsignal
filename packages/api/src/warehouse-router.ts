import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { historicalWarehouse } from "@db/schema-sqlite";
import { eq, desc, and, sql } from "drizzle-orm";
import { getDbFromContext } from "./queries/connection";

export const warehouseRouter = createRouter({
  query: authedQuery.input(z.object({
    state: z.string().optional(), county: z.string().optional(), city: z.string().optional(),
    eventType: z.string().optional(), eventCategory: z.string().optional(),
    year: z.number().optional(), quarter: z.number().min(1).max(4).optional(),
    trendDirection: z.enum(["increasing","decreasing","stable","volatile"]).optional(),
    limit: z.number().min(1).max(500).optional().default(100), offset: z.number().min(0).optional().default(0),
  }).optional()).query(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    const conditions = [];
    if (input?.state) conditions.push(eq(historicalWarehouse.state, input.state));
    if (input?.county) conditions.push(eq(historicalWarehouse.county, input.county));
    if (input?.city) conditions.push(eq(historicalWarehouse.city, input.city));
    if (input?.eventType) conditions.push(eq(historicalWarehouse.eventType, input.eventType));
    if (input?.eventCategory) conditions.push(eq(historicalWarehouse.eventCategory, input.eventCategory));
    if (input?.year) conditions.push(eq(historicalWarehouse.year, input.year));
    if (input?.quarter) conditions.push(eq(historicalWarehouse.quarter, input.quarter));
    if (input?.trendDirection) conditions.push(eq(historicalWarehouse.trendDirection, input.trendDirection));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const limit = input?.limit || 100; const offset = input?.offset || 0;
    const [rows, countResult] = await Promise.all([
      db.select().from(historicalWarehouse).where(where).orderBy(desc(historicalWarehouse.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(historicalWarehouse).where(where),
    ]);
    return { records: rows, total: countResult[0]?.count || 0 };
  }),

  archive: authedQuery.input(z.object({
    eventId: z.number(), eventType: z.string(), eventCategory: z.string(),
    county: z.string().optional(), state: z.string(), city: z.string().optional(),
    year: z.number(), quarter: z.number(), month: z.number(),
    value: z.number().optional(), confidence: z.number().optional(),
    trendDirection: z.enum(["increasing","decreasing","stable","volatile"]).optional(),
    seasonalFactor: z.number().optional(), comparableEvents: z.string().optional(), enrichedContext: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    const result = await db.insert(historicalWarehouse).values(input).returning();
    return { success: true, record: result[0] };
  }),

  trends: authedQuery.input(z.object({
    state: z.string(), county: z.string().optional(), eventType: z.string().optional(), years: z.number().min(1).max(10).optional().default(5),
  })).query(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    const currentYear = new Date().getFullYear(); const startYear = currentYear - input.years;
    const conditions = [eq(historicalWarehouse.state, input.state), sql`${historicalWarehouse.year} >= ${startYear}`];
    if (input.county) conditions.push(eq(historicalWarehouse.county, input.county));
    if (input.eventType) conditions.push(eq(historicalWarehouse.eventType, input.eventType));
    const where = and(...conditions);
    const rows = await db.select().from(historicalWarehouse).where(where);
    const yearMap = new Map<number,{count:number;totalValue:number;confidenceSum:number}>();
    const categoryMap = new Map<string,number>();
    for (const r of rows) {
      if (!yearMap.has(r.year)) yearMap.set(r.year,{count:0,totalValue:0,confidenceSum:0});
      const yd = yearMap.get(r.year)!; yd.count++; yd.totalValue += r.value||0; yd.confidenceSum += r.confidence||0;
      categoryMap.set(r.eventCategory,(categoryMap.get(r.eventCategory)||0)+1);
    }
    return {
      state: input.state, county: input.county, yearsAnalyzed: input.years,
      yearlyTrends: Array.from(yearMap.entries()).map(([year,data])=>({year,count:data.count,totalValue:data.totalValue,avgConfidence:data.count>0?Math.round(data.confidenceSum/data.count):0})).sort((a,b)=>a.year-b.year),
      categoryBreakdown: Array.from(categoryMap.entries()).map(([category,count])=>({category,count})).sort((a,b)=>b.count-a.count),
      totalEvents: rows.length, avgConfidence: rows.length>0?Math.round(rows.reduce((sum:number,r:any)=>sum+(r.confidence||0),0)/rows.length):0,
    };
  }),

  stats: authedQuery.query(async ({ ctx }) => {
    const db = getDbFromContext(ctx.env);
    const all = await db.select().from(historicalWarehouse);
    const states = new Set(all.map((r:any)=>r.state)).size;
    const counties = new Set(all.map((r:any)=>r.county).filter(Boolean)).size;
    const years = all.map((r:any)=>r.year).filter((y:any)=>y);
    const minYear = years.length>0?Math.min(...years):0; const maxYear = years.length>0?Math.max(...years):0;
    const catMap=new Map(), trendMap=new Map();
    for (const r of all) { catMap.set(r.eventCategory,(catMap.get(r.eventCategory)||0)+1); trendMap.set(r.trendDirection||"stable",(trendMap.get(r.trendDirection||"stable")||0)+1); }
    return { totalRecords:all.length, states, counties, yearRange:{min:minYear,max:maxYear}, byCategory:Array.from(catMap.entries()).map(([c,n])=>({category:c,count:n})), byTrend:Array.from(trendMap.entries()).map(([d,n])=>({direction:d,count:n})) };
  }),
});
