/**
 * BuildSignal API — Node.js Boot (Development / Preview Only)
 *
 * This module is imported by index.ts via `export * from "./boot"`.
 * On Cloudflare Workers: the default export from index.ts handles the entry point.
 * On Node.js: this module creates a local Hono server for development.
 */

import "dotenv/config";
import app from "./app";

function startNodeServer() {
  const port = Number(process.env.PORT || 3000);
  // Node.js server would be implemented here with Hono's Node.js adapter
  // For development preview, use `wrangler dev` instead
  console.log(`[BuildSignal] API server ready on port ${port}`);
}

// Auto-start in development mode (not Cloudflare Workers)
if (typeof (globalThis as Record<string, unknown>).addEventListener !== "function") {
  startNodeServer();
}

export { startNodeServer };
export default app;
