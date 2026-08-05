import { t, publicQuery, authedQuery } from "./router";
import { z } from "zod";
import { samlProviders, ssoUsers, ssoSessions } from "../db/schema";
import { eq, and } from "drizzle-orm";

export const samlRouter = t.router({
  list: publicQuery.query(async ({ ctx }) => {
    const providers = await ctx.db.select().from(samlProviders).where(eq(samlProviders.active, true));
    return { providers };
  }),

  discover: publicQuery
    .input(z.object({ email: z.string() }))
    .query(async ({ ctx, input }) => {
      const domain = input.email.split("@")[1];
      if (!domain) return null;
      const provider = await ctx.db
        .select()
        .from(samlProviders)
        .where(eq(samlProviders.domain, domain))
        .limit(1);
      return provider[0] || null;
    }),

  metadata: publicQuery
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const provider = await ctx.db
        .select()
        .from(samlProviders)
        .where(eq(samlProviders.id, input.id))
        .limit(1);
      if (!provider[0]) return null;

      return {
        entityId: provider[0].entityId,
        acsUrl: provider[0].acsUrl,
        metadataUrl: provider[0].metadataUrl,
      };
    }),

  create: authedQuery
    .input(
      z.object({
        name: z.string(),
        domain: z.string(),
        entityId: z.string(),
        acsUrl: z.string(),
        metadataUrl: z.string().optional(),
        certificate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = crypto.randomUUID();
      await ctx.db.insert(samlProviders).values({
        id,
        name: input.name,
        domain: input.domain,
        entityId: input.entityId,
        acsUrl: input.acsUrl,
        metadataUrl: input.metadataUrl || null,
        certificate: input.certificate || null,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { id };
    }),
});
