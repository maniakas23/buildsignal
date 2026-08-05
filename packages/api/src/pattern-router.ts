import { t, publicQuery } from "./router";
import { z } from "zod";

export const patternRouter = t.router({
  list: publicQuery.query(async ({ ctx }) => {
    return { patterns: [] };
  }),

  analyze: publicQuery
    .input(z.object({ countyId: z.string() }).optional())
    .query(async ({ ctx, input }) => {
      return { patterns: [] };
    }),
});
