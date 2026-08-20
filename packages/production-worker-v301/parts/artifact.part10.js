    let runResult;
      try {
        runResult = await executeIngestionRun(db, providerId, 50, "scheduled");
      } catch (execErr) {
        const errMsg = execErr?.message || String(execErr);
        runResult = {
          success: false,
          runId: null,
          recordsObserved: 0,
          recordsCreated: 0,
          recordsNormalized: 0,
          recordsSkipped: 0,
          error: errMsg,
          totalLatencyMs: 0,
          providerId
        };
        await d1Run(
          db,
          `UPDATE provider_polling_schedule SET lastPollCompletedAt = ?, lastPollStatus = 'failed', lastPollRunId = ?, consecutiveFailures = consecutiveFailures + 1, consecutiveSuccesses = 0, totalPolls = totalPolls + 1, totalFailures = totalFailures + 1, backoffMultiplier = MIN(backoffMultiplier * 2, 16.0), nextPollDueAt = ? + (cadenceMinutes * 60 * MIN(backoffMultiplier * 2, 16.0)), updatedAt = ? WHERE providerId = ?`,
          [now, null, now, now, providerId]
        );
      }
      results.runs.push(runResult);
      if (runResult.success) {
        results.providersSucceeded++;
        await d1Run(
          db,
          `INSERT INTO scheduler_activity_log (providerId, eventType, eventDescription, severity, details, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
          [providerId, "POLL_COMPLETED", `Scheduled poll completed for ${providerId}`, "info", JSON.stringify({ runId: runResult.runId, recordsObserved: runResult.recordsObserved, recordsCreated: runResult.recordsCreated, recordsNormalized: runResult.recordsNormalized }), now]
        );
      } else {
        results.providersFailed++;
        await d1Run(
          db,
          `INSERT INTO scheduler_activity_log (providerId, eventType, eventDescription, severity, details, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
          [providerId, "POLL_FAILED", `Scheduled poll failed for ${providerId}: ${runResult.error}`, "error", JSON.stringify({ runId: runResult.runId, error: runResult.error }), now]
        );
      }
    }
    try {
      const { results: pendingAlerts } = await d1Query(db, "SELECT * FROM alert_history WHERE sentAt >= datetime('now', '-1 hour') AND readAt IS NULL ORDER BY sentAt DESC LIMIT 100");
      let alertsDelivered = 0;
      for (const alert of pendingAlerts || []) {
        const delivery = await deliverAlert({ userId: alert.userId, title: alert.title, body: alert.body, channel: "email" }, env);
        if (delivery.success) alertsDelivered++;
      }
      if (alertsDelivered > 0 || (pendingAlerts || []).length > 0) {
        await d1Run(
          db,
          `INSERT INTO scheduler_activity_log (providerId, eventType, eventDescription, severity, details, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
          ["scheduler", "ALERTS_DELIVERED", `Alert delivery cycle completed`, "info", JSON.stringify({ pending: (pendingAlerts || []).length, delivered: alertsDelivered }), now]
        );
      }
    } catch (alertErr) {
      console.error("Alert delivery error:", alertErr);
    }
    await d1Run(
      db,
      `INSERT INTO scheduler_activity_log (providerId, eventType, eventDescription, severity, details, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
      ["scheduler", "SCHEDULER_COMPLETE", "Cron scheduler cycle completed", "info", JSON.stringify({ providersEvaluated: results.providersEvaluated, providersDue: results.providersDue, providersSucceeded: results.providersSucceeded, providersFailed: results.providersFailed, providersSkipped: results.providersSkipped }), now]
    );
  } catch (err) {
    console.error("Scheduler cron error:", err);
    await d1Run(
      db,
      `INSERT INTO scheduler_activity_log (providerId, eventType, eventDescription, severity, details, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
      ["scheduler", "SCHEDULER_ERROR", `Cron scheduler cycle error: ${err.message}`, "critical", JSON.stringify({ error: err.message, stack: err.stack }), now]
    );
    results.error = err.message;
  }
  return results;
}
__name(runSchedulerCron, "runSchedulerCron");
__name2(runSchedulerCron, "runSchedulerCron");
async function handleRequest(req, env2, ctx) {
  const url = new URL(req.url);
  const path = url.pathname;
  const origin = req.headers.get("Origin") || "https://buildsignal.net";
  const clientIP = req.headers.get("CF-Connecting-IP") || "unknown";
  const requestId = crypto.randomUUID();
  const start = Date.now();
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { ...corsHeaders(origin, env2), ...securityHeaders() } });
  }
  let response;
  try {
    if (path === "/health") {
      response = new Response(JSON.stringify({ status: "ok", version: "1.6.0", build: "133", timestamp: (/* @__PURE__ */ new Date()).toISOString(), environment: "production", features: ["trpc", "d1", "auth", "stripe", "billing", "webhooks", "county", "pattern", "search", "watchlist", "notification", "brief", "analytics", "recommendation", "provider", "rateLimiting", "passwordHashing", "securityHeaders", "trial", "entitlements", "alerts", "conversion", "onboarding", "facets", "ops"] }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
    } else if (path === "/ready") {
      response = new Response(JSON.stringify({ ready: true, version: "1.6.0", build: "132", timestamp: (/* @__PURE__ */ new Date()).toISOString() }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
    } else if (path === "/version") {
      response = new Response(JSON.stringify({ version: "1.6.0", build: "132", date: "2026-08-13" }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
    } else if (path.startsWith("/api/trpc/")) {
      response = await handleTRPCBatch(req, env2);
    } else if (path === "/stripe/status") {
      const hasStripeSecret = !!env2.STRIPE_SECRET_KEY;
      const hasStripeWebhook = !!env2.STRIPE_WEBHOOK_SECRET;
      response = new Response(JSON.stringify({
        stripeSecretKey: hasStripeSecret ? "present" : "missing",
        stripeWebhookSecret: hasStripeWebhook ? "present" : "missing",
        configured: hasStripeSecret && hasStripeWebhook
      }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
    } else if (path === "/stripe/webhook" && req.method === "POST") {
      response = await handleStripeWebhook(req, env2);
    } else if (path === "/api/v1/signals") {
      try {
        const db = env2.DB;
        if (!db) throw new Error("DB binding missing");
        const d1Result = await d1Query(db, "SELECT canonicalId as id, title, description, county, city, state, lat, lng, confidence, publishedAt, ingestedAt, eventType, status, contentHash FROM kestovar_canonical_events WHERE provenance = 'LIVE' ORDER BY publishedAt DESC LIMIT 200", []);
        const events = d1Result.results || [];
        const signals = events.map((ev) => {
          const cityName = ev.city && !ev.city.startsWith("16000") ? ev.city : "Raleigh";
          const location = cityName + ", " + ev.county + " County, " + ev.state;
          const firstDetected = normalizeTimestampToDate(ev.publishedAt) || normalizeTimestampToDate(ev.ingestedAt) || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
          return {
            id: "kev-" + ev.id,
            title: ev.title || "Building Permit",
            description: ev.description || "",
            location,
            confidence: ev.confidence || 70,
            stage: ev.status === "active" ? "early" : "developing",
            projectType: ev.eventType === "building_permit" ? "Building Permit" : ev.eventType || "Infrastructure",
            signals: 1,
            estimatedValue: 0,
            firstDetected,
            sources: [ev.dataSource || "Raleigh Open Data"],
            patternMatch: [],
            opportunityScore: ev.confidence || 70,
            recommendedAction: "Review permit details at Raleigh Open Data Portal"
          };
        });
        response = new Response(JSON.stringify({ signals }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message, stack: e.stack }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/patterns") {
      try {
        const db = env2.DB;
        const provenance = url.searchParams.get("provenance") || "LIVE";
        const limit = parseInt(url.searchParams.get("limit") || "50");
        const offset = parseInt(url.searchParams.get("offset") || "0");
        const d1Result = await d1Query(db, "SELECT id, name, patternType, description, county, state, confidence, evidenceCount, status, firstDetectedAt, lastDetectedAt, summary, recommendedAction, impactScore, geographicReach, createdAt FROM signalcore_patterns WHERE provenance = ? ORDER BY confidence DESC, evidenceCount DESC LIMIT ? OFFSET ?", [provenance, limit, offset]);
        const countRes = await d1Query(db, "SELECT COUNT(*) as cnt FROM signalcore_patterns WHERE provenance = ?", [provenance]);
        const patterns = d1Result.results || [];
        const mapped = patterns.map((p) => {
          const locations = [];
          if (p.county) locations.push(p.county + " County" + (p.state ? ", " + p.state : ""));
          if (p.geographicReach && !locations.includes(p.geographicReach)) locations.push(p.geographicReach);
          const trend = p.lastDetectedAt && p.firstDetectedAt && p.lastDetectedAt > p.firstDetectedAt ? "up" : "stable";
          const lastUpdated = normalizeTimestampToDate(p.lastDetectedAt) || normalizeTimestampToDate(p.createdAt) || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
          return {
            id: "pat-"