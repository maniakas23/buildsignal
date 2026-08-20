+ p.id,
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
        const eventTypes = await d1Query(db, "SELECT eventType, COUNT(*) as cnt FROM kestovar_canonical_events WHERE provenance = 'LIVE' GROUP BY eventType ORDER BY cnt DESC");
        const patternValues = await d1Query(db, "SELECT SUM(impactScore) as totalValue, COUNT(*) as cnt FROM signalcore_patterns WHERE provenance = 'LIVE' AND impactScore IS NOT NULL");
        response = new Response(JSON.stringify({
          events: events.results?.[0]?.cnt || 0,
          patterns: patterns.results?.[0]?.cnt || 0,
          recommendations: recommendations.results?.[0]?.cnt || 0,
          opportunities: opportunities.results?.[0]?.cnt || 0,
          evidence: evidence.results?.[0]?.cnt || 0,
          jurisdictions: geo.results || [],
          providers: (providers.results || []).map((p) => ({
            providerId: p.providerId,
            state: p.state,
            status: p.lastPollStatus,
            health: p.consecutiveFailures > 2 ? "suspended" : p.consecutiveFailures > 0 ? "degraded" : "healthy",
            consecutiveSuccesses: p.consecutiveSuccesses,
            consecutiveFailures: p.consecutiveFailures,
            totalPolls: p.totalPolls,
            totalFailures: p.totalFailures
          })),
          eventTypeDistribution: eventTypes.results || [],
          estimatedIntelligenceValue: patternValues.results?.[0]?.totalValue || 0,
          patternsWithValue: patternValues.results?.[0]?.cnt || 0,
          version: "1.6.0",
          generatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/discovery") {
      try {
        const db = env2.DB;
        const { results } = await d1Query(db, "SELECT county, state, COUNT(*) as signalCount FROM kestovar_canonical_events WHERE provenance = 'LIVE' AND county IS NOT NULL AND county <> '' AND state IS NOT NULL AND state <> '' GROUP BY county, state ORDER BY signalCount DESC LIMIT 100");
        response = new Response(JSON.stringify({ jurisdictions: results || [] }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/opportunities") {
      try {
        const db = env2.DB;
        const provenance = url.searchParams.get("provenance");
        let sql = "SELECT id, title, description, county, state, confidence_score as score, provenance, created_at FROM opportunities WHERE provenance = 'LIVE'";
        const params = [];
        if (provenance) {
          sql = "SELECT id, title, description, county, state, confidence_score as score, provenance, created_at FROM opportunities WHERE provenance = ?";
          params.push(provenance);
        }
        sql += " ORDER BY confidence_score DESC";
        const d1Result = await d1Query(db, sql, params);
        const now = Math.floor(Date.now() / 1e3);
        const newestByArea = await d1Query(db, "SELECT county, state, MAX(publishedAt) as newest FROM kestovar_canonical_events WHERE provenance = 'LIVE' GROUP BY county, state");
        const areaNewest = {};
        for (const row of newestByArea.results || []) {
          areaNewest[row.county + "," + row.state] = row.newest;
        }
        const globalNewest = await d1Query(db, "SELECT MAX(publishedAt) as newest FROM kestovar_canonical_events WHERE provenance = 'LIVE'");
        const globalNewestTs = globalNewest.results?.[0]?.newest || 0;
        const opportunities = (d1Result.results || []).map((o) => {
          const areaKey = (o.county || "") + "," + (o.state || "");
          const sourceNewest = areaNewest[areaKey] || globalNewestTs;
          let createdAt = now;
          if (o.created_at) {
            const ts = new Date(o.created_at).getTime();
            if (!isNaN(ts)) createdAt = Math.floor(ts / 1e3);
          }
          const ageSeconds = now - sourceNewest;
          let freshness = "unknown";
          let urgency = "normal";
          if (ageSeconds < 86400) {
            freshness = "current";
            urgency = "high";
          } else if (ageSeconds < 604800) {
            freshness = "recent";
            urgency = "medium";
          } else if (ageSeconds < 2592e3) {
            freshness = "stale";
            urgency = "low";
          } else {
            freshness = "archived";
            urgency = "expired";
          }
          return {
            id: "opp-" + o.id,
            title: o.title,
            description: o.description,
            location: o.county + ", " + o.state,
            score: o.score,
            provenance: o.provenance,
            createdAt,
            sourceEventDate: sourceNewest,
            freshness,
            urgency
          };
        });
        response = new Response(JSON.stringify({ opportunities, generatedAt: now }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message, stack: e.stack }), { status: 500, headers: { "Content-Type": "application/json", ...co