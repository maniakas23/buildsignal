import { t, publicQuery } from "./router";
import { z } from "zod";

export const notificationsRouter = t.router({
  list: publicQuery.query(async ({ ctx }) => {
    return { notifications: [] };
  }),

  markRead: publicQuery
    .input(z.object({ id: z.string() }).optional())
    .mutation(async ({ ctx, input }) => {
      return { marked: true };
    }),
});
