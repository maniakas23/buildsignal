import { t, publicQuery } from "./router";
import { z } from "zod";

export const recommendationV2Router = t.router({
  list: publicQuery
    .input(
      z.object({
        confidence: z.number().min(0).max(1).optional(),
        limit: z.number().min(1).max(100).default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      return { recommendations: [] };
    }),
});
