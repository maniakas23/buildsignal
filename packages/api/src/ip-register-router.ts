import { t, publicQuery, authedQuery } from "./router";
import { z } from "zod";

export const ipRegisterRouter = t.router({
  list: publicQuery.query(async ({ ctx }) => {
    return { ips: [] };
  }),

  register: authedQuery
    .input(z.object({ ip: z.string(), countyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return { id: "1", ip: input.ip };
    }),
});
