import { t, publicQuery } from "./router";
import { z } from "zod";

export const qualityRouter = t.router({
  score: publicQuery
    .input(z.object({ countyId: z.string() }).optional())
    .query(async ({ ctx, input }) => {
      return { score: 0.95, factors: [] };
    }),
});
