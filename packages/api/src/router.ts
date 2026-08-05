import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { TrpcContext } from "./context";

export const t = initTRPC.context<TrpcContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const publicQuery = t.procedure;

export const authedQuery = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new Error("Unauthorized");
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const adminQuery = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new Error("Unauthorized");
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

// Main router assembly
export const appRouter = router({});

export type AppRouter = typeof appRouter;
