import { t, publicQuery } from "./router";
import { z } from "zod";
import { createKestovarEnv } from "./lib/kestovar";

export const monitoringRouter = t.router({
  kestovar: publicQuery.query(async ({ ctx }) => {
    const kestovar = createKestovarEnv(ctx.env);
    const health = await kestovar.health().catch(() => ({ ok: false, latency: -1 }));
    const capabilities = await kestovar.capabilities().catch(() => ({ capabilities: {} }));
    const metrics = kestovar.getMetrics();
    return { health, capabilities, metrics };
  }),

  summary: publicQuery.query(async ({ ctx }) => {
    return { status: "healthy", checks: {} };
  }),

  alerts: publicQuery.query(async ({ ctx }) => {
    return { alerts: [] };
  }),
});
