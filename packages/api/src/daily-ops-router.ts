import { t, publicQuery, authedQuery } from "./router";
import { z } from "zod";

export const dailyOpsRouter = t.router({
  dashboard: publicQuery.query(async ({ ctx }) => {
    return { opportunities: [], tasks: [], alerts: [] };
  }),

  tasks: authedQuery.query(async ({ ctx }) => {
    return { tasks: [] };
  }),
});
