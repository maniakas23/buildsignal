import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { Env } from "./app";
import { createKestovarEnv } from "./lib/kestovar";
import type { KestovarEnv } from "./lib/kestovar";

export interface TrpcContext {
  req: Request;
  env: Env;
  db: any;
  user: any;
  kestovar?: KestovarEnv;
}

export async function createContext({
  req,
  env,
}: FetchCreateContextFnOptions & { env: Env }): Promise<TrpcContext> {
  const kestovar = createKestovarEnv(env);
  
  return {
    req,
    env,
    db: env.DB,
    user: null,
    kestovar,
  };
}
