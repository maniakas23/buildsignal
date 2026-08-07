// BuildSignal v1.1.9 — Minimal Production Worker (Build 119)
// This is a lightweight deployment that handles all critical Stripe operations
// without requiring npm module bundling. Uses Stripe REST API directly.
//
// Deployed: 2026-08-07 via Cloudflare MCP API
// Worker: buildsignal-worker
// Domain: api.buildsignal.net

export class RateLimiterDO {
  async fetch(request) {
    return new Response("Rate limiter OK");
  }
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, stripe-signature",
  };
}

async function stripeRequest(path, method, body, env) {
  const url = `https://api.stripe.com/v1${path}`;
  const headers = {
    "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const options = { method, headers };
  if (body) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined && value !== null) {
        params.append(key, value);
      }
    }
    options.body = params.toString();
  }

  const resp = await fetch(url, options);
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || `Stripe API error: ${resp.status}`);
  return data;
}

async function verifyWebhookSignature(payload, signature, secret) {
  const parts = signature.split(",").map(s => s.trim());
  let timestamp, sig;
  for (const part of parts) {
    if (part.startsWith("t=")) timestamp = part.replace("t=", "");
    if (part.startsWith("v1=")) sig = part.replace("v1=", "");
  }

  if (!timestamp || !sig) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${payload}`));
  const expected = Array.from(new Uint8Array(signed)).map(b => b.toString(16).padStart(2, "0")).join("");

  return sig === expected;
}

async function handleStripeWebhook(request, env) {
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Stripe not configured", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const rawBody = await request.text();
  const isValid = await verifyWebhookSignature(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  if (!isValid) return new Response("Invalid signature", { status: 400 });

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (e) {
    return new Response("Invalid JSON", { status: 400 });
  }

  console.log(`[Stripe Webhook] ${event.type} — id: ${event.id}`);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      console.log(`Checkout completed: ${session.id}, subscription: ${session.subscription}`);
      break;
    }
    case "invoice.paid": {
      console.log(`Invoice paid: ${event.data.object.id}`);
      break;
    }
    case "invoice.payment_failed": {
      console.log(`Invoice payment failed: ${event.data.object.id}`);
      break;
    }
    case "customer.subscription.updated": {
      console.log(`Subscription updated: ${event.data.object.id}`);
      break;
    }
    case "customer.subscription.deleted": {
      console.log(`Subscription deleted: ${event.data.object.id}`);
      break;
    }
  }

  return new Response(JSON.stringify({ received: true, type: event.type }), {
    headers: { "Content-Type": "application/json" },
  });
}

async function createCheckout(request, env) {
  if (!env.STRIPE_SECRET_KEY) return new Response("Stripe not configured", { status: 500 });

  const body = await request.json().catch(() => ({}));
  const { priceId, customerId, customerEmail, origin } = body;

  try {
    const session = await stripeRequest("/checkout/sessions", "POST", {
      "customer": customerId,
      "customer_email": customerEmail,
      "line_items[0][price]": priceId || env.STRIPE_PRICE_PRO,
      "line_items[0][quantity]": "1",
      "mode": "subscription",
      "success_url": `${origin || "https://buildsignal.net"}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      "cancel_url": `${origin || "https://buildsignal.net"}/billing?canceled=true`,
      "allow_promotion_codes": "true",
      "billing_address_collection": "required",
      "automatic_tax[enabled]": "true",
    }, env);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function createBillingPortal(request, env) {
  if (!env.STRIPE_SECRET_KEY) return new Response("Stripe not configured", { status: 500 });

  const body = await request.json().catch(() => ({}));
  const { customerId, origin } = body;

  if (!customerId) return new Response("Missing customerId", { status: 400 });

  try {
    const session = await stripeRequest("/billing_portal/sessions", "POST", {
      "customer": customerId,
      "return_url": `${origin || "https://buildsignal.net"}/billing`,
    }, env);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function getSubscriptionStatus(request, env) {
  if (!env.STRIPE_SECRET_KEY) return new Response("Stripe not configured", { status: 500 });

  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId");
  if (!customerId) return new Response("Missing customerId", { status: 400 });

  try {
    const subs = await stripeRequest(`/customers/${customerId}/subscriptions?status=all&limit=1`, "GET", null, env);
    const sub = subs.data?.[0];

    return new Response(JSON.stringify({
      status: sub?.status || "inactive",
      currentPeriodEnd: sub?.current_period_end,
      cancelAtPeriodEnd: sub?.cancel_at_period_end,
      plan: sub?.items?.data?.[0]?.price?.lookup_key || null,
    }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;
  const origin = request.headers.get("Origin") || "https://buildsignal.net";

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(origin) });
  }

  let response;

  if (path === "/health") {
    response = new Response(JSON.stringify({
      status: "ok",
      version: "1.1.9",
      build: "119",
      timestamp: new Date().toISOString(),
      environment: "production",
      features: ["stripe", "billing", "webhooks", "checkout", "portal"],
    }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
  } else if (path === "/ready") {
    response = new Response(JSON.stringify({
      ready: true,
      version: "1.1.9",
      build: "119",
      timestamp: new Date().toISOString(),
    }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
  } else if (path === "/version") {
    response = new Response(JSON.stringify({
      version: "1.1.9",
      build: "119",
      date: "2026-08-07",
    }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
  } else if (path === "/capabilities") {
    response = new Response(JSON.stringify({
      version: "1.1.9",
      build: "119",
      capabilities: ["stripe-checkout", "stripe-portal", "stripe-webhooks", "subscription-management", "cors", "health-check"],
    }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
  } else if (path === "/stripe/webhook" && request.method === "POST") {
    response = await handleStripeWebhook(request, env);
  } else if (path === "/stripe/checkout" && request.method === "POST") {
    response = await createCheckout(request, env);
  } else if (path === "/stripe/portal" && request.method === "POST") {
    response = await createBillingPortal(request, env);
  } else if (path === "/stripe/subscription" && request.method === "GET") {
    response = await getSubscriptionStatus(request, env);
  } else if (path === "/api/trpc/health") {
    response = new Response(JSON.stringify({ status: "ok" }), {
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  } else {
    response = new Response(JSON.stringify({ error: "Not found", path }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  }

  if (response.headers && !response.headers.has("Access-Control-Allow-Origin")) {
    const newHeaders = new Headers(response.headers);
    for (const [key, value] of Object.entries(corsHeaders(origin))) {
      newHeaders.set(key, value);
    }
    response = new Response(response.body, { status: response.status, headers: newHeaders });
  }

  return response;
}

export default {
  async fetch(request, env, ctx) {
    try {
      return await handleRequest(request, env, ctx);
    } catch (err) {
      console.error(`[ERROR] ${err.message}:`, err.stack);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
