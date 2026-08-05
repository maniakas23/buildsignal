import { Hono } from "hono";
import { createApp } from "./app";
import type { Env } from "./app";

export default {
  async fetch(request: Request, env: Env, executionCtx: ExecutionContext) {
    const app = createApp(env);
    return app.fetch(request, env, executionCtx);
  },
};
