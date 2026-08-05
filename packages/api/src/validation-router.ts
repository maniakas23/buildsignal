import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { dataValidationQueue } from "@db/schema-sqlite";
import { eq, desc, and, sql } from "drizzle-orm";
import { getDbFromContext } from "./queries/connection";

export const validationRouter = createRouter({
  list: adminQuery.input(z.object({
    status: z.enum(["pending","passed","failed","review","all"]).optional().default("all"),
    limit: z.number().min(1).max(500).optional().default(100),
    offset: z.number().min(0).optional().default(0),
  }).optional()).query(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    const conditions = [];
    if (input?.status && input.status !== "all") conditions.push(eq(dataValidationQueue.validationStatus, input.status));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const limit = input?.limit || 100; const offset = input?.offset || 0;
    const [rows, countResult] = await Promise.all([
      db.select().from(dataValidationQueue).where(where).orderBy(desc(dataValidationQueue.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(dataValidationQueue),
    ]);
    const allStatuses = await db.select({ status: dataValidationQueue.validationStatus, count: sql<number>`count(*)` }).from(dataValidationQueue).groupBy(dataValidationQueue.validationStatus);
    const byStatus: Record<string,number> = {}; for (const s of allStatuses) byStatus[s.status] = s.count;
    return { records: rows, total: countResult[0]?.count || 0, byStatus };
  }),

  submit: adminQuery.input(z.object({
    sourceId: z.number(), externalRecordId: z.string(), recordType: z.string(), rawPayload: z.string(),
  })).mutation(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    let payload: any = {}; try { payload = JSON.parse(input.rawPayload); } catch { /* ignore */ }
    const requiredFieldsCheck = !!(payload.title || payload.name || payload.projectName);
    const dateValidationCheck = !!(payload.date || payload.publishedAt || payload.createdAt);
    const addressValidationCheck = !!(payload.address || payload.location || payload.county);
    const coordinateValidationCheck = !!(payload.lat && payload.lng);
    const schemaComplianceCheck = !!payload.sourceType;
    const providerIntegrityCheck = true;
    const checks = [requiredFieldsCheck, dateValidationCheck, addressValidationCheck, coordinateValidationCheck, schemaComplianceCheck, providerIntegrityCheck];
    const passedChecks = checks.filter(Boolean).length;
    const confidence = Math.round((passedChecks / checks.length) * 100);
    let validationStatus = "pending";
    const errors: string[] = [];
    if (!requiredFieldsCheck) errors.push("Missing required fields");
    if (!dateValidationCheck) errors.push("Missing or invalid date");
    if (!addressValidationCheck) errors.push("Missing address/location");
    if (!coordinateValidationCheck) errors.push("Missing coordinates");
    if (!schemaComplianceCheck) errors.push("Schema compliance failure");
    if (errors.length === 0) validationStatus = "passed";
    else if (confidence >= 50) validationStatus = "review";
    else validationStatus = "failed";
    const result = await db.insert(dataValidationQueue).values({
      ...input, validationStatus, requiredFieldsCheck, dateValidationCheck,
      addressValidationCheck, coordinateValidationCheck, schemaComplianceCheck,
      providerIntegrityCheck, confidenceScore: confidence,
      validationErrors: errors.length > 0 ? JSON.stringify(errors) : null,
    }).returning();
    return { success: true, record: result[0], checksPassed: passedChecks, totalChecks: checks.length };
  }),

  review: adminQuery.input(z.object({
    id: z.number(), status: z.enum(["passed","failed"]), reviewerNotes: z.string().optional(), reviewedBy: z.number(),
  })).mutation(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    await db.update(dataValidationQueue).set({ validationStatus: input.status, reviewerNotes: input.reviewerNotes, reviewedBy: input.reviewedBy, reviewedAt: new Date() }).where(eq(dataValidationQueue.id, input.id));
    return { success: true };
  }),

  stats: adminQuery.query(async ({ ctx }) => {
    const db = getDbFromContext(ctx.env);
    const all = await db.select().from(dataValidationQueue);
    const pending = all.filter((r:any)=>r.validationStatus==="pending").length;
    const passed = all.filter((r:any)=>r.validationStatus==="passed").length;
    const failed = all.filter((r:any)=>r.validationStatus==="failed").length;
    const inReview = all.filter((r:any)=>r.validationStatus==="review").length;
    const passRate = all.length>0 ? Math.round((passed/all.length)*100) : 0;
    const avgConfidence = all.length>0 ? Math.round(all.reduce((sum:number,r:any)=>sum+(r.confidenceScore||0),0)/all.length) : 0;
    const errorCounts: Record<string,number> = {};
    for (const r of all) { if (r.validationErrors) { try { const errs = JSON.parse(r.validationErrors); for (const e of errs) errorCounts[e] = (errorCounts[e]||0)+1; } catch { /* ignore */ } } }
    return { totalRecords:all.length, pending, passed, failed, inReview, passRate, avgConfidence, todayProcessed: all.filter((r:any)=>{ const d=new Date(r.createdAt); return d.toDateString()===new Date().toDateString(); }).length, errorsByType: Object.entries(errorCounts).map(([type,count])=>({type,count})) };
  }),

  bulkValidate: adminQuery.input(z.object({ recordIds: z.array(z.number()), status: z.enum(["passed","failed"]) })).mutation(async ({ ctx, input }) => {
    const db = getDbFromContext(ctx.env);
    let processed = 0;
    for (const id of input.recordIds) { await db.update(dataValidationQueue).set({ validationStatus: input.status, reviewedAt: new Date() }).where(eq(dataValidationQueue.id, id)); processed++; }
    return { success: true, processed };
  }),
});

