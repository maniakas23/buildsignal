import { t, publicQuery } from "./router";
import { z } from "zod";

export const historicalValidationRouter = t.router({
  validate: publicQuery
    .input(z.object({ countyId: z.string() }).optional())
    .query(async ({ ctx, input }) => {
      return { valid: true, errors: [] };
    }),
});
