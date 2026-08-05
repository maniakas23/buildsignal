import { t, publicQuery } from "./router";
import { z } from "zod";
import { KESTOVAR_CONTRACT_VERSION } from "./contracts/constants";

export const billingRouter = t.router({
  config: publicQuery.query(async ({ ctx }) => {
    const config = {
      publishableKey: ctx.env.STRIPE_PUBLISHABLE_KEY,
      prices: {
        scout: "price_1U0sP8HXCBDUF0R2ejHnOZ2Rm6aodBUPFBQwF9MuPzuzT6fy06UWhRgV89zIU8oR9AqUplC2vDcKbpgi5LKULzcp007TCrtCRa",
        professional: "price_1U0sP9HXCBDUF0R2ejHnOZ2Rm6aodBUPFBQwF9MuPzuzT6fy06UWhRgV89zIU8oR9AqUplC2vDcKbpgi5LKULzcp007TCrtCRa",
        business: "price_1U0sPAHXCBDUF0R2ejHnOZ2Rm6aodBUPFBQwF9MuPzuzT6fy06UWhRgV89zIU8oR9AqUplC2vDcKbpgi5LKULzcp007TCrtCRa",
        enterprise: "price_1U0sPlHXCBDUF0R2ejHnOZ2Rm6aodBUPFBQwF9MuPzuzT6fy06UWhRgV89zIU8oR9AqUplC2vDcKbpgi5LKULzcp007TCrtCRa",
      },
      currency: "usd",
      plans: [
        {
          id: "scout",
          name: "Scout",
          price: 99,
          interval: "month",
          description: "Basic monitoring for 5 counties",
          features: ["5 county monitoring", "Daily intelligence briefings", "Email alerts", "Basic analytics"],
          cta: "Start with Scout",
        },
        {
          id: "professional",
          name: "Professional",
          price: 249,
          interval: "month",
          description: "Full intelligence for 20 counties",
          features: ["20 county monitoring", "Real-time alerts", "Priority recommendations", "Advanced analytics", "API access"],
          cta: "Upgrade to Professional",
          highlighted: true,
        },
        {
          id: "business",
          name: "Business",
          price: 599,
          interval: "month",
          description: "API access for 50 counties",
          features: ["50 county monitoring", "Full API access", "Custom reports", "Priority support", "Team collaboration"],
          cta: "Contact Sales",
        },
        {
          id: "enterprise",
          name: "Enterprise",
          price: 0,
          interval: "year",
          description: "Custom pricing with unlimited counties",
          features: ["Unlimited counties", "SSO authentication", "Dedicated support", "SLA guarantee", "Custom integrations"],
          cta: "Contact Enterprise Sales",
        },
      ],
    };
    return config;
  }),
});
