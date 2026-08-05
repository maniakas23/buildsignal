import { t, publicQuery } from "./router";
import { z } from "zod";

export const geographicRouter = t.router({
  states: publicQuery.query(async ({ ctx }) => {
    return { states: [] };
  }),

  counties: publicQuery
    .input(z.object({ state: z.string() }).optional())
    .query(async ({ ctx, input }) => {
      return { counties: [] };
    }),
});
