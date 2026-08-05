import { t, publicQuery, authedQuery } from "./router";
import { z } from "zod";

export const briefingRouter = t.router({
  list: publicQuery.query(async ({ ctx }) => {
    return { briefings: [] };
  }),
  create: authedQuery
    .input(z.object({ title: z.string(), counties: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      return { id: "1", title: input.title };
    }),
});
