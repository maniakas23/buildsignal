/**
 * Organization Router — Gate 21
 * Organization and workspace management with admin controls.
 */

import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const organizationRouter = createRouter({
  // ─── List organizations (admin only) ───
  list: adminQuery
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit || 50;
      const offset = input?.offset || 0;
      const rows = await db.select().from(schema.organizations)
        .orderBy(desc(schema.organizations.createdAt))
        .limit(limit)
        .offset(offset);
      return rows;
    }),

  // ─── Get organization by ID ───
  get: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const orgId = ctx.user?.orgId;
      if (!orgId || (orgId !== input.id && !ctx.user?.isAdmin)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }
      const row = await db.select().from(schema.organizations)
        .where(eq(schema.organizations.id, input.id))
        .get();
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });
      return row;
    }),

  // ─── Create organization (admin only) ───
  create: adminQuery
    .input(z.object({
      name: z.string().min(1).max(200),
      slug: z.string().min(1).max(100),
      plan: z.enum(["scout", "professional", "business", "enterprise"]).default("scout"),
      metadata: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(schema.organizations).values({
        name: input.name,
        slug: input.slug,
        plan: input.plan,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      }).returning();
      return result[0];
    }),

  // ─── Update organization ───
  update: authedQuery
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(200).optional(),
      slug: z.string().min(1).max(100).optional(),
      plan: z.enum(["scout", "professional", "business", "enterprise"]).optional(),
      stripeCustomerId: z.string().optional(),
      metadata: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const orgId = ctx.user?.orgId;
      if (!orgId || (orgId !== input.id && !ctx.user?.isAdmin)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }
      const { id, ...data } = input;
      const update: any = { ...data };
      if (data.metadata) update.metadata = JSON.stringify(data.metadata);
      await db.update(schema.organizations).set(update).where(eq(schema.organizations.id, id));
      return { success: true };
    }),

  // ─── List workspaces for an organization ───
  workspaces: authedQuery
    .input(z.object({ orgId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const userOrgId = ctx.user?.orgId;
      if (!userOrgId || (userOrgId !== input.orgId && !ctx.user?.isAdmin)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }
      const rows = await db.select().from(schema.workspaces)
        .where(eq(schema.workspaces.orgId, input.orgId))
        .orderBy(desc(schema.workspaces.createdAt));
      return rows;
    }),

  // ─── Create workspace ───
  createWorkspace: authedQuery
    .input(z.object({
      orgId: z.number(),
      name: z.string().min(1).max(200),
      slug: z.string().min(1).max(100),
      metadata: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userOrgId = ctx.user?.orgId;
      if (!userOrgId || (userOrgId !== input.orgId && !ctx.user?.isAdmin)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }
      const result = await db.insert(schema.workspaces).values({
        orgId: input.orgId,
        name: input.name,
        slug: input.slug,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      }).returning();
      return result[0];
    }),

  // ─── Get workspace members ───
  members: authedQuery
    .input(z.object({ orgId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const userOrgId = ctx.user?.orgId;
      if (!userOrgId || (userOrgId !== input.orgId && !ctx.user?.isAdmin)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }
      const rows = await db.select().from(schema.users)
        .where(eq(schema.users.orgId, input.orgId))
        .orderBy(desc(schema.users.createdAt));
      return rows;
    }),
});

