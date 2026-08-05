import { t, publicQuery } from "./router";
import { z } from "zod";

export const pipelineRouter = t.router({
  list: publicQuery.query(async ({ ctx }) => {
    return { pipelines: [] };
  }),

  status: publicQuery
    .input(z.object({ id: z.string() }).optional())
    .query(async ({ ctx, input }) => {
      return { status: "running" };
    }),
});
