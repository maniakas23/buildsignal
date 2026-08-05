import { t, publicQuery, authedQuery } from "./router";
import { z } from "zod";

export const enrichmentRouter = t.router({
  enrich: publicQuery
    .input(z.object({ countyId: z.string() }).optional())
    .query(async ({ ctx, input }) => {
      return { data: {} };
    }),
});
