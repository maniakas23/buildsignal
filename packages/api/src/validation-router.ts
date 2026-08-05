import { t, publicQuery } from "./router";
import { z } from "zod";

export const validationRouter = t.router({
  validate: publicQuery
    .input(z.object({ data: z.any() }).optional())
    .query(async ({ ctx, input }) => {
      return { valid: true, errors: [] };
    }),
});
