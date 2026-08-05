import { t, publicQuery } from "./router";
import { z } from "zod";

export const completionRouter = t.router({
  suggest: publicQuery
    .input(z.object({ query: z.string() }).optional())
    .query(async ({ ctx, input }) => {
      return { suggestions: [] };
    }),
});
