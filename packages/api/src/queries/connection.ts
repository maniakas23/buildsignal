/**
 * D1 Database Connection — Cloudflare Workers
 *
 * On Cloudflare Workers: env.DB is a D1Database binding.
 * On Node.js: DATABASE_URL environment variable (used in development only).
 */

import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";

let d1Binding: D1Database | undefined;
let cachedDb: DrizzleD1Database | undefined;

export function setD1Binding(binding: D1Database): void {
  d1Binding = binding;
  cachedDb = undefined; // Reset cache when binding changes
}

export function getDb(): DrizzleD1Database {
  if (cachedDb) return cachedDb;
  if (!d1Binding) {
    throw new Error("D1 database not configured. Call setD1Binding() before using the database.");
  }
  cachedDb = drizzle(d1Binding);
  return cachedDb;
}

export function getDbFromContext(env: Record<string, unknown>): DrizzleD1Database {
  const binding = env.DB as D1Database | undefined;
  if (!binding) {
    throw new Error("D1 database binding (DB) not available in environment.");
  }
  return drizzle(binding);
}

export function getDbFromEnv(env: { DB?: D1Database }): DrizzleD1Database {
  if (!env.DB) {
    throw new Error("D1 database binding (DB) not available in environment.");
  }
  return drizzle(env.DB);
}
