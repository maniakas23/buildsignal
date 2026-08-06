/**
 * SAML Router — Build 110 / v1.1.0
 * SSO/SAML integration with samlProviders, ssoSessions, ssoUsers tables
 */

import { createRouter, protectedQuery } from "./middleware";
import { getDbFromContext } from "./queries/connection";
import { samlProviders, ssoSessions, ssoUsers } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

const samlProviderSchema = z.object({
  name: z.string().min(1).max(200),
  entityId: z.string().min(1).max(500),
  ssoUrl: z.string().url(),
  certificate: z.string().min(1),
  active: z.boolean().default(true),
});

export const samlRouter = createRouter({
  // ─── List SAML providers for org ───
  listProviders: protectedQuery.query(async ({ ctx }) => {
    const db = getDbFromContext(ctx.env);
    const orgId = ctx.user.orgId ?? null;

    if (!orgId) {
      return { providers: [] };
    }

    const providers = await db
      .select()
      .from(samlProviders)
      .where(eq(samlProviders.orgId, orgId))
      .orderBy(desc(samlProviders.createdAt));

    return { providers };
  }),

  // ─── Create SAML provider ───
  createProvider: protectedQuery
    .input(samlProviderSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDbFromContext(ctx.env);
      const orgId = ctx.user.orgId ?? null;

      if (!orgId) {
        throw new Error("User must belong to an organization to configure SAML");
      }

      const [provider] = await db
        .insert(samlProviders)
        .values({
          orgId,
          name: input.name,
          entityId: input.entityId,
          ssoUrl: input.ssoUrl,
          certificate: input.certificate,
          active: input.active,
        })
        .returning();

      return { provider };
    }),

  // ─── Update SAML provider ───
  updateProvider: protectedQuery
    .input(z.object({
      id: z.number(),
      ...samlProviderSchema.partial().shape,
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDbFromContext(ctx.env);
      const orgId = ctx.user.orgId ?? null;
      const { id, ...updates } = input;

      const values: any = { updatedAt: new Date() };
      if (updates.name) values.name = updates.name;
      if (updates.entityId) values.entityId = updates.entityId;
      if (updates.ssoUrl) values.ssoUrl = updates.ssoUrl;
      if (updates.certificate) values.certificate = updates.certificate;
      if (updates.active !== undefined) values.active = updates.active;

      const [provider] = await db
        .update(samlProviders)
        .set(values)
        .where(and(eq(samlProviders.id, id), eq(samlProviders.orgId, orgId)))
        .returning();

      if (!provider) throw new Error("Provider not found");

      return { provider };
    }),

  // ─── Delete SAML provider ───
  deleteProvider: protectedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDbFromContext(ctx.env);
      const orgId = ctx.user.orgId ?? null;

      await db
        .delete(samlProviders)
        .where(and(eq(samlProviders.id, input.id), eq(samlProviders.orgId, orgId)));

      return { success: true };
    }),

  // ─── List SSO sessions ───
  listSessions: protectedQuery.query(async ({ ctx }) => {
    const db = getDbFromContext(ctx.env);
    const userId = ctx.user.id;

    const sessions = await db
      .select()
      .from(ssoSessions)
      .where(eq(ssoSessions.userId, userId))
      .orderBy(desc(ssoSessions.createdAt));

    return { sessions };
  }),

  // ─── List SSO user mappings ───
  listSsoUsers: protectedQuery.query(async ({ ctx }) => {
    const db = getDbFromContext(ctx.env);
    const orgId = ctx.user.orgId ?? null;

    if (!orgId) {
      return { users: [] };
    }

    // Get all providers for this org
    const providers = await db
      .select()
      .from(samlProviders)
      .where(eq(samlProviders.orgId, orgId));

    const providerIds = providers.map((p) => p.id);
    if (providerIds.length === 0) {
      return { users: [] };
    }

    const users = await db
      .select()
      .from(ssoUsers)
      .where(sql`${ssoUsers.providerId} IN (${sql.join(providerIds)})`)
      .orderBy(desc(ssoUsers.createdAt));

    return { users };
  }),
});

export type SamlRouter = typeof samlRouter;
