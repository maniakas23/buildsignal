/**
 * Environment variable loader — Cloudflare Workers compatible.
 *
 * On Cloudflare Workers: env bindings are passed via request context (ctx.env).
 * This module reads from process.env which is polyfilled by the Worker runtime.
 * No Node.js or dotenv code is used — this is Worker-native only.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  appId: required("APP_ID"),
  appSecret: required("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: process.env.DATABASE_URL,
  kimiAuthUrl: process.env.KIMI_AUTH_URL,
  kimiOpenUrl: process.env.KIMI_OPEN_URL,
  ownerUnionId: process.env.OWNER_UNION_ID,
  // Stripe configuration (server-side only)
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  stripePriceScout: process.env.STRIPE_PRICE_SCOUT,
  stripePriceProfessional: process.env.STRIPE_PRICE_PROFESSIONAL,
  stripePriceBusiness: process.env.STRIPE_PRICE_BUSINESS,
};
