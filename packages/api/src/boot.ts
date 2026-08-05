import { Hono } from "hono";
import type { Env } from "./app";

export function boot(env: Env) {
  console.log(`BuildSignal ${env.APP_NAME} booting...`);
  return {
    env,
    ready: true,
  };
}
