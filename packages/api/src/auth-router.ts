import { t, publicQuery } from "./router";

export const authRouter = t.router({
  me: publicQuery.query(async ({ ctx }) => {
    return ctx.user || null;
  }),
});
