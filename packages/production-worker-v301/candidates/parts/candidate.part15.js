"SELECT COUNT(*) as count FROM opportunities WHERE provenance = 'LIVE'");
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
          params.push(status);
        }
        if (state) {
          sql += " AND state = ?";
          params.push(state);
        }
        sql += " ORDER BY population DESC, coveragePercent DESC LIMIT 100";
        const rows = await d1Query(db, sql, params);
        const items = rows.results || [];
        response = new Response(JSON.stringify({ items, count: items.length }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/expansion/register" && req.method === "POST") {
      try {
        const db = env2.DB;
        const body = await req.json();
        const { state, county, city, planningAuthority, population } = body || {};
        if (!state || !county) {
          response = new Response(JSON.stringify({ error: "state and county are required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          const now = Math.floor(Date.now() / 1e3);
          await d1Run(db, "INSERT INTO expansion_registry (state, county, city, planningAuthority, population, coveragePercent, activeProviders, providerHealth, expansionStatus, dataSourcesAvailable, dataSourcesActive, createdAt, updatedAt, provenance) VALUES (?, ?, ?, ?, ?, 0, 0, 0, 'queued', 0, 0, ?, ?, 'LIVE')", [state, county, city || county, planningAuthority || "", population || 0, now, now]);
          response = new Response(JSON.stringify({ success: true, state, county, expansionStatus: "queued" }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/expansion/updateStatus" && req.method === "POST") {
      try {
        const db = env2.DB;
        const body = await req.json();
        const { id, expansionStatus } = body || {};
        if (!id || !expansionStatus) {
          response = new Response(JSON.stringify({ error: "id and expansionStatus are required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          const now = Math.floor(Date.now() / 1e3);
          let sql = "UPDATE expansion_registry SET expansionStatus = ?, updatedAt = ?";
          const params = [expansionStatus, now];
          if (expansionStatus === "active") {
            sql += ", onboardedAt = ?";
            params.push(now);
          }
          sql += " WHERE id = ?";
          params.push(id);
          await d1Run(db, sql, params);
          response = new Response(JSON.stringify({ success: true, id, expansionStatus }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/expansion/dashboard") {
      try {
        const db = env2.DB;
        const total = await d1Query(db, "SELECT COUNT(*) as cnt FROM expansion_registry");
        const byStatus = await d1Query(db, "SELECT expansionStatus, COUNT(*) as cnt FROM expansion_registry GROUP BY expansionStatus ORDER BY cnt DESC");
        const avgCoverage = await d1Query(db, "SELECT AVG(coveragePercent) as avg FROM expansion_registry");
        const topQueued = await d1Query(db, "SELECT county, state, population, expansionStatus FROM expansion_registry WHERE expansionStatus = 'queued' ORDER BY population DESC LIMIT 5");
        const activeCounties = await d1Query(db, "SELECT COUNT(*) as cnt FROM expansion_registry WHERE expansionStatus = 'active'");
        response = new Response(JSON.stringify({
          totalJurisdictions: total.results?.[0]?.cnt || 0,
          active: activeCounties.results?.[0]?.cnt || 0,
          avgCoverage: Math.round(avgCoverage.results?.[0]?.avg || 0),
          byStatus: byStatus.results || [],
          topQueued: topQueued.results || [],
          generatedAt: Math.floor(Date.now() / 1e3)
       