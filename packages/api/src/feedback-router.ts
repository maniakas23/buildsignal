import { t, publicQuery } from "./router";
import { z } from "zod";

export const feedbackRouter = t.router({
  submit: publicQuery
    .input(z.object({ message: z.string() }).optional())
    .mutation(async ({ ctx, input }) => {
      return { success: true };
    }),
});
