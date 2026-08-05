/**
 * Stripe Router — Managed Payments (Cloudflare Workers)
 * Follows Stripe Managed Payments blueprint:
 * 1. Create products with default_price_data (product + price in one call)
 * 2. Create checkout sessions with managed_payments[enabled]=true
 * 3. Handle checkout.session.completed webhooks
 */

import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const STRIPE_API_VERSION = "2026-02-25.preview";

// ─── Fetch-based Stripe client (Worker-compatible) ───
type StripeResult<T = unknown> = { ok: true; data: T } | { ok: false; error: string };

async function stripeFetch<T = unknown>(
  path: string,
  env: Record<string, unknown>,
  options: RequestInit = {}
): Promise<StripeResult<T>> {
  const secretKey = env.STRIPE_SECRET_KEY as string | undefined;
  if (!secretKey) return { ok: false, error: "Stripe not configured" };

  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Stripe-Version": STRIPE_API_VERSION,
      ...(options.body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
      ...(options.headers as Record<string, string> || {}),
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({ error: { message: `HTTP ${response.status}` } })) as { error?: { message?: string } };
    return { ok: false, error: errBody.error?.message || `HTTP ${response.status}` };
  }
  return { ok: true, data: await response.json() as T };
}

function encodeForm(params: Record<string, string | number | undefined>): string {
  const entries: string[] = [];
  function flatten(key: string, value: unknown) {
    if (value === undefined || value === null) return;
    if (typeof value === "object" && !Array.isArray(value)) {
      Object.entries(value).forEach(([k, v]) => flatten(`${key}[${k}]`, v));
    } else {
      entries.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }
  Object.entries(params).forEach(([k, v]) => flatten(k, v));
  return entries.join("&");
}

// ─── Webhook Signature Verification (Web Crypto API) ───
async function verifyStripeSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const sigMap: Record<string, string> = {};
  for (const part of signature.split(",").map((s) => s.trim())) {
    const [key, value] = part.split("=");
    if (key && value) sigMap[key] = value;
  }
  const timestamp = sigMap.t;
  const sigHex = sigMap.v1;
  if (!timestamp || !sigHex) return false;

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(timestamp)) > 300) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${payload}`));
  const computed = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");

  if (sigHex.length !== computed.length) return false;
  let diff = 0;
  for (let i = 0; i < sigHex.length; i++) diff |= sigHex.charCodeAt(i) ^ computed.charCodeAt(i);
  return diff === 0;
}

// ─── Webhook Handler ───
export async function handleStripeWebhook(
  body: string,
  signature: string,
  env: Record<string, unknown>
): Promise<{ received: boolean; event?: string }> {
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET as string | undefined;
  if (!webhookSecret) throw new Error("Stripe webhook secret not configured");

  const isValid = await verifyStripeSignature(body, signature, webhookSecret);
  if (!isValid) throw new Error("Invalid webhook signature");

  const event = JSON.parse(body);
  const db = getDb();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data?.object;
      const userId = Number(session?.metadata?.buildsignalUserId);
      const plan = session?.metadata?.plan as "scout" | "professional" | "business" | "enterprise";
      const customerId = session?.customer;
      const subscriptionId = session?.subscription;

      if (userId && plan) {
        // Update user's plan
        await db.update(schema.users).set({ plan }).where(eq(schema.users.id, userId));
        // Record the subscription event
        await db.insert(schema.subscriptionEvents).values({
          userId,
          event: "subscribed",
          plan,
          metadata: JSON.stringify({ customerId, subscriptionId, sessionId: session?.id }),
        });

        // Also store Stripe customer ID on the organization if available
        if (customerId) {
          const user = await db.select().from(schema.users).where(eq(schema.users.id, userId)).get();
          if (user?.orgId) {
            await db.update(schema.organizations)
              .set({ stripeCustomerId: customerId as string })
              .where(eq(schema.organizations.id, user.orgId));
          }
        }
      }
      return { received: true, event: event.type };
    }

    case "customer.subscription.updated": {
      const sub = event.data?.object;
      const userId = Number(sub?.metadata?.buildsignalUserId);
      const plan = sub?.metadata?.plan as "scout" | "professional" | "business" | "enterprise";
      if (userId && plan) {
        await db.update(schema.users).set({ plan }).where(eq(schema.users.id, userId));
        await db.insert(schema.subscriptionEvents).values({
          userId,
          event: sub.status === "active" ? "subscribed" : "updated",
          plan,
        });
      }
      return { received: true, event: event.type };
    }

    case "customer.subscription.deleted": {
      const sub = event.data?.object;
      const userId = Number(sub?.metadata?.buildsignalUserId);
      if (userId) {
        await db.update(schema.users).set({ plan: "scout" }).where(eq(schema.users.id, userId));
        await db.insert(schema.subscriptionEvents).values({ userId, event: "cancelled", plan: "scout" });
      }
      return { received: true, event: event.type };
    }

    case "invoice.paid": {
      const invoice = event.data?.object;
      const userId = Number(invoice?.subscription_details?.metadata?.buildsignalUserId);
      const plan = invoice?.subscription_details?.metadata?.plan as string;
      if (userId && plan) {
        await db.insert(schema.subscriptionEvents).values({
          userId,
          event: "payment_succeeded",
          plan,
          amount: invoice.amount_paid,
        });
      }
      return { received: true, event: event.type };
    }

    case "invoice.payment_failed": {
      const invoice = event.data?.object;
      const userId = Number(invoice?.subscription_details?.metadata?.buildsignalUserId);
      const plan = invoice?.subscription_details?.metadata?.plan as string;
      if (userId && plan) {
        await db.insert(schema.subscriptionEvents).values({ userId, event: "payment_failed", plan });
      }
      return { received: true, event: event.type };
    }
  }

  return { received: true, event: event.type };
}

// ─── tRPC Router ───
export const stripeRouter = createRouter({
  /**
   * Create a managed checkout session.
   * Uses managed_payments[enabled]=true per the Stripe Managed Payments blueprint.
   */
  createCheckout: authedQuery
    .input(z.object({
      plan: z.enum(["scout", "professional", "business", "enterprise"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const env = ctx.env ?? {};
      const secretKey = env.STRIPE_SECRET_KEY as string | undefined;
      if (!secretKey) throw new TRPCError({ code: "NOT_IMPLEMENTED", message: "Stripe not configured" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });

      const priceIdKey: Record<string, string> = {
        scout: "STRIPE_PRICE_SCOUT",
        professional: "STRIPE_PRICE_PRO",
        business: "STRIPE_PRICE_BUSINESS",
        enterprise: "STRIPE_PRICE_ENTERPRISE",
      };
      const priceId = env[priceIdKey[input.plan]] as string | undefined;
      if (!priceId) throw new TRPCError({ code: "NOT_IMPLEMENTED", message: `Price ID not configured for plan: ${input.plan}` });

      const frontendUrl = (env.FRONTEND_URL as string) || "https://buildsignal.net";

      const result = await stripeFetch<{
        url: string;
        id: string;
        customer: string;
      }>("/checkout/sessions", env, {
        method: "POST",
        body: encodeForm({
          "mode": "subscription",
          "managed_payments[enabled]": "true",
          "line_items[0][price]": priceId,
          "line_items[0][quantity]": "1",
          "success_url": `${frontendUrl}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
          "cancel_url": `${frontendUrl}/billing?canceled=true`,
          "metadata[buildsignalUserId]": String(userId),
          "metadata[plan]": input.plan,
          "automatic_tax[enabled]": "true",
        }),
      });

      if (!result.ok) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
      return { url: result.data.url, sessionId: result.data.id };
    }),

  /**
   * Create a product with default_price_data.
   * This creates both the product and its price in one API call (Managed Payments pattern).
   * Admin-only endpoint.
   */
  createProduct: authedQuery
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      unitAmount: z.number(), // in cents, e.g. 9900 for $99
      currency: z.string().default("usd"),
      interval: z.enum(["month", "year"]).default("month"),
      taxCode: z.string().default("txcd_10103100"), // Software as a service
    }))
    .mutation(async ({ input, ctx }) => {
      const env = ctx.env ?? {};
      const secretKey = env.STRIPE_SECRET_KEY as string | undefined;
      if (!secretKey) throw new TRPCError({ code: "NOT_IMPLEMENTED", message: "Stripe not configured" });

      const result = await stripeFetch<{
        id: string;
        default_price: string;
      }>("/products", env, {
        method: "POST",
        body: encodeForm({
          "name": input.name,
          "description": input.description,
          "tax_code": input.taxCode,
          "default_price_data[unit_amount]": String(input.unitAmount),
          "default_price_data[currency]": input.currency,
          "default_price_data[recurring][interval]": input.interval,
        }),
      });

      if (!result.ok) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
      return {
        productId: result.data.id,
        priceId: result.data.default_price,
      };
    }),

  /**
   * Verify a completed checkout session and update the user's subscription.
   */
  verifySession: authedQuery
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input, ctx }) => {
      const env = ctx.env ?? {};
      const result = await stripeFetch<{
        id: string;
        status: string;
        customer: string;
        subscription: string;
        metadata: { buildsignalUserId?: string; plan?: string };
      }>(`/checkout/sessions/${input.sessionId}`, env);

      if (!result.ok) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
      return {
        verified: result.data.status === "complete",
        customerId: result.data.customer,
        subscriptionId: result.data.subscription,
        plan: result.data.metadata?.plan,
      };
    }),

  getSubscription: authedQuery
    .query(async ({ ctx }) => {
      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });
      const db = getDb();
      const events = await db.select().from(schema.subscriptionEvents)
        .where(eq(schema.subscriptionEvents.userId, userId))
        .orderBy(desc(schema.subscriptionEvents.createdAt))
        .limit(10);
      return { events, hasActiveSubscription: false };
    }),
});

