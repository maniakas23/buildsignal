import { t, publicQuery } from "./router";
import { z } from "zod";

export const pipelineMetricsRouter = t.router({
  metrics: publicQuery.query(async ({ ctx }) => {
    return { metrics: [] };
  }),

  throughput: publicQuery
    .input(z.object({ pipeline: z.string() }).optional())
    .query(async ({ ctx, input }) => {
      return { throughput: 0 };
    }),
});
