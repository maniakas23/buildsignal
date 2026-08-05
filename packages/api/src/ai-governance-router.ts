import { t, publicQuery, authedQuery, adminQuery } from "./router";
import { z } from "zod";

export const aiGovernanceRouter = t.router({
  list: publicQuery.query(async ({ ctx }) => {
    return { policies: [] };
  }),
  create: adminQuery
    .input(z.object({ name: z.string(), rules: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      return { id: "1", name: input.name };
    }),
});
