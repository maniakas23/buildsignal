import { t, publicQuery } from "./router";
import { z } from "zod";

export const executiveOpsRouter = t.router({
  summary: publicQuery.query(async ({ ctx }) => {
    return { kpi: {}, trends: [] };
  }),

  reports: publicQuery
    .input(
      z.object({
        from: z.string().optional(),
        to: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      return { reports: [] };
    }),
});
