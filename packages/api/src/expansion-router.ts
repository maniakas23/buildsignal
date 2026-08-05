import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { expansionRegistry } from "@db/schema-sqlite";
import { eq, desc, and, sql } from "drizzle-orm";
import { getDbFromContext } from "./queries/connection";

export const expansionRouter = createRouter({
  list: authedQuery.input(z.object({
    state: z.string().optional(),
    status: z.enum(["queued","in_progress","active","paused","completed","all"]).optional().default("all"),
    limit: z.number().min(1).max(500).optional().default(100),
  }).optional()).query(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    const conditions = [];
    if (input?.state) conditions.push(eq(expansionRegistry.state, input.state));
    if (input?.status && input.status !== "all") conditions.push(eq(expansionRegistry.expansionStatus, input.status));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const rows = await db.select().from(expansionRegistry).where(where).orderBy(desc(expansionRegistry.updatedAt)).limit(input?.limit || 100);
    return { entries: rows, total: rows.length };
  }),

  register: authedQuery.input(z.object({
    state: z.string().min(1), county: z.string().min(1), city: z.string().optional(),
    planningAuthority: z.string().optional(), utilityProviders: z.string().optional(),
    population: z.number().optional(), dataSourcesAvailable: z.number().optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    const result = await db.insert(expansionRegistry).values({ ...input, expansionStatus: "queued", coveragePercent: 0 }).returning();
    return { success: true, entry: result[0] };
  }),

  updateStatus: authedQuery.input(z.object({
    id: z.number(), status: z.enum(["queued","in_progress","active","paused","completed"]),
    coveragePercent: z.number().min(0).max(100).optional(), activeProviders: z.number().optional(),
    providerHealth: z.number().min(0).max(100).optional(), dataSourcesActive: z.number().optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    const { id, status, ...data } = input;
    const update: any = { expansionStatus: status, updatedAt: new Date(), ...data };
    if (status === "active" && !update.onboardedAt) update.onboardedAt = new Date();
    await db.update(expansionRegistry).set(update).where(eq(expansionRegistry.id, id));
    return { success: true };
  }),

  dashboard: authedQuery.query(async ({ ctx }) => {
    const db = getDbFromContext(ctx.env);
    const all = await db.select().from(expansionRegistry);
    const statusMap: Record<string,number> = {}; const stateMap = new Map();
    for (const e of all) {
      statusMap[e.expansionStatus] = (statusMap[e.expansionStatus]||0)+1;
      if (!stateMap.has(e.state)) stateMap.set(e.state,{count:0,active:0,population:0});
      const sd = stateMap.get(e.state)!; sd.count++; sd.population += e.population||0; if (e.expansionStatus==="active") sd.active++;
    }
    const activeEntries = all.filter((e:any)=>e.expansionStatus==="active");
    const avgCoverage = activeEntries.length>0 ? Math.round(activeEntries.reduce((sum:number,e:any)=>sum+(e.coveragePercent||0),0)/activeEntries.length) : 0;
    return { totalJurisdictions:all.length, active:statusMap["active"]||0, inProgress:statusMap["in_progress"]||0, queued:statusMap["queued"]||0, paused:statusMap["paused"]||0, completed:statusMap["completed"]||0, totalPopulation:all.reduce((sum:number,e:any)=>sum+(e.population||0),0), avgCoverage, states:stateMap.size, counties:new Set(all.map((e:any)=>e.county)).size, byStatus:statusMap, byState:Array.from(stateMap.entries()).map(([state,data])=>({state,...data})) };
  }),

  states: authedQuery.query(async ({ ctx }) => {
    const db = getDbFromContext(ctx.env);
    const all = await db.select().from(expansionRegistry);
    const stateMap = new Map();
    for (const e of all) {
      if (!stateMap.has(e.state)) stateMap.set(e.state,{counties:0,activeCounties:0,totalPopulation:0,avgCoverage:0,coverageSum:0});
      const sd = stateMap.get(e.state)!; sd.counties++; sd.totalPopulation += e.population||0; sd.coverageSum += e.coveragePercent||0; if (e.expansionStatus==="active") sd.activeCounties++;
    }
    return { states: Array.from(stateMap.entries()).map(([state,data])=>({state,counties:data.counties,activeCounties:data.activeCounties,totalPopulation:data.totalPopulation,avgCoverage:data.counties>0?Math.round(data.coverageSum/data.counties):0})).sort((a,b)=>b.activeCounties-a.activeCounties) };
  }),
});

