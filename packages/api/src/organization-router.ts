import { t, publicQuery, authedQuery } from "./router";
import { z } from "zod";
import { organizations, organizationMembers } from "../db/schema";
import { eq } from "drizzle-orm";

export const organizationRouter = t.router({
  list: publicQuery.query(async ({ ctx }) => {
    const orgs = await ctx.db.select().from(organizations);
    return { organizations: orgs };
  }),

  get: publicQuery
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const org = await ctx.db
        .select()
        .from(organizations)
        .where(eq(organizations.id, input.id))
        .limit(1);
      return org[0] || null;
    }),

  members: publicQuery
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const members = await ctx.db
        .select()
        .from(organizationMembers)
        .where(eq(organizationMembers.organizationId, input.id));
      return { members };
    }),
});
