import { t, publicQuery } from "./router";
import { z } from "zod";

export const dataGovernanceRouter = t.router({
  policies: publicQuery.query(async ({ ctx }) => {
    return { policies: [] };
  }),

  audit: publicQuery
    .input(
      z.object({
        from: z.string().optional(),
        to: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      return { audit: [] };
    }),
});
