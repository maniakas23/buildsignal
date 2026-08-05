import { t, publicQuery, authedQuery } from "./router";
import { z } from "zod";

export const expansionRouter = t.router({
  opportunities: publicQuery.query(async ({ ctx }) => {
    return { opportunities: [] };
  }),

  plan: authedQuery
    .input(z.object({ countyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return { plan: {} };
    }),
});
