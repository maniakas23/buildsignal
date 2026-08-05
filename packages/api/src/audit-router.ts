import { t, publicQuery, authedQuery } from "./router";
import { z } from "zod";
import { auditLogs } from "../db/schema";
import { desc } from "drizzle-orm";

export const auditRouter = t.router({
  list: authedQuery
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const logs = await ctx.db
        .select()
        .from(auditLogs)
        .orderBy(desc(auditLogs.createdAt))
        .limit(input?.limit || 50)
        .offset(input?.offset || 0);
      return { logs };
    }),
});
