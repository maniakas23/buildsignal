import { t, publicQuery, authedQuery } from "./router";
import { z } from "zod";

const STRIPE_API = "https://api.stripe.com/v1";

export async function getStripeProducts(secretKey: string) {
  const response = await fetch(`${STRIPE_API}/products?active=true`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  if (!response.ok) throw new Error(`Stripe error: ${response.status}`);
  return response.json();
}

export async function createCheckoutSession(secretKey: string, priceId: string, customerEmail: string, successUrl: string, cancelUrl: string) {
  const response = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      "subscription_data[metadata][app]": "buildsignal",
    }),
  });
  if (!response.ok) throw new Error(`Stripe checkout error: ${response.status}`);
  return response.json();
}

export async function getCustomerPortal(secretKey: string, customerId: string, returnUrl: string) {
  const response = await fetch(`${STRIPE_API}/billing_portal/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      customer: customerId,
      return_url: returnUrl,
    }),
  });
  if (!response.ok) throw new Error(`Stripe portal error: ${response.status}`);
  return response.json();
}

export const stripeRouter = t.router({
  createCheckout: authedQuery
    .input(z.object({ plan: z.enum(["scout", "professional", "business", "enterprise"]) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;
      if (!userId) throw new Error("Unauthorized");

      const priceMap: Record<string, string> = {
        scout: "price_1U0sP8HXCBDUF0R2ejHnOZ2Rm6aodBUPFBQwF9MuPzuzT6fy06UWhRgV89zIU8oR9AqUplC2vDcKbpgi5LKULzcp007TCrtCRa",
        professional: "price_1U0sP9HXCBDUF0R2ejHnOZ2Rm6aodBUPFBQwF9MuPzuzT6fy06UWhRgV89zIU8oR9AqUplC2vDcKbpgi5LKULzcp007TCrtCRa",
        business: "price_1U0sPAHXCBDUF0R2ejHnOZ2Rm6aodBUPFBQwF9MuPzuzT6fy06UWhRgV89zIU8oR9AqUplC2vDcKbpgi5LKULzcp007TCrtCRa",
        enterprise: "price_1U0sPlHXCBDUF0R2ejHnOZ2Rm6aodBUPFBQwF9MuPzuzT6fy06UWhRgV89zIU8oR9AqUplC2vDcKbpgi5LKULzcp007TCrtCRa",
      };

      const session = await createCheckoutSession(
        ctx.env.STRIPE_SECRET_KEY,
        priceMap[input.plan],
        ctx.user.email,
        "https://buildsignal.net/billing",
        "https://buildsignal.net/pricing"
      );

      return { url: session.url };
    }),

  getSubscription: authedQuery.query(async ({ ctx }) => {
    const userId = ctx.user?.id;
    if (!userId) return { status: "inactive", planId: null, currentPeriodEnd: null, cancelAtPeriodEnd: false, portalUrl: null };

    return { status: "inactive", planId: null, currentPeriodEnd: null, cancelAtPeriodEnd: false, portalUrl: null };
  }),

  getCustomerPortal: authedQuery.query(async ({ ctx }) => {
    return { url: null };
  }),
});
