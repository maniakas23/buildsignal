import { t, publicQuery } from "./router";
import { z } from "zod";

export const searchRouter = t.router({
  query: publicQuery
    .input(z.object({ q: z.string() }).optional())
    .query(async ({ ctx, input }) => {
      return { results: [] };
    }),
});
