import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { eq } from "drizzle-orm";
import { users, subscriptionEvents } from "../db/schema";
import { createStripeClient } from "./lib/stripe";
import { env } from "./lib/env";
import { getDb } from "./queries/connection";
import Stripe from "stripe";

/**
 * Stripe Router — BuildSignal v1.1.1
 *
 * Handles:
 *   - Checkout session creation
 *   - Billing portal session creation
 *   - Subscription management (upgrade/downgrade/cancel)
 *   - Webhook handling with idempotency
 *   - Server-side only — no Stripe keys in frontend
 */

const STRIPE_EVENT_TYPES = [
  "checkout.session.completed",
  "invoice.paid",
  "invoice.payment_failed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
] as const;

/**
 * Non-TRPC webhook handler for the raw Hono route.
 * app.ts calls this directly with the raw body and stripe-signature header.
 */
export async function handleStripeWebhook(
  rawBody: string,
  signature: string
): Promise<Record<string, unknown>> {
  const stripe = createStripeClient();
  if (!stripe) {
    console.warn("Stripe webhook received but Stripe is not configured");
    return { received: false, error: "Stripe not configured" };
  }

  const secret = env.stripeEndpointSecret || env.stripeWebhookSecret;
  if (!secret) {
    console.warn("Stripe webhook secret not configured");
    return { received: false, error: "Webhook secret not configured" };
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err: any) {
    console.error("Stripe webhook signature verification failed:", err.message);
    // Return as object — the Hono route in app.ts will send this as JSON with appropriate status
    return { received: false, error: `Webhook signature verification failed: ${err.message}` };
  }

  const db = getDb();

  // Idempotency check
  const existing = await db
    .select()
    .from(subscriptionEvents)
    .where(eq(subscriptionEvents.stripeEventId, event.id))
    .limit(1);

  if (existing.length > 0) {
    console.log(`Stripe webhook event ${event.id} already processed — skipping`);
    return { received: true, processed: false, reason: "already processed" };
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = parseInt(session.metadata?.userId || session.client_reference_id || "", 10);
        const plan = session.metadata?.plan as "professional" | "business" | "enterprise";
        if (!isNaN(userId) && plan) {
          await db.update(users).set({ plan }).where(eq(users.id, userId));
          await db.insert(subscriptionEvents).values({
            userId,
            event: "subscribed",
            plan,
            amount: session.amount_total || null,
            stripeEventId: event.id,
            metadata: JSON.stringify({ sessionId: session.id, customerId: session.customer }),
          });
        }
        break;
      }
      case "invoice.paid":
      case "invoice.payment_failed": {
        await db.insert(subscriptionEvents).values({
          userId: 0,
          event: event.type === "invoice.paid" ? "payment_succeeded" : "payment_failed",
          plan: "scout",
          stripeEventId: event.id,
          metadata: JSON.stringify({ eventType: event.type }),
        });
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const plan = sub.metadata?.plan as "professional" | "business" | "enterprise";
        const userId = parseInt(sub.metadata?.userId || "", 10);
        if (!isNaN(userId) && plan) {
          await db.update(users).set({ plan }).where(eq(users.id, userId));
          await db.insert(subscriptionEvents).values({
            userId,
            event: sub.cancel_at_period_end ? "cancelled" : "upgraded",
            plan,
            stripeEventId: event.id,
            metadata: JSON.stringify({ subscriptionId: sub.id, status: sub.status }),
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = parseInt(sub.metadata?.userId || "", 10);
        if (!isNaN(userId)) {
          await db.update(users).set({ plan: "scout" }).where(eq(users.id, userId));
          await db.insert(subscriptionEvents).values({
            userId,
            event: "cancelled",
            plan: "scout",
            stripeEventId: event.id,
            metadata: JSON.stringify({ subscriptionId: sub.id }),
          });
        }
        break;
      }
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }
  } catch (err: any) {
    console.error(`Error processing Stripe event ${event.id}:`, err.message);
    await db.insert(subscriptionEvents).values({
      userId: 0,
      event: "error",
      plan: "scout",
      stripeEventId: event.id,
      metadata: JSON.stringify({ error: err.message, eventType: event.type }),
    });
    return { received: true, processed: false, error: err.message };
  }

  return { received: true, processed: true, eventType: event.type };
}

// ─── tRPC Router ──────────────────────────────────────────────

export const stripeRouter = createRouter({
  createCheckout: publicQuery
    .input(z.object({ plan: z.enum(["professional", "business", "enterprise"]), userId: z.number() }))
    .mutation(async ({ input }) => {
      const stripe = createStripeClient();
      if (!stripe) throw new Error("Stripe not configured");

      const priceId =
        input.plan === "professional" ? env.stripePriceProfessional :
        input.plan === "business" ? env.stripePriceBusiness : null;

      if (!priceId) throw new Error("Price ID not configured for this plan");

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${env.frontendUrl || "https://buildsignal.net"}/settings?checkout=success`,
        cancel_url: `${env.frontendUrl || "https://buildsignal.net"}/pricing?checkout=cancelled`,
        client_reference_id: String(input.userId),
        metadata: { plan: input.plan, userId: String(input.userId) },
        subscription_data: {
          metadata: { plan: input.plan, userId: String(input.userId) },
        },
      });

      return { url: session.url, sessionId: session.id };
    }),

  createBillingPortal: publicQuery
    .input(z.object({ userId: z.number(), customerId: z.string() }))
    .mutation(async ({ input }) => {
      const stripe = createStripeClient();
      if (!stripe) throw new Error("Stripe not configured");

      const session = await stripe.billingPortal.sessions.create({
        customer: input.customerId,
        return_url: `${env.frontendUrl || "https://buildsignal.net"}/settings?portal=return`,
      });

      return { url: session.url };
    }),

  cancelSubscription: publicQuery
    .input(z.object({ userId: z.number(), stripeSubscriptionId: z.string() }))
    .mutation(async ({ input }) => {
      const stripe = createStripeClient();
      if (!stripe) throw new Error("Stripe not configured");

      await stripe.subscriptions.cancel(input.stripeSubscriptionId, {
        cancellation_details: { comment: "User requested cancellation via app" },
      });

      const db = getDb();
      await db.update(users).set({ plan: "scout" }).where(eq(users.id, input.userId));
      await db.insert(subscriptionEvents).values({
        userId: input.userId,
        event: "cancelled",
        plan: "scout",
        metadata: JSON.stringify({ stripeSubscriptionId: input.stripeSubscriptionId }),
      });

      return { success: true };
    }),

  getSubscriptionStatus: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const events = await db
        .select()
        .from(subscriptionEvents)
        .where(eq(subscriptionEvents.userId, input.userId))
        .orderBy(subscriptionEvents.createdAt)
        .limit(10);
      return { events };
    }),
});
