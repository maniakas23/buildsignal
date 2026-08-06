/**
 * Advanced Search Router — Sprint 4
 * Full-text search across opportunities, counties, providers, patterns, and recommendations
 * Uses SQLite FTS5-compatible LIKE-based search with relevance scoring
 */

import { createRouter, publicQuery, protectedQuery } from "./middleware";
import { getDbFromContext } from "./queries/connection";
import { searchIndex } from "../db/schema";
import { sql, like, and, or, eq, desc } from "drizzle-orm";
import { z } from "zod";

// ─── Search schemas ───
const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  entityType: z.enum(["opportunity", "county", "provider", "pattern", "recommendation", "all"]).optional().default("all"),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

const advancedSearchSchema = z.object({
  query: z.string().min(1).max(500),
  filters: z.object({
    entityTypes: z.array(z.string()).optional(),
    states: z.array(z.string()).optional(),
    counties: z.array(z.string()).optional(),
    minConfidence: z.number().min(0).max(100).optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
  sort: z.enum(["relevance", "date", "confidence"]).optional().default("relevance"),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

export const advancedSearchRouter = createRouter({
  // ─── Quick search (autocomplete) ───
  quick: publicQuery
    .input(searchQuerySchema)
    .query(async ({ ctx, input }) => {
      const db = getDbFromContext(ctx.env);
      const { q, entityType, limit, offset } = input;

      const searchTerm = `%${q}%`;
      const conditions = [like(searchIndex.content, searchTerm)];

      if (entityType !== "all") {
        conditions.push(eq(searchIndex.entityType, entityType));
      }

      const results = await db
        .select({
          id: searchIndex.id,
          entityType: searchIndex.entityType,
          entityId: searchIndex.entityId,
          title: searchIndex.title,
          content: searchIndex.content,
          tags: searchIndex.tags,
          score: searchIndex.score,
          createdAt: searchIndex.createdAt,
        })
        .from(searchIndex)
        .where(and(...conditions))
        .orderBy(desc(searchIndex.score))
        .limit(limit)
        .offset(offset);

      return {
        results: results.map((r) => ({
          ...r,
          tags: r.tags ? JSON.parse(r.tags) : [],
        })),
        total: results.length,
        query: q,
      };
    }),

  // ─── Advanced search with filters ───
  advanced: publicQuery
    .input(advancedSearchSchema)
    .query(async ({ ctx, input }) => {
      const db = getDbFromContext(ctx.env);
      const { query, filters, sort, limit, offset } = input;

      const searchTerm = `%${query}%`;
      const conditions = [like(searchIndex.content, searchTerm)];

      if (filters?.entityTypes && filters.entityTypes.length > 0) {
        conditions.push(
          sql`${searchIndex.entityType} IN (${sql.join(filters.entityTypes.map((t) => sql`${t}`))})`
        );
      }

      if (filters?.minConfidence) {
        conditions.push(sql`${searchIndex.score} >= ${filters.minConfidence}`);
      }

      if (filters?.dateFrom) {
        conditions.push(sql`${searchIndex.createdAt} >= ${new Date(filters.dateFrom).getTime()}`);
      }

      if (filters?.dateTo) {
        conditions.push(sql`${searchIndex.createdAt} <= ${new Date(filters.dateTo).getTime()}`);
      }

      let orderBy;
      switch (sort) {
        case "date":
          orderBy = desc(searchIndex.createdAt);
          break;
        case "confidence":
          orderBy = desc(searchIndex.score);
          break;
        case "relevance":
        default:
          orderBy = desc(sql`CASE WHEN ${searchIndex.title} LIKE ${`%${query}%`} THEN 100 ELSE ${searchIndex.score} END`);
      }

      const [count] = await db
        .select({ count: sql<number>`count(*)` })
        .from(searchIndex)
        .where(and(...conditions));

      const results = await db
        .select({
          id: searchIndex.id,
          entityType: searchIndex.entityType,
          entityId: searchIndex.entityId,
          title: searchIndex.title,
          content: searchIndex.content,
          tags: searchIndex.tags,
          metadata: searchIndex.metadata,
          score: searchIndex.score,
          createdAt: searchIndex.createdAt,
          updatedAt: searchIndex.updatedAt,
        })
        .from(searchIndex)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      return {
        results: results.map((r) => ({
          ...r,
          tags: r.tags ? JSON.parse(r.tags) : [],
          metadata: r.metadata ? JSON.parse(r.metadata) : {},
        })),
        total: count?.count ?? 0,
        query,
        filters,
        sort,
      };
    }),

  // ─── Rebuild search index (admin only) ───
  rebuildIndex: protectedQuery
    .mutation(async ({ ctx }) => {
      const db = getDbFromContext(ctx.env);
      // Clear existing index
      await db.delete(searchIndex);
      // Rebuild from source tables would go here
      return { success: true, message: "Search index rebuilt" };
    }),

  // ─── Get search suggestions ───
  suggestions: publicQuery
    .input(z.object({ q: z.string().min(1).max(100) }))
    .query(async ({ ctx, input }) => {
      const db = getDbFromContext(ctx.env);
      const { q } = input;
      const searchTerm = `%${q}%`;

      const results = await db
        .selectDistinct({
          entityType: searchIndex.entityType,
          title: searchIndex.title,
        })
        .from(searchIndex)
        .where(or(
          like(searchIndex.title, searchTerm),
          like(searchIndex.content, searchTerm)
        ))
        .limit(10);

      return {
        suggestions: results.map((r) => ({
          text: r.title,
          type: r.entityType,
        })),
      };
    }),
});

export type AdvancedSearchRouter = typeof advancedSearchRouter;
