import { t, publicQuery } from "./router";
import { z } from "zod";

export const proxyRouter = t.router({
  forward: publicQuery
    .input(z.object({ url: z.string(), method: z.string() }).optional())
    .mutation(async ({ ctx, input }) => {
      return { forwarded: true };
    }),
});
