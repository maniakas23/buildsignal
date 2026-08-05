import { t, publicQuery } from "./router";
import { z } from "zod";

export const securityRouter = t.router({
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
