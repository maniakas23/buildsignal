bhook] idempotency check error:", e.message);
  }
  try {
    switch (eventType) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const customerEmail = session.customer_email || session.customer_details?.email;
        const lineItems = session.line_items?.data || [];
        const priceId = lineItems[0]?.price?.id;
        const lookupKey = lineItems[0]?.price?.lookup_key;
        let plan = resolvePlanFromPrice(priceId, lookupKey);
        if (!plan) {
          console.error("[Stripe Webhook] checkout.session.completed: unknown price ID=" + priceId + " lookup_key=" + lookupKey);
          return new Response(JSON.stringify({ error: "Unknown price ID", priceId }), { status: 400, headers: { "Content-Type": "application/json" } });
        }
        await d1Run(db, "UPDATE organizations SET stripeCustomerId = ?, stripeSubscriptionId = ?, plan = ?, status = 'active', updatedAt = datetime('now') WHERE stripeCustomerId = ? OR (ownerUnionId IN (SELECT unionId FROM users WHERE email = ?))", [customerId, subscriptionId, plan, customerId, customerEmail]);
        await d1Run(db, "INSERT INTO subscription_events (userId, event, plan, stripeEventId, createdAt, provenance) VALUES (?, ?, ?, ?, ?, 'LIVE')", [session.client_reference_id || 0, "checkout.completed", plan, eventId, Math.floor(Date.now() / 1e3)]);
        console.log("[Stripe Webhook] checkout.session.completed processed for customer=" + customerId + " plan=" + plan);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object;
        const customerId = sub.customer;
        const status = sub.status;
        const priceId = sub.items?.data?.[0]?.price?.id;
        const lookupKey = sub.items?.data?.[0]?.price?.lookup_key;
        let plan = resolvePlanFromPrice(priceId, lookupKey);
        if (!plan) {
          console.error("[Stripe Webhook] " + eventType + ": unknown price ID=" + priceId + " lookup_key=" + lookupKey);
          return new Response(JSON.stringify({ error: "Unknown price ID", priceId }), { status: 400, headers: { "Content-Type": "application/json" } });
        }
        await d1Run(db, "UPDATE organizations SET stripeSubscriptionId = ?, plan = ?, status = ?, updatedAt = datetime('now') WHERE stripeCustomerId = ?", [sub.id, plan, status, customerId]);
        await d1Run(db, "INSERT INTO subscription_events (userId, event, plan, stripeEventId, createdAt, provenance) VALUES (?, ?, ?, ?, ?, 'LIVE')", [0, eventType, plan, eventId, Math.floor(Date.now() / 1e3)]);
        console.log("[Stripe Webhook] " + eventType + " processed for customer=" + customerId + " status=" + status + " plan=" + plan);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const customerId = sub.customer;
        await d1Run(db, "UPDATE organizations SET stripeSubscriptionId = NULL, plan = 'starter', status = 'active', updatedAt = datetime('now') WHERE stripeCustomerId = ?", [customerId]);
        await d1Run(db, "INSERT INTO subscription_events (userId, event, plan, stripeEventId, createdAt, provenance) VALUES (?, ?, ?, ?, ?, 'LIVE')", [0, "subscription.cancelled", "starter", eventId, Math.floor(Date.now() / 1e3)]);
        console.log("[Stripe Webhook] subscription deleted for customer=" + customerId + ", downgraded to starter");
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object;
        await d1Run(db, "INSERT INTO subscription_events (userId, event, plan, amount, stripeEventId, createdAt, provenance) VALUES (?, ?, ?, ?, ?, ?, 'LIVE')", [0, "invoice.paid", "pro", invoice.amount_paid, eventId, Math.floor(Date.now() / 1e3)]);
        console.log("[Stripe Webhook] invoice.paid for customer=" + invoice.customer);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        await d1Run(db, "INSERT INTO subscription_events (userId, event, plan, stripeEventId, createdAt, provenance) VALUES (?, ?, ?, ?, ?, 'LIVE')", [0, "invoice.payment_failed", "pro", eventId, Math.floor(Date.now() / 1e3)]);
        await d1Run(db, "UPDATE organizations SET status = 'past_due', updatedAt = datetime('now') WHERE stripeCustomerId = ?", [invoice.customer]);
        console.log("[Stripe Webhook] invoice.payment_failed for customer=" + invoice.customer);
        break;
      }
      default: {
        console.log("[Stripe Webhook] unhandled event type: " + eventType);
      }
    }
  } catch (e) {
    console.error("[Stripe Webhook] processing error:", e.message);
    return new Response(JSON.stringify({ received: true, type: eventType, error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
  return new Response(JSON.stringify({ received: true, type: eventType, processed: true }), { headers: { "Content-Type": "application/json" } });
}
__name(handleStripeWebhook, "handleStripeWebhook");
__name2(handleStripeWebhook, "handleStripeWebhook");
var PLAN_LIMITS = {
  starter: { counties: 5, alerts: 1, teamMembers: 1, apiAccess: false, advancedSearch: false, exports: false, watchlists: 1 },
  pro: { counties: 25, alerts: 5, teamMembers: 5, apiAccess: true, advancedSearch: true, exports: true, watchlists: 10 },
  business: { counties: 999, alerts: 999, teamMembers: 999, apiAccess: true, advancedSearch: true, exports: true, watchlists: 999 },
  enterprise: { counties: 999, alerts: 999, teamMembers: 999, apiAccess: true, advancedSearch: true, exports: true, watchlists: 999 }
};
var PRICE_TO_PLAN = {
  // BuildSignal Scout ($99/mo) → starter
  "price_1U0sP8HXCBDUF0R2X47ogHQG": "starter",
  // BuildSignal Professional ($249/mo) → pro
  "price_1U0sP9HXCBDUF0R2xy5mGBGk": "pro",
  // BuildSignal Business ($599/mo) → business
  "price_1U0sPAHXCBDUF0R2BXYqNpGR": "business",
  // BuildSignal Enterprise ($599/mo) → enterprise
  "price_1U0sPlHXCBDUF0R2mAW8UfKT": "enterprise"
};
var LOOKUP_KEY_TO_PLAN = {
  "starter": "starter",
  "professional": "pro",
  "business": "business",
  "enterprise": "enterprise"
};
function resolvePlanFromPrice(priceId, lookupKey) {
  if (priceId && PRICE_TO_PLAN[priceId]) {
    return PRICE_TO_PLAN[priceId];
  }
  if (lookupKey && LOOKUP_KEY_TO_PLAN[lookupKey]) {
    return LOOKUP_KEY_TO_PLAN[lookupKey];
  }
  if (lookupKey && PLAN_LIMITS[lookupKey]) {
    return lookupKey;
  }
  return null;
}
__name(resolvePlanFromPrice, "resolvePlanFromPrice");
__name2(resolvePlanFromPrice, "resolvePlanFromPrice");
async function getUserEntitlements(db, userId) {
  try {
    const { results } = await d1Query(db, "SELECT plan, trialStatus, trialEndsAt FROM users WHERE id = ?", [userId]);
    if (!results || results.length === 0) return { plan: "starter", counties: 5, alerts: 1, teamMembers: 1, apiAccess: false, advancedSearch: false, exports: false, watchlists: 1, trial: null };
    const user = results[0];
    let plan = user.plan || "starter";
    let trial = null;
    if (user.trialStatus && user.trialStatus !== "none") {
      const now = /* @__PURE__ */ new Date();
      const endsAt = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
      const daysRemaining = endsAt ? Math.ceil((endsAt - now) / (1e3 * 60 * 60 * 24)) : 0;
      trial = { status: user.trialStatus, endsAt: user.trialEndsAt, daysRemaining: Math.max(0, daysRemaining) };
      if (endsAt && now > endsAt && user.trialStatus === "active") {
        await d1Run(db, "UPDATE users SET trialStatus = 'expired', plan = 'starter' WHERE id = ?", [userId]);
        trial.status = "expired";
        plan = "starter";
      }
    }
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.starter;
    return {
      plan,
      counties: limits.counties,
      alerts: limits.alerts,
      teamMembers: limits.teamMembers,
      apiAccess: limits.apiAccess,
      advancedSearch: limits.advancedSearch,
      exports: limits.exports,
      watchlists: limits.watchlists,
      trial
    };
  } catch (e) {
    console.error("[entitlements] error:", e.message);
    return { plan: "starter", counties: 5, alerts: 1, teamMembers: 1, apiAccess: false, advancedSearch: false, exports: false, watchlists: 1, trial: null };
  }
}
__name(getUserEntitlements, "getUserEntitlements");
__name2(getUserEntitlements, "getUserEntitlements");
async function enforceEntitlement(db, userId, resource, currentUsage) {
  const ent = await getUserEntitlements(db, userId);
  const limit = ent[resource];
  if (limit === void 0) return { allowed: true, ent };
  if (currentUsage >= limit) return { allowed: false, reason: `${resource} limit reached: ${limit}`, ent };
  return { allowed: true, remaining: limit - currentUsage, ent };
}
__name(enforceEntitlement, "enforceEntitlement");
__name2(enforceEntitlement, "enforceEntitlement");
async function startTrial(db, userId) {
  const { results: userCheck } = await d1Query(db, "SELECT id, trialStatus FROM users WHERE id = ?", [userId]);
  if (!userCheck || userCheck.length === 0) {
    return { error: "User not found" };
  }
  const existing = userCheck[0].trialStatus;
  if (existing === "active") return { error: "Trial already active" };
  if (existing === "converted") return { error: "Trial already converted to paid" };
  if (existing === "expired") return { error: "Trial already expired. Please upgrade to a paid plan." };
  const now = /* @__PURE__ */ new Date();
  const endsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1e3);
  await d1Run(db, "UPDATE users SET trialStartedAt = ?, trialEndsAt = ?, trialStatus = 'active' WHERE id = ?", [now.toISOString(), endsAt.toISOString(), userId]);
  return { startedAt: now.