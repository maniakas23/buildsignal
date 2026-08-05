import { t, publicQuery } from "./router";
import { z } from "zod";

export const operationsRouter = t.router({
  metrics: publicQuery.query(async ({ ctx }) => {
    return { metrics: [] };
  }),

  pipelines: publicQuery
    .input(z.object({ status: z.string() }).optional())
    .query(async ({ ctx, input }) => {
      return { pipelines: [] };
    }),
});
