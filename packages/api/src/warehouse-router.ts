import { t, publicQuery } from "./router";
import { z } from "zod";

export const warehouseRouter = t.router({
  query: publicQuery
    .input(z.object({ sql: z.string() }).optional())
    .query(async ({ ctx, input }) => {
      return { results: [] };
    }),
});
