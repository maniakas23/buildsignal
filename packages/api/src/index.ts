/**
 * BuildSignal API Entry Point — Cloudflare Workers
 * Exports the Hono app with security headers, rate limiting, CORS,
 * health checks, tRPC API, Stripe webhooks, SAML SSO, and Kestovar Engine
 * service binding proxy.
 *
 * Worker: buildsignal-worker (deployed to Cloudflare Workers)
 * Pages: buildsignal-frontend (deployed to Cloudflare Pages)
 */

import app from "./app";

// Cloudflare Worker entry point — direct export for wrangler deploy
export default app;

// Optional: Node.js server boot (not used in Workers)
export * from "./boot";
