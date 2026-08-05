import { t, publicQuery } from "./router";
import { z } from "zod";

export const notificationRouter = t.router({
  settings: publicQuery.query(async ({ ctx }) => {
    return { channels: [] };
  }),

  send: publicQuery
    .input(z.object({ message: z.string() }).optional())
    .mutation(async ({ ctx, input }) => {
      return { sent: true };
    }),
});
