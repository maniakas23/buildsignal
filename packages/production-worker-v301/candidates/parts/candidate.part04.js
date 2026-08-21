ctive" });
  }
}
__name(handleStripeGetSubscription, "handleStripeGetSubscription");
__name2(handleStripeGetSubscription, "handleStripeGetSubscription");
async function handleStripeCreateCheckout(env2, input, db, userId) {
  try {
    if (!env2.STRIPE_SECRET_KEY) return trpcError("Stripe not configured");
    const body = input || {};
    const priceId = body.priceId || env2.STRIPE_PRICE_PRO;
    const plan = resolvePlanFromPrice(priceId, null);
    if (!plan) {
      return trpcError("Invalid price ID: not an approved BuildSignal plan", "BAD_REQUEST");
    }
    if (db && userId && body.customerId) {
      const { results: orgCheck } = await d1Query(db, "SELECT id FROM organizations WHERE ownerUnionId = (SELECT unionId FROM users WHERE id = ?) AND stripeCustomerId = ?", [userId, body.customerId]);
      if (!orgCheck || orgCheck.length === 0) {
        return trpcError("Unauthorized: customer does not belong to user", "UNAUTHORIZED");
      }
    }
    const p = new URLSearchParams();
    p.append("mode", "subscription");
    if (body.customerId) p.append("customer", body.customerId);
    if (body.customerEmail) p.append("customer_email", body.customerEmail);
    p.append("line_items[0][price]", priceId);
    p.append("line_items[0][quantity]", "1");
    p.append("success_url", (body.origin || "https://buildsignal.net") + "/billing?success=true&session_id={CHECKOUT_SESSION_ID}");
    p.append("cancel_url", (body.origin || "https://buildsignal.net") + "/billing?canceled=true");
    p.append("allow_promotion_codes", "true");
    p.append("billing_address_collection", "required");
    p.append("automatic_tax[enabled]", "true");
    if (userId) p.append("client_reference_id", String(userId));
    const resp = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { "Authorization": "Bearer " + env2.STRIPE_SECRET_KEY, "Content-Type": "application/x-www-form-urlencoded" }, body: p.toString() });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error?.message);
    return trpcResult({ url: data.url, plan });
  } catch (e) {
    console.error("[stripe.createCheckout]", e.message);
    return trpcError(e.message);
  }
}
__name(handleStripeCreateCheckout, "handleStripeCreateCheckout");
__name2(handleStripeCreateCheckout, "handleStripeCreateCheckout");
async function handleStripeCreatePortal(env2, input, db, userId) {
  try {
    if (!env2.STRIPE_SECRET_KEY) return trpcError("Stripe not configured");
    const body = input || {};
    if (!body.customerId) return trpcError("Missing customerId");
    if (db && userId) {
      const { results: orgCheck } = await d1Query(db, "SELECT id FROM organizations WHERE ownerUnionId = (SELECT unionId FROM users WHERE id = ?) AND stripeCustomerId = ?", [userId, body.customerId]);
      if (!orgCheck || orgCheck.length === 0) {
        return trpcError("Unauthorized: customer does not belong to user", "UNAUTHORIZED");
      }
    }
    const p = new URLSearchParams();
    p.append("customer", body.customerId);
    p.append("return_url", (body.origin || "https://buildsignal.net") + "/billing");
    const resp = await fetch("https://api.stripe.com/v1/billing_portal/sessions", { method: "POST", headers: { "Authorization": "Bearer " + env2.STRIPE_SECRET_KEY, "Content-Type": "application/x-www-form-urlencoded" }, body: p.toString() });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error?.message);
    return trpcResult({ url: data.url });
  } catch (e) {
    console.error("[stripe.createPortal]", e.message);
    return trpcError(e.message);
  }
}
__name(handleStripeCreatePortal, "handleStripeCreatePortal");
__name2(handleStripeCreatePortal, "handleStripeCreatePortal");
async function handleRecommendationList(db, input) {
  try {
    const { status, priority, category, limit, page } = input || {};
    let sql = "SELECT * FROM recommendations WHERE provenance = 'LIVE'";
    const params = [];
    if (status) {
      sql += " AND status=?";
      params.push(status);
    }
    if (priority) {
      sql += " AND priority=?";
      params.push(priority);
    }
    if (category) {
      sql += " AND category=?";
      params.push(category);
    }
    sql += " ORDER BY generatedAt DESC LIMIT ? OFFSET ?";
    params.push(limit || 24, ((page || 1) - 1) * (limit || 24));
    const { results } = await d1Query(db, sql, params);
    const { results: cr } = await d1Query(db, "SELECT COUNT(*) as count FROM recommendations WHERE provenance = 'LIVE'");
    return trpcResult({ items: results || [], total: cr[0]?.count || 0 });
  } catch (e) {
    console.error("[recommendation.list]", e.message);
    return trpcResult({ items: [], total: 0 });
  }
}
__name(handleRecommendationList, "handleRecommendationList");
__name2(handleRecommendationList, "handleRecommendationList");
async function handleRecommendationSummary(db) {
  try {
    const { results: total } = await d1Query(db, "SELECT COUNT(*) as count FROM recommendations");
    const { results: active } = await d1Query(db, "SELECT COUNT(*) as count FROM recommendations WHERE status='active'");
    const { results: high } = await d1Query(db, "SELECT COUNT(*) as count FROM recommendations WHERE priority='high'");
    return trpcResult({ total: total[0]?.count || 0, active: active[0]?.count || 0, highPriority: high[0]?.count || 0, avgConfidence: 0 });
  } catch (e) {
    console.error("[recommendation.summary]", e.message);
    return trpcResult({ total: 0, active: 0, highPriority: 0, avgConfidence: 0 });
  }
}
__name(handleRecommendationSummary, "handleRecommendationSummary");
__name2(handleRecommendationSummary, "handleRecommendationSummary");
async function handleProviderSummary(db) {
  try {
    const { results } = await d1Query(db, "SELECT COUNT(*) as total, AVG(healthScore) as avgHealth FROM providers");
    const r = results[0] || {};
    return trpcResult({ total: r.total || 0, avgHealth: Math.round(r.avgHealth || 0) });
  } catch (e) {
    console.error("[provider.summary]", e.message);
    return trpcResult({ total: 0, avgHealth: 0 });
  }
}
__name(handleProviderSummary, "handleProviderSummary");
__name2(handleProviderSummary, "handleProviderSummary");
async function verifyStripeSignature(payload, signatureHeader, secret) {
  const sigParts = signatureHeader.split(",").reduce((acc, part) => {
    const [key, val] = part.trim().split("=");
    acc[key] = val;
    return acc;
  }, {});
  const timestamp = sigParts.t;
  const signature = sigParts.v1;
  if (!timestamp || !signature) {
    throw new Error("Invalid signature header format");
  }
  const now = Math.floor(Date.now() / 1e3);
  if (Math.abs(now - parseInt(timestamp)) > 300) {
    throw new Error("Timestamp too old");
  }
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const message = encoder.encode(timestamp + "." + payload);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, message);
  const computedSig = Array.from(new Uint8Array(signatureBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
  if (computedSig.length !== signature.length) {
    throw new Error("Signature mismatch");
  }
  let mismatch = 0;
  for (let i = 0; i < computedSig.length; i++) {
    mismatch |= computedSig.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  if (mismatch !== 0) {
    throw new Error("Signature mismatch");
  }
  return JSON.parse(payload);
}
__name(verifyStripeSignature, "verifyStripeSignature");
__name2(verifyStripeSignature, "verifyStripeSignature");
async function handleStripeWebhook(req, env2) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), { status: 400, headers: { "Content-Type": "application/json" } });
  if (!env2.STRIPE_SECRET_KEY || !env2.STRIPE_WEBHOOK_SECRET) {
    return new Response(JSON.stringify({
      error: "Stripe not configured",
      missing: [
        !env2.STRIPE_SECRET_KEY ? "STRIPE_SECRET_KEY" : null,
        !env2.STRIPE_WEBHOOK_SECRET ? "STRIPE_WEBHOOK_SECRET" : null
      ].filter(Boolean),
      fix: "Set via: wrangler secret put STRIPE_SECRET_KEY && wrangler secret put STRIPE_WEBHOOK_SECRET"
    }), { status: 503, headers: { "Content-Type": "application/json" } });
  }
  let body;
  try {
    body = await req.text();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to read request body: " + e.message }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
  if (!body || body.trim() === "") {
    return new Response(JSON.stringify({ error: "Empty request body" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
  let event;
  try {
    event = await verifyStripeSignature(body, sig, env2.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    console.error("[Stripe Webhook] signature verification failed:", e.message);
    return new Response(JSON.stringify({ error: "Invalid signature: " + e.message }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
  console.log("[Stripe Webhook] type: " + event.type);
  const db = env2.DB;
  const eventId = event.id;
  const eventType = event.type;
  try {
    const { results: existing } = await d1Query(db, "SELECT id FROM subscription_events WHERE stripeEventId = ?", [eventId]);
    if (existing && existing.length > 0) {
      console.log("[Stripe Webhook] already processed: " + eventId);
      return new Response(JSON.stringify({ received: true, type: eventType, idempotent: true }), { headers: { "Content-Type": "application/json" } });
    }
  } catch (e) {
    console.error("[Stripe We