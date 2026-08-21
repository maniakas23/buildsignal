At: now.toISOString(), endsAt: endsAt.toISOString(), days: 14 };
}
__name(startTrial, "startTrial");
__name2(startTrial, "startTrial");
async function getTrialStatus(db, userId) {
  const { results } = await d1Query(db, "SELECT trialStartedAt, trialEndsAt, trialStatus, plan FROM users WHERE id = ?", [userId]);
  if (!results || results.length === 0) return null;
  const u = results[0];
  if (!u.trialStatus || u.trialStatus === "none") return null;
  const now = /* @__PURE__ */ new Date();
  const endsAt = u.trialEndsAt ? new Date(u.trialEndsAt) : null;
  const daysRemaining = endsAt ? Math.ceil((endsAt - now) / (1e3 * 60 * 60 * 24)) : 0;
  if (endsAt && now > endsAt && u.trialStatus === "active") {
    await d1Run(db, "UPDATE users SET trialStatus = 'expired', plan = 'starter' WHERE id = ?", [userId]);
    u.trialStatus = "expired";
    u.plan = "starter";
  }
  return {
    status: u.trialStatus,
    startedAt: u.trialStartedAt,
    endsAt: u.trialEndsAt,
    daysRemaining: Math.max(0, daysRemaining),
    plan: u.plan
  };
}
__name(getTrialStatus, "getTrialStatus");
__name2(getTrialStatus, "getTrialStatus");
async function matchAlerts(db, event) {
  const { results } = await d1Query(db, "SELECT * FROM alert_config WHERE counties LIKE ? OR counties IS NULL OR counties = ''", [`%${event.county}%`]);
  const matches = [];
  for (const config of results || []) {
    let match = true;
    if (config.eventTypes) {
      const types = config.eventTypes.split(",").map((t) => t.trim());
      if (!types.includes(event.eventType) && !types.includes("*")) match = false;
    }
    if (match && config.keywords) {
      const keywords = config.keywords.split(",").map((k) => k.trim().toLowerCase());
      const text = ((event.title || "") + " " + (event.description || "") + " " + (event.address || "")).toLowerCase();
      const keywordMatch = keywords.some((k) => text.includes(k));
      if (!keywordMatch) match = false;
    }
    if (match) matches.push(config);
  }
  return matches;
}
__name(matchAlerts, "matchAlerts");
__name2(matchAlerts, "matchAlerts");
async function generateAlert(db, event, config) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const title = `New ${event.eventType} in ${event.county}`;
  const body = `${event.title || "Permit"} at ${event.address || event.city || ""}. ${event.description || ""}`.substring(0, 500);
  await d1Run(db, "INSERT INTO alert_history (userId, alertType, title, body, sentAt) VALUES (?, ?, ?, ?, ?)", [config.userId, event.eventType, title, body, now]);
  return { userId: config.userId, title, body, channel: config.channel || "email" };
}
__name(generateAlert, "generateAlert");
__name2(generateAlert, "generateAlert");
async function deliverAlert(alert, env2) {
  if (alert.channel === "webpush") {
    const db = env2.DB;
    const { results } = await d1Query(db, "SELECT endpoint, p256dh, auth FROM webpush_subscriptions WHERE userId = ? AND active = 1", [alert.userId]);
    if (!results || results.length === 0) {
      console.log("[Alert Delivery] No active webpush subscriptions for user:", alert.userId);
      return { success: false, reason: "no_subscriptions" };
    }
    const deliveries = [];
    for (const sub of results) {
      try {
        console.log("[Alert Delivery] WebPush to:", sub.endpoint, "alert:", alert.title);
        deliveries.push({ endpoint: sub.endpoint, status: "logged" });
      } catch (e) {
        console.error("[Alert Delivery] WebPush failed:", e.message);
        deliveries.push({ endpoint: sub.endpoint, status: "failed", error: e.message });
      }
    }
    return { success: true, channel: "webpush", deliveries };
  }
  if (alert.channel === "email") {
    console.log("[Alert Delivery] Email would be sent to user " + alert.userId + ": " + alert.title);
    return { success: true, channel: "email", simulated: true };
  }
  return { success: false, reason: "unknown_channel" };
}
__name(deliverAlert, "deliverAlert");
__name2(deliverAlert, "deliverAlert");
var API_DOCS = {
  version: "1.6.0",
  baseUrl: "https://api.buildsignal.net",
  authentication: {
    type: "Bearer JWT",
    header: "Authorization: Bearer <token>",
    description: "Obtain token via auth.login tRPC mutation"
  },
  rateLimits: {
    anonymous: "10 requests/minute",
    authenticated: "100 requests/minute"
  },
  endpoints: [
    { path: "/health", method: "GET", auth: false, description: "Health check" },
    { path: "/api/v1/signals", method: "GET", auth: false, description: "List all signals", params: ["limit", "offset", "county", "state"] },
    { path: "/api/v1/search", method: "GET", auth: false, description: "Full-text search", params: ["q", "limit", "offset", "types"] },
    { path: "/api/v1/search/facets", method: "GET", auth: false, description: "Search facet counts", params: ["q"] },
    { path: "/api/v1/stats", method: "GET", auth: false, description: "Dashboard statistics" },
    { path: "/api/v1/patterns", method: "GET", auth: false, description: "List patterns", params: ["limit", "offset", "county", "state", "confidenceMin"] },
    { path: "/api/v1/recommendations", method: "GET", auth: false, description: "List recommendations", params: ["limit", "offset"] },
    { path: "/api/v1/opportunities", method: "GET", auth: false, description: "List opportunities" },
    { path: "/api/v1/jurisdictions", method: "GET", auth: false, description: "List jurisdictions with coverage" },
    { path: "/api/v1/kestovar/intelligence", method: "GET", auth: false, description: "Partner intelligence feed (Kestovar)", params: ["county", "state", "limit"] },
    { path: "/api/v1/onboarding/track", method: "GET", auth: false, description: "Track onboarding step", params: ["userId", "step"] },
    { path: "/api/v1/onboarding/status", method: "GET", auth: false, description: "Get onboarding status", params: ["userId"] },
    { path: "/api/v1/alerts/configure", method: "GET", auth: false, description: "Configure alerts", params: ["userId", "counties", "eventTypes", "keywords", "channel", "frequency"] },
    { path: "/api/v1/alerts/status", method: "GET", auth: false, description: "Get alert status", params: ["userId"] },
    { path: "/api/v1/conversion/track", method: "GET", auth: false, description: "Track conversion event", params: ["event", "userId", "value", "source"] },
    { path: "/api/v1/conversion/funnel", method: "GET", auth: false, description: "Conversion funnel", params: ["days"] },
    { path: "/api/v1/ops/metrics", method: "GET", auth: false, description: "Operations metrics" },
    { path: "/api/trpc/{procedure}", method: "POST", auth: "optional", description: "tRPC batch endpoint", procedures: ["auth.register", "auth.login", "auth.me", "billing.config", "billing.createCheckout", "stripe.getSubscription", "stripe.createCheckout", "stripe.createPortal", "search.search", "search.facets", "county.list", "county.summary", "pattern.list", "watchlist.list", "watchlist.create", "watchlist.delete", "notification.history", "recommendation.list", "brief.today", "trial.start", "trial.status", "entitlements.get"] }
  ],
  errors: {
    "400": "Bad Request — Invalid parameters",
    "401": "Unauthorized — Missing or invalid token",
    "403": "Forbidden — Insufficient permissions",
    "404": "Not Found — Resource does not exist",
    "429": "Too Many Requests — Rate limit exceeded",
    "500": "Internal Server Error"
  }
};
async function handleApiDocs() {
  return new Response(JSON.stringify(API_DOCS, null, 2), { headers: { "Content-Type": "application/json" } });
}
__name(handleApiDocs, "handleApiDocs");
__name2(handleApiDocs, "handleApiDocs");
async function fetchHenricoProvider() {
  const baseUrl = "https://henrico.gov/public-data/";
  try {
    const resp = await fetch(baseUrl, { headers: { "Accept": "text/html" } });
    const text = await resp.text();
    const hasData = text.includes("Permit") || text.includes("Data") || text.includes("CSV");
    return { available: resp.ok, hasPermitData: hasData, url: baseUrl };
  } catch (e) {
    return { available: false, error: e.message, url: baseUrl };
  }
}
__name(fetchHenricoProvider, "fetchHenricoProvider");
__name2(fetchHenricoProvider, "fetchHenricoProvider");
async function fetchDurhamProvider() {
  const baseUrl = "https://live-durhamnc.opendata.arcgis.com";
  try {
    const resp = await fetch(baseUrl + "/api/search/v1?filter=owner:DurhamNC&sort=name", { headers: { "Accept": "application/json" } });
    const data = await resp.json();
    return { available: resp.ok, datasets: (data.data || []).length, url: baseUrl };
  } catch (e) {
    return { available: false, error: e.message, url: baseUrl };
  }
}
__name(fetchDurhamProvider, "fetchDurhamProvider");
__name2(fetchDurhamProvider, "fetchDurhamProvider");
async function handleTRPCBatch(req, env2) {
  const url = new URL(req.url);
  const path = url.pathname.replace("/api/trpc/", "");
  const ops = path.split(",");
  let inputs = {};
  if (req.method === "POST") {
    try {
      inputs = await req.json();
    } catch (e) {
    }
  }
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  const jwtPayload = token ? await verifyJWT(token, env2.JWT_SECRET) : null;
  const db = env2.DB;
  const clientIP = req.headers.get("CF-Connecting-IP") || "unknown";
  const results = [];
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    const input = inputs[i]?.json || {};
    let result;
    switch (op) {
      case "health":
        result = trpcResult({ status: "ok" });
        break;
      case "county.summary":
        result = await handleCountySummary(db);
        break;
      case "county.list":
        result = await handleCountyList(db, input);
        break;
      case "county.detail":
        result = aw