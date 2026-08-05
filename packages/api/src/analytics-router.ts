import { t, publicQuery } from "./router";
import { z } from "zod";

export const analyticsRouter = t.router({
  summary: publicQuery.query(async ({ ctx }) => {
    return { events: 0, users: 0, sessions: 0 };
  }),

  events: publicQuery
    .input(
      z.object({
        event: z.string(),
        from: z.string().optional(),
        to: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      return { count: 0, events: [] };
    }),
});
