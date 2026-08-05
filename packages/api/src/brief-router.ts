import { t, publicQuery, authedQuery } from "./router";
import { z } from "zod";

export const briefRouter = t.router({
  list: publicQuery.query(async ({ ctx }) => {
    return { briefs: [] };
  }),
  create: authedQuery
    .input(z.object({ title: z.string(), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return { id: "1", title: input.title };
    }),
});
