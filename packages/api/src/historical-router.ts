import { t, publicQuery } from "./router";
import { z } from "zod";

export const historicalRouter = t.router({
  trends: publicQuery
    .input(z.object({ countyId: z.string() }).optional())
    .query(async ({ ctx, input }) => {
      return { trends: [] };
    }),
});
