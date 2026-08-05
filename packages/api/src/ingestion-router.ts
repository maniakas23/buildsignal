import { t, publicQuery } from "./router";
import { z } from "zod";

export const ingestionRouter = t.router({
  event: publicQuery
    .input(z.object({ type: z.string(), data: z.record(z.any()) }).optional())
    .mutation(async ({ ctx, input }) => {
      return { ingested: true };
    }),

  batch: publicQuery
    .input(z.array(z.object({ type: z.string(), data: z.record(z.any()) })).optional())
    .mutation(async ({ ctx, input }) => {
      return { ingested: (input || []).length };
    }),
});
