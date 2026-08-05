import { t, publicQuery } from "./router";
import { z } from "zod";

export const liveIntelligenceRouter = t.router({
  feed: publicQuery.query(async ({ ctx }) => {
    return { items: [] };
  }),

  alerts: publicQuery.query(async ({ ctx }) => {
    return { alerts: [] };
  }),
});
