import { t, publicQuery } from "./router";
import { z } from "zod";

export const learningLoopRouter = t.router({
  feedback: publicQuery
    .input(z.object({ model: z.string(), feedback: z.string() }).optional())
    .mutation(async ({ ctx, input }) => {
      return { received: true };
    }),
});
