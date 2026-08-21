") {
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
            id: "pat-" + p.id,
            name: p.name || "Unnamed Pattern",
            description: p.description || p.summary || "",
            confidence: p.confidence || 70,
            evidence: p.evidenceCount || 0,
            sectors: p.patternType ? [p.patternType.replace(/_/g, " ")] : ["Infrastructure"],
            locations: locations.length > 0 ? locations : ["Wake County, NC"],
            trend,
            avgConfidence: p.confidence || 70,
            historicalAccuracy: p.confidence ? Math.round(p.confidence / 100 * 100) / 100 : 0.7,
            lastUpdated,
            signals: p.evidenceCount || 0
          };
        });
        response = new Response(JSON.stringify({ patterns: mapped, total: countRes.results?.[0]?.cnt || 0, limit, offset, provenance }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message, stack: e.stack }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/providers") {
      try {
        const db = env2.DB;
        const d1Result = await d1Query(db, "SELECT providerId, providerName, isActive, healthStatus FROM provider_registry WHERE isActive = 1 ORDER BY providerName", []);
        const providers = d1Result.results || [];
        const enriched = providers.map((p) => ({
          id: p.providerId,
          name: p.providerName || p.providerId,
          type: "Government",
          status: p.isActive ? "active" : "paused",
          lastUpdate: (/* @__PURE__ */ new Date()).toISOString(),
          recordsIngested: 0,
          successRate: 100,
          avgLatency: 0,
          errors24h: 0
        }));
        response = new Response(JSON.stringify({ providers: enriched }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message, stack: e.stack }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/health") {
      try {
        const db = env2.DB;
        const now = Math.floor(Date.now() / 1e3);
        const dbTest = await d1Query(db, "SELECT 1 as test");
        const dbOK = dbTest.results && dbTest.results.length > 0;
        response = new Response(JSON.stringify({
          status: "healthy",
          timestamp: now,
          isoTime: new Date(now * 1e3).toISOString(),
          db: dbOK ? "connected" : "error",
          api: "api.buildsignal.net",
          version: "1.6.0",
          kestovar: "active"
        }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ status: "degraded", error: e.message, timestamp: Math.floor(Date.now() / 1e3) }), { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/stats") {
      try {
        const db = env2.DB;
        const events = await d1Query(db, "SELECT COUNT(*) as cnt FROM kestovar_canonical_events WHERE provenance = 'LIVE'");
        const patterns = await d1Query(db, "SELECT COUNT(*) as cnt FROM signalcore_patterns WHERE provenance = 'LIVE'");
        const recommendations = await d1Query(db, "SELECT COUNT(*) as cnt FROM signalcore_recommendations WHERE provenance = 'LIVE'");
        const opportunities = await d1Query(db, "SELECT COUNT(*) as cnt FROM opportunities WHERE provenance = 'LIVE'");
        const evidence = await d1Query(db, "SELECT COUNT(*) as cnt FROM signalcore_pattern_evidence");
        const geo = await d1Query(db, "SELECT county, state, COUNT(*) as signalCount, COUNT(DISTINCT providerId) as providerCount, MIN(publishedAt) as earliest, MAX(publishedAt) as latest FROM kestovar_canonical_events WHERE provenance = 'LIVE' AND county IS NOT NULL AND county <> '' AND state IS NOT NULL AND state <> '' GROUP BY county, state ORDER BY signalCount DESC");
        const providers = await d1Query(db, "SELECT providerId, state, lastPollStatus, consecutiveSuccesses, consecutiveFailures, totalPolls, totalFailures FROM provider_polling_schedule ORDER BY providerId");
        const eventTypes = await d1Query(db, "SELECT eventType, COUNT(*) as cnt FROM kestovar_canon