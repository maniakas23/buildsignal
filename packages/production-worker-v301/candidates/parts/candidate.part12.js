ical_events WHERE provenance = 'LIVE' GROUP BY eventType ORDER BY cnt DESC");
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
        response = new Response(JSON.stringify({ error: e.message, stack: e.stack }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/freshness") {
      try {
        const db = env2.DB;
        const now = Math.floor(Date.now() / 1e3);
        const liveCount = await d1Query(db, "SELECT COUNT(*) as count FROM kestovar_canonical_events WHERE provenance = 'LIVE'");
        const seedCount = await d1Query(db, "SELECT COUNT(*) as count FROM kestovar_canonical_events WHERE provenance = 'SEED'");
        const newestLive = await d1Query(db, "SELECT MAX(publishedAt) as newest FROM kestovar_canonical_events WHERE provenance = 'LIVE'");
        const oldestLive = await d1Query(db, "SELECT MIN(publishedAt) as oldest FROM kestovar_canonical_events WHERE provenance = 'LIVE'");
        const providerState = await d1Query(db, "SELECT id, providerName, recordsIngested, updatedAt, metadata FROM provider_registry WHERE recordsIngested > 0 OR id = 'wake-county-permits'");
        const liveTotal = liveCount.results?.[0]?.count || 0;
        const newest = newestLive.results?.[0]?.newest || 0;
        const oldest = oldestLive.results?.[0]?.oldest || 0;
        const ageSpan = newest - oldest;
        let systemFreshness = "unknown";
        if (newest > now - 86400) systemFreshness = "current";
        else if (newest > now - 604800) systemFreshness = "recent";
        else if (newest > now - 2592e3) systemFreshness = "stale";
        else systemFreshness = "archived";
        response = new Response(JSON.stringify({
          now,
          systemFreshness,
          summary: { liveRecords: liveTotal, seedRecords: seedCount.results?.[0]?.count || 0, newestRecord: newest, oldestRecord: oldest, ageSpanDays: Math.round(ageSpan / 86400) },
          providers: providerState.results || [],
          freshnessRules: { current: "< 24 hours", recent: "< 7 days", stale: "< 30 days", archived: "> 30 days" }
        }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message, stack: e.stack }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/ingest/test-source") {
      try {
        const testResp = await fetch("https://maps.wake.gov/arcgis/rest/services/Inspections/Building_Permits/MapServer/0?f=pjson", { cf: { cacheTtl: 0 } });
        const testBody = await testResp.text();
        response = new Response(JSON.stringify({
          sourceReachable: testResp.ok,
          status: testResp.status,
          bodyPreview: testBody.substring(0, 500),
          source: "Wake County ArcGIS"
        }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ sourceReachable: false, error: e.message }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/ingest/current-sample") {
      try {
        const infoResp = await fetch("https://maps.wake.gov/arcgis/rest/services/Inspections/Building_Permits/MapServer/0?f=pjson", { cf: { cacheTtl: 0 } });
        const infoData = await infoResp.json();
        const dateFields = (infoData.fields || []).filter((f) => f.type === "esriFieldTypeDate").map((f) => f.name);
        const thirtyDaysAgo = /* @__PURE__ */ new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dateStr = thirtyDaysAgo.toISOString().split("T")[0];
        let queryUrl = "https://maps.wake.gov/arcgis/rest/services/Inspections/Building_Permits/MapServer/0/query?where=ISSUE_DATE%3E%3Ddate%27" + dateStr + "%27&outFields=*&outSR=4326&resultRecordCount=20&orderByFields=ISSUE_DATE+DESC&f=json";
        let apiResp = await fetch(queryUrl, { cf: { cacheTtl: 0 } });
        let apiData = await apiResp.json();
        if ((apiData.features || []).length === 0) {
          queryUrl = "https://maps.wake.gov/arcgis/rest/services/Inspections/Building_Permits/MapServer/0/query?where=APPLICATION_DATE%3E%3Ddate%27" + dateStr + "%27&outFields=*&outSR=4326&resultRecordCount=20&orderByFields=APPLICATION_DATE+DESC&f=json";
          apiResp = await fetch(queryUrl, { cf: { cacheTtl: 0 } });
          apiData = await apiResp.json();
        }
        const features = apiData.features || [];
        const records = features.map((f) => {
