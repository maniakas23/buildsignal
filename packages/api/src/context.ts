import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./kimi/auth";
import type { KestovarEnv } from "./lib/kestovar";

/**
 * BuildSignal v5.4.7 — Tenant-aware context with Kestovar client
 * Every authenticated request carries the user, their organization context,
 * and a scoped Kestovar environment for engine communication.
 *
 * ctx.kestovar provides the Cloudflare env bindings needed by the typed
 * Kestovar client. All Kestovar calls must go through this context —
 * never use globalThis or direct env.KESTOVAR.fetch() from routers.
 */
export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User; // Includes orgId, workspaceId, role for tenant isolation
  env?: Record<string, unknown>;
  /**
   * Scoped Kestovar environment. Contains the Cloudflare service binding
   * (env.KESTOVAR), API URL, API key, and internal secret.
   * Use with kestovar client functions: kestovar.health(ctx.kestovar), etc.
   */
  kestovar?: KestovarEnv;
};

export async function createContext(
  opts: FetchCreateContextFnOptions & { env?: Record<string, unknown> },
): Promise<TrpcContext> {
  const cfEnv = opts.env;
  const ctx: TrpcContext = {
    req: opts.req,
    resHeaders: opts.resHeaders,
    env: cfEnv,
  };

  if (cfEnv) {
    ctx.kestovar = {
      KESTOVAR: cfEnv.KESTOVAR as { fetch: (request: Request) => Promise<Response> } | undefined,
      KESTOVAR_API_URL: cfEnv.KESTOVAR_API_URL as string | undefined,
      KESTOVAR_API_KEY: cfEnv.KESTOVAR_API_KEY as string | undefined,
      INTERNAL_API_SECRET: cfEnv.INTERNAL_API_SECRET as string | undefined,
      APP_NAME: cfEnv.APP_NAME as string | undefined,
    };
  }

  try {
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
    // Authentication is optional here
  }
  return ctx;
}
