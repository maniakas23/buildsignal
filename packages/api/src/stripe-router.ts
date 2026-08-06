/**
 * Stripe Router — Build 110 / v1.1.0
 * Stripe webhook handling with API version 2026-07-29.dahlia
 */

import Stripe from "stripe";
import { createRouter, publicQuery } from "./middleware";

// Stripe SDK — server-side only
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-07-29.dahlia",
});

export async function handleStripeWebhook(body: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // Handle successful checkout
        return { success: true, event: event.type, sessionId: session.id };
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        // Handle successful payment
        return { success: true, event: event.type, invoiceId: invoice.id };
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // Handle failed payment
        return { success: false, event: event.type, invoiceId: invoice.id };
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        // Handle cancellation
        return { success: true, event: event.type, subscriptionId: subscription.id };
      }
      default:
        return { success: true, event: event.type, message: "Unhandled event type" };
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Webhook verification failed" };
  }
}

export const stripeRouter = createRouter({
  // ─── Get Stripe publishable key ───
  publishableKey: publicQuery.query(async () => {
    return {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
    };
  }),

  // ─── Create checkout session ───
  createCheckoutSession: publicQuery
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const { priceId, customerEmail, successUrl, cancelUrl } = val as Record<string, string>;
      if (!priceId) throw new Error("priceId required");
      return { priceId, customerEmail, successUrl, cancelUrl };
    })
    .mutation(async ({ input }) => {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{ price: input.priceId, quantity: 1 }],
        mode: "subscription",
        customer_email: input.customerEmail,
        success_url: input.successUrl || "https://app.buildsignal.com/success",
        cancel_url: input.cancelUrl || "https://app.buildsignal.com/cancel",
      });

      return { sessionId: session.id, url: session.url };
    }),

  // ─── Create customer portal session ───
  createPortalSession: publicQuery
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const { customerId, returnUrl } = val as Record<string, string>;
      if (!customerId) throw new Error("customerId required");
      return { customerId, returnUrl };
    })
    .mutation(async ({ input }) => {
      const session = await stripe.billingPortal.sessions.create({
        customer: input.customerId,
        return_url: input.returnUrl || "https://app.buildsignal.com/settings",
      });

      return { url: session.url };
    }),
});

export type StripeRouter = typeof stripeRouter;
