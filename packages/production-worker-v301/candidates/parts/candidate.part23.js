 e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/entitlements") {
      try {
        const db = env2.DB;
        const userId = url.searchParams.get("userId");
        if (!userId) {
          response = new Response(JSON.stringify({ error: "userId required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          const entitlements = await getUserEntitlements(db, userId);
          response = new Response(JSON.stringify({ userId, ...entitlements }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/durham/status") {
      try {
        const status = await fetchDurhamProvider();
        response = new Response(JSON.stringify(status), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/henrico/status") {
      try {
        const status = await fetchHenricoProvider();
        response = new Response(JSON.stringify(status), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/alerts/test") {
      try {
        const db = env2.DB;
        const eventId = url.searchParams.get("eventId");
        if (!eventId) {
          response = new Response(JSON.stringify({ error: "eventId required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          const { results } = await d1Query(db, "SELECT * FROM kestovar_canonical_events WHERE canonicalId = ? AND provenance = 'LIVE'", [eventId]);
          if (!results || results.length === 0) {
            response = new Response(JSON.stringify({ error: "Event not found" }), { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
          } else {
            const event = results[0];
            const matches = await matchAlerts(db, event);
            const generated = [];
            for (const config of matches) {
              const alert = await generateAlert(db, event, config);
              const delivery = await deliverAlert(alert, env2);
              generated.push({ alert, delivery });
            }
            response = new Response(JSON.stringify({ eventId, matches: matches.length, generated }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
          }
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else {
      response = new Response(JSON.stringify({ error: "Not found", path }), { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
    }
  } catch (err) {
    console.error("[ERROR] " + err.message + ":", err.stack);
    response = new Response(JSON.stringify({ error: "An unexpected error occurred. Please try again later." }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
  }
  if (response.headers && !response.headers.has("Access-Control-Allow-Origin")) {
    response = mergeHeaders(response, corsHeaders(origin, env2));
  }
  response = mergeHeaders(response, securityHeaders());
  const latency = Date.now() - start;
  console.log(JSON.stringify({
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    requestId,
    route: path,
    method: req.method,
    status: response.status,
    latency,
    ip: clientIP,
    userAgent: req.headers.get("User-Agent")?.substring(0, 100) || ""
  }));
  const nh = new Headers(response.headers);
  for (const [k, v] of Object.entries(securityHeaders())) {
    if (!nh.has(k)) nh.set(k, v);
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: nh });
}
__name(handleRequest, "handleRequest");
__name2(handleRequest, "handleRequest");
var buildsignal_worker_phase8_default = {
  async fetch(req, env2, ctx) {
    try {
      return await handleRequest(req, env2, ctx);
    } catch (err) {
      console.error("[FATAL] " + err.message + ":", err.stack);
      return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json", ...securityHeaders() } });
    }
  },
  async scheduled(event, env2, ctx) {
    const cronTimestamp = event.scheduledTime || Date.now();
    console.log(`[CRON] Scheduler triggered at ${new Date(cronTimestamp).toISOString()}`);
    try {
      const db = env2.DB;
      const result = await runSchedulerCron(db, cronTimestamp);
      console.log(`[CRON] Scheduler completed: ${JSON.stringify(result)}`);
    } catch (err) {
      console.error("[CRON FATAL] " + err.message + ":", err.stack);
    }
  }
};
export {
  RateLimiterDO,
  buildsignal_worker_phase8_default as default
};
//# sourceMappingURL=index.js.map

// === PHASE 3: NOTIFICATION HANDLERS ===
async function handleNotificationDelete(db, userId, input) {
  const { id } = input;
  if (!id) return trpcError("Notification ID required", "BAD_REQUEST");
  const result = await db.prepare("DELETE FROM notifications WHERE id = ? AND userId = ?").bind(id, userId).run();
  return trpcResult({ success: true, deleted: result.meta?.changes || 0 });
}

async function handleNotificationGetPrefs(db, userId) {
  const row = await db.prepare("SELECT emailEnabled, inAppEnabled, dailyDigest, weeklyDigest, watchlistAlerts, infraAlerts, recAlerts FROM notification_prefs WHERE userId = ?").bind(userId).first();
  return trpcResult(row || { emailEnabled: 1, inAppEnabled: 1, dailyDigest: 0, weeklyDigest: 1, watchlistAlerts: 1, infraAlerts: 1, recAlerts: 1 });
}

async function handleNotificationUpdatePrefs(db, userId, input) {
  const { emailEnabled, inAppEnabled, dailyDigest, weeklyDigest, watchlistAlerts, infraAlerts, recAlerts } = input;
  await db.prepare(`INSERT INTO notification_prefs (userId, emailEnabled, inAppEnabled, dailyDigest, weeklyDigest, watchlistAlerts, infraAlerts, recAlerts, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now')) ON CONFLICT(userId) DO UPDATE SET emailEnabled = excluded.emailEnabled, inAppEnabled = excluded.inAppEnabled, dailyDigest = excluded.dailyDigest, weeklyDigest = excluded.weeklyDigest, watchlistAlerts = excluded.watchlistAlerts, infraAlerts = excluded.infraAlerts, recAlerts = excluded.recAlerts, updatedAt = datetime('now')`).bind(userId, emailEnabled, inAppEnabled, dailyDigest, weeklyDigest, watchlistAlerts, infraAlerts, recAlerts).run();
  return trpcResult({ success: true });
}

// === PHASE 4: RECOMMENDATION HANDLERS ===
async function handleRecommendationAct(db, userId, input) {
  const { id, action } = input;
  if (!id || !action) return trpcError("ID and action required", "BAD_REQUEST");
  const rec = await db.prepare("SELECT id, provenance FROM recommendations WHERE id = ? AND provenance = 'LIVE'").bind(id).first();
  if (!rec) return trpcError("Recommendation not found", "NOT_FOUND");
  await db.prepare(`INSERT INTO recommendation_outcomes (userId, recommendationId, action, actedAt, provenance) VALUES (?, ?, ?, datetime('now'), 'LIVE')`).bind(userId, id, action).run();
  return trpcResult({ success: true });
}

async function handleRecommendationDismiss(db, userId, input) {
  const { id } = input;
  if (!id) return trpcError("ID required", "BAD_REQUEST");
  const rec = await db.prepare("SELECT id, provenance FROM recommendations WHERE id = ? AND provenance = 'LIVE'").bind(id).first();
  if (!rec) return trpcError("Recommendation not found", "NOT_FOUND");
  await db.prepare(`INSERT INTO recommendation_outcomes (userId, recommendationId, action, actedAt, provenance) VALUES (?, ?, 'dismissed', datetime('now'), 'LIVE')`).bind(userId, id).run();
  return trpcResult({ success: true });
}

async function handleRecommendationSave(db, userId, input) {
  const { id } = input;
  if (!id) return trpcError("ID required", "BAD_REQUEST");
  const rec = await db.prepare("SELECT id, provenance FROM recommendations WHERE id = ? AND provenance = 'LIVE'").bind(id).first();
  if (!rec) return trpcError("Recommendation not found", "NOT_FOUND");
  await db.prepare(`INSERT INTO recommendation_outcomes (userId, recommendationId, action, actedAt, provenance) VALUES (?, ?, 'saved', datetime('now'), 'LIVE')`).bind(userId, id).run();
  return trpcResult({ success: true });
}

// === PHASE 5: WATCHLIST UPDATE ===
async function handleWatchlistUpdate(db, userId, input) {
  const { id, name, description, counties, alertEnabled, alertFrequency } = input;
  if (!id) return trpcError("Watchlist ID required", "BAD_REQUEST");
  const existing = await db.prepare("SELECT id FROM watchlists WHERE id = ? AND userId = ?").bind(id, userId).first();
  if (!existing) return trpcError("Watchlist not found", "NOT_FOUND");
  await db.prepare(`UPDATE watchlists SET name = COALESCE(?, name), description = COALESCE(?, description), counties = COALESCE(?, counties), alertEnabled = COALESCE(?, alertEnabled), al