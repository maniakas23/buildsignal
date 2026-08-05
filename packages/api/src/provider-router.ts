import { t, publicQuery } from "./router";
import { z } from "zod";

export const providerRouter = t.router({
  list: publicQuery.query(async ({ ctx }) => {
    return { providers: [] };
  }),

  status: publicQuery
    .input(z.object({ id: z.string() }).optional())
    .query(async ({ ctx, input }) => {
      return { status: "active" };
    }),
});
