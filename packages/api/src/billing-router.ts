/**
 * BuildSignal Billing Router
 * Stripe integration using direct REST API (Cloudflare Workers compatible).
 *
 * Plans: Scout → Professional → Business → Enterprise
 * All mutations are fail-closed audited.
 */

import { z } from "zod";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { resolveTenant, auditLogMandatory } from "./lib/tenant";

// ─── Stripe API Client (fetch-based, Workers-compatible) ───
const STRIPE_API_VERSION = "2024-12-18.acacia";

type StripeResult<T = unknown> = { ok: true; data: T } | { ok: false; error: string; status?: number };

async function stripeFetch<T = unknown>(path: string, env: Record<string, unknown>, options: RequestInit = {}): Promise<StripeResult<T>> {
  const secretKey = env.STRIPE_SECRET_KEY as string | undefined;
  if (!secretKey) return { ok: false, error: "Stripe not configured" };

  const url = `https://api.stripe.com/v1${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${secretKey}`,
    "Stripe-Version": STRIPE_API_VERSION,
    ...(options.body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({ error: { message: `HTTP ${response.status}` } })) as { error?: { message?: string } };
    return { ok: false, error: errBody.error?.message || `HTTP ${response.status}`, status: response.status };
  }

  const data = await response.json() as T;
  return { ok: true, data };
}

// ─── Utility: encode form data ───
function encodeForm(params: Record<string, string | number | undefined>): string {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
}

// ─── Router ───
export const billingRouter = createRouter({
  // ─── Get Publishable Key (public, for Stripe.js frontend) ───
  config: publicQuery.query(async ({ ctx }) => {
    const env = ctx.env ?? {};
    return {
      publishableKey: (env.STRIPE_PUBLISHABLE_KEY as string) || "",
      prices: {
        scout: (env.STRIPE_PRICE_SCOUT as string) || "",
        professional: (env.STRIPE_PRICE_PRO as string) || "",
        business: (env.STRIPE_PRICE_BUSINESS as string) || "",
        enterprise: (env.STRIPE_PRICE_ENTERPRISE as string) || "",
      },
    };
  }),

  // ─── Create Checkout Session ───
  createCheckout: authedQuery
    .input(z.object({
      priceId: z.string().min(1),
      successUrl: z.string().url(),
      cancelUrl: z.string().url(),
    }))
    .mutation(async ({ input, ctx }) => {
      const tenant = await resolveTenant(ctx);
      const env = ctx.env ?? {};

      // Get or create Stripe customer for this organization
      let customerId = tenant.stripeCustomerId;
      if (!customerId) {
        const custResult = await stripeFetch<{ id: string }>("/customers", env, {
          method: "POST",
          body: encodeForm({
            name: tenant.orgName || `Org ${tenant.orgId}`,
            "metadata[organizationId]": String(tenant.orgId),
            "metadata[userId]": tenant.userId,
          }),
        });
        if (!custResult.ok) return { status: "UNAVAILABLE" as const, url: null, message: custResult.error };
        customerId = custResult.data.id;
        // Store customer ID in D1
        const db = env.DB as D1Database | undefined;
        if (db) {
          await db.prepare("UPDATE organizations SET stripeCustomerId = ? WHERE id = ?")
            .bind(customerId, tenant.orgId).run();
        }
      }

      if (!customerId) return { status: "UNAVAILABLE" as const, url: null, message: "Failed to create customer" };

      const result = await stripeFetch<{ id: string; url: string }>("/checkout/sessions", env, {
        method: "POST",
        body: encodeForm({
          "customer": customerId,
          "mode": "subscription",
          "line_items[0][price]": input.priceId,
          "line_items[0][quantity]": "1",
          "success_url": input.successUrl,
          "cancel_url": input.cancelUrl,
          "allow_promotion_codes": "true",
          "billing_address_collection": "required",
          "automatic_tax[enabled]": "true",
          "subscription_data[metadata][organizationId]": String(tenant.orgId),
        }),
      });

      if (!result.ok) return { status: "UNAVAILABLE" as const, url: null, message: result.error };

      await auditLogMandatory(ctx, tenant, "billing.checkout.created", "billing", result.data.id);
      return { status: "OK" as const, url: result.data.url };
    }),

  // ─── Create Billing Portal Session ───
  createPortal: authedQuery
    .input(z.object({
      returnUrl: z.string().url(),
    }))
    .mutation(async ({ input, ctx }) => {
      const tenant = await resolveTenant(ctx);
      const env = ctx.env ?? {};

      const customerId = tenant.stripeCustomerId;
      if (!customerId) {
        return { status: "UNAVAILABLE" as const, url: null, message: "No billing account found" };
      }

      const result = await stripeFetch<{ url: string }>("/billing/sessions", env, {
        method: "POST",
        body: encodeForm({
          customer: customerId,
          return_url: input.returnUrl,
        }),
      });

      if (!result.ok) return { status: "UNAVAILABLE" as const, url: null, message: result.error };

      await auditLogMandatory(ctx, tenant, "billing.portal.created", "billing", customerId);
      return { status: "OK" as const, url: result.data.url };
    }),

  // ─── Get Subscription Status ───
  status: authedQuery.query(async ({ ctx }) => {
    const tenant = await resolveTenant(ctx);
    const env = ctx.env ?? {};

    if (!tenant.stripeCustomerId) {
      return { status: "inactive" as const, plan: tenant.orgPlan || "scout", currentPeriodEnd: null, cancelAtPeriodEnd: false };
    }

    const result = await stripeFetch<{ data: Array<{ status: string; current_period_end: number; cancel_at_period_end: boolean; items: { data: Array<{ price: { lookup_key?: string } }> } }> }>(`/customers/${tenant.stripeCustomerId}/subscriptions?status=all&limit=1`, env);
    if (!result.ok || !result.data.data?.[0]) {
      return { status: "inactive" as const, plan: tenant.orgPlan || "scout", currentPeriodEnd: null, cancelAtPeriodEnd: false };
    }

    const sub = result.data.data[0];
    return {
      status: sub.status,
      plan: sub.items?.data?.[0]?.price?.lookup_key || tenant.orgPlan || "scout",
      currentPeriodEnd: sub.current_period_end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    };
  }),

});
