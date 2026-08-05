import { t, publicQuery } from "./router";
import { z } from "zod";

export const learningRouter = t.router({
  models: publicQuery.query(async ({ ctx }) => {
    return { models: [] };
  }),

  train: publicQuery
    .input(z.object({ model: z.string(), data: z.array(z.any()) }).optional())
    .mutation(async ({ ctx, input }) => {
      return { status: "training" };
    }),
});
