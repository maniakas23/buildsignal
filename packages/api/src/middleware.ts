import { Hono } from "hono";
import type { Context } from "hono";

export async function authMiddleware(c: Context, next: () => Promise<void>) {
  // Auth middleware placeholder
  await next();
}

export async function rateLimitMiddleware(c: Context, next: () => Promise<void>) {
  // Rate limit middleware placeholder
  await next();
}

export async function tenantMiddleware(c: Context, next: () => Promise<void>) {
  // Tenant middleware placeholder
  await next();
}
