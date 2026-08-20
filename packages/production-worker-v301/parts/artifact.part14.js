ance = 'LIVE'";
          }
          sql += " ORDER BY publishedAt DESC LIMIT ? OFFSET ?";
          params.push(clampedLimit, clampedOffset);
          const rows = await d1Query(db, sql, params);
          let countSql = "SELECT COUNT(*) as total FROM kestovar_canonical_events WHERE (title LIKE ? OR description LIKE ? OR address LIKE ? OR city LIKE ? OR county LIKE ? OR state LIKE ? OR permitType LIKE ? OR workClass LIKE ? OR eventType LIKE ? OR status LIKE ? OR providerId LIKE ?)";
          const countParams = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];
          if (provenance && ["LIVE", "SEED", "SAMPLE", "TEST", "SIMULATED"].includes(provenance.toUpperCase())) {
            countSql += " AND provenance = ?";
            countParams.push(provenance.toUpperCase());
          } else {
            countSql += " AND provenance = 'LIVE'";
          }
          const countResult = await d1Query(db, countSql, countParams);
          const total = countResult.results?.[0]?.total || 0;
          response = new Response(JSON.stringify({ query: q, results: rows.results || [], count: (rows.results || []).length, total, offset: clampedOffset, limit: clampedLimit, hasMore: clampedOffset + (rows.results || []).length < total }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/staleness-alert") {
      try {
        const db = env2.DB;
        const now = Math.floor(Date.now() / 1e3);
        const newestLive = await d1Query(db, "SELECT MAX(publishedAt) as newest FROM kestovar_canonical_events WHERE provenance = 'LIVE'");
        const newest = newestLive.results?.[0]?.newest || 0;
        const hoursOld = Math.round((now - newest) / 3600);
        const daysOld = Math.round((now - newest) / 86400);
        let alert = null;
        let systemFreshness = "unknown";
        if (newest === 0) {
          alert = { level: "critical", message: "No LIVE data in system", action: "Run ingestion immediately" };
          systemFreshness = "unknown";
        } else {
          const ageSeconds = now - newest;
          if (ageSeconds < 86400) {
            systemFreshness = "current";
          } else if (ageSeconds < 604800) {
            systemFreshness = "recent";
            alert = { level: "info", message: "LIVE data is " + hoursOld + " hours old", action: "Consider re-running ingestion" };
          } else if (ageSeconds < 2592e3) {
            systemFreshness = "stale";
            alert = { level: "warning", message: "LIVE data is " + daysOld + " days old", action: "Re-run ingestion pipeline" };
          } else {
            systemFreshness = "archived";
            alert = { level: "critical", message: "LIVE data is " + daysOld + " days old", action: "Re-run ingestion pipeline immediately" };
          }
        }
        response = new Response(JSON.stringify({ now, newestRecord: newest, hoursOld, daysOld, alert, systemFreshness, freshnessRules: { current: "< 24 hours", recent: "< 7 days", stale: "< 30 days", archived: "> 30 days" } }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/monitoring") {
      try {
        const db = env2.DB;
        const now = Math.floor(Date.now() / 1e3);
        const liveCount = await d1Query(db, "SELECT COUNT(*) as count FROM kestovar_canonical_events WHERE provenance = 'LIVE'");
        const seedCount = await d1Query(db, "SELECT COUNT(*) as count FROM kestovar_canonical_events WHERE provenance = 'SEED'");
        const currentEvents = await d1Query(db, "SELECT COUNT(*) as count FROM kestovar_canonical_events WHERE provenance = 'LIVE' AND publishedAt > ?", [now - 604800]);
        const historicalEvents = await d1Query(db, "SELECT COUNT(*) as count FROM kestovar_canonical_events WHERE provenance = 'LIVE' AND publishedAt < ?", [now - 2592e3]);
        const liveOpps = await d1Query(db, "SELECT COUNT(*) as count FROM opportunities WHERE provenance = 'LIVE'");
        const histOpps = await d1Query(db, "SELECT COUNT(*) as count FROM opportunities WHERE provenance = 'SEED'");
        const alertCount = await d1Query(db, "SELECT COUNT(*) as count FROM generated_alerts");
        const reportCount = await d1Query(db, "SELECT COUNT(*) as count FROM reports");
        const providerState = await d1Query(db, "SELECT id, providerName, recordsIngested, updatedAt, metadata FROM provider_registry");
        response = new Response(JSON.stringify({
          now,
          events: { live: liveCount.results?.[0]?.count || 0, seed: seedCount.results?.[0]?.count || 0, currentWeek: currentEvents.results?.[0]?.count || 0, historical: historicalEvents.results?.[0]?.count || 0 },
          opportunities: { live: liveOpps.results?.[0]?.count || 0, historical: histOpps.results?.[0]?.count || 0 },
          alerts: alertCount.results?.[0]?.count || 0,
          reports: reportCount.results?.[0]?.count || 0,
          providers: providerState.results || []
        }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/monitoring") {
    } else if (path === "/api/v1/geographic/zones") {
      try {
        const db = env2.DB;
        const state = url.searchParams.get("state");
        const type = url.searchParams.get("type");
        const healthStatus = url.searchParams.get("healthStatus");
        let sql = "SELECT id, name, type, parentId, state, population, providerCount, coveragePercentage, healthStatus, onboardingProgress, totalEvents, totalPatterns, createdAt FROM geographic_zones WHERE 1=1";
        const params = [];
        if (state) {
          sql += " AND state = ?";
          params.push(state);
        }
        if (type) {
          sql += " AND type = ?";
          params.push(type);
        }
        if (healthStatus) {
          sql += " AND healthStatus = ?";
          params.push(healthStatus);
        }
        sql += " ORDER BY coveragePercentage DESC, population DESC LIMIT 100";
        const rows = await d1Query(db, sql, params);
        const zones = (rows.results || []).map((z) => ({
          id: z.id,
          name: z.name,
          type: z.type,
          state: z.state,
          population: z.population,
          providerCount: z.providerCount,
          coveragePercentage: z.coveragePercentage,
          healthStatus: z.healthStatus,
          onboardingProgress: z.onboardingProgress,
          totalEvents: z.totalEvents,
          totalPatterns: z.totalPatterns
        }));
        response = new Response(JSON.stringify({ zones, count: zones.length }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/geographic/summary") {
      try {
        const db = env2.DB;
        const total = await d1Query(db, "SELECT COUNT(*) as cnt FROM geographic_zones");
        const byState = await d1Query(db, "SELECT state, COUNT(*) as cnt, AVG(coveragePercentage) as avgCoverage FROM geographic_zones GROUP BY state ORDER BY cnt DESC");
        const byType = await d1Query(db, "SELECT type, COUNT(*) as cnt FROM geographic_zones GROUP BY type ORDER BY cnt DESC");
        const byHealth = await d1Query(db, "SELECT healthStatus, COUNT(*) as cnt FROM geographic_zones GROUP BY healthStatus");
        const topCoverage = await d1Query(db, "SELECT name, state, coveragePercentage FROM geographic_zones ORDER BY coveragePercentage DESC LIMIT 5");
        const bottomCoverage = await d1Query(db, "SELECT name, state, coveragePercentage FROM geographic_zones WHERE coveragePercentage < 100 ORDER BY coveragePercentage ASC LIMIT 5");
        response = new Response(JSON.stringify({
          totalZones: total.results?.[0]?.cnt || 0,
          byState: byState.results || [],
          byType: byType.results || [],
          byHealth: byHealth.results || [],
          topCoverage: topCoverage.results || [],
          bottomCoverage: bottomCoverage.results || [],
          generatedAt: Math.floor(Date.now() / 1e3)
        }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/expansion/list") {
      try {
        const db = env2.DB;
        const status = url.searchParams.get("status");
        const state = url.searchParams.get("state");
        let sql = "SELECT id, state, county, city, planningAuthority, population, coveragePercent, activeProviders, providerHealth, expansionStatus, dataSourcesAvailable, dataSourcesActive, lastAssessmentAt, onboardedAt, createdAt, updatedAt FROM expansion_registry WHERE 1=1";
        const params = [];
        if (status) {
          sql += " AND expansionStatus = ?";
          params.p