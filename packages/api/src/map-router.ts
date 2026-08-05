import { t, publicQuery } from "./router";
import { z } from "zod";

export const mapRouter = t.router({
  layers: publicQuery.query(async ({ ctx }) => {
    return { layers: [] };
  }),

  counties: publicQuery
    .input(z.object({ bbox: z.string() }).optional())
    .query(async ({ ctx, input }) => {
      return { counties: [] };
    }),
});
