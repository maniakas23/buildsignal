ush(status);
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
        }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/expansion/states") {
      try {
        const db = env2.DB;
        const rows = await d1Query(db, "SELECT state, COUNT(*) as totalJurisdictions, COUNT(CASE WHEN expansionStatus = 'active' THEN 1 END) as activeCounties, AVG(coveragePercent) as avgCoverage FROM expansion_registry GROUP BY state ORDER BY totalJurisdictions DESC");
        response = new Response(JSON.stringify({ states: rows.results || [] }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/providers/list") {
      try {
        const db = env2.DB;
        const status = url.searchParams.get("status");
        let sql = "SELECT providerId, providerName, sourceType, jurisdiction, officialSource, acquisitionMethod, updateFrequency, lastSuccessfulFetch, lastRecordObserved, healthStatus, isActive, apiEndpoint, apiKeyRequired, recordFormat, recordsIngested, createdAt, updatedAt FROM provider_registry WHERE 1=1";
        const params = [];
        if (status === "active") {
          sql += " AND isActive = 1";
        }
        if (status === "inactive") {
          sql += " AND isActive = 0";
        }
        sql += " ORDER BY providerName LIMIT 200";
        const rows = await d1Query(db, sql, params);
        response = new Response(JSON.stringify({ providers: rows.results || [], count: (rows.results || []).length }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path.startsWith("/api/v1/providers/") && path !== "/api/v1/providers/list" && path !== "/api/v1/providers/dashboard") {
      try {
        const db = env2.DB;
        const parts = path.split("/");
        const providerId = parts[4];
        if (!providerId) {
          response = new Response(JSON.stringify({ error: "providerId required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          const rows = await d1Query(db, "SELECT providerId, providerName, sourceType, jurisdiction, officialSource, acquisitionMethod, updateFrequency, lastSuccessfulFetch, lastRecordObserved, healthStatus, isActive, apiEndpoint, apiKeyRequired, recordFormat, recordsIngested, metadata, createdAt, updatedAt FROM provider_registry WHERE providerId = ? LIMIT 1", [providerId]);
          const provider = rows.results?.[0] || null;
          if (!provider) {
            response = new Response(JSON.stringify({ error: "Provider not found" }), { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
          } else {
            response = new Response(JSON.stringify({ provider }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
          }
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/providers/dashboard") {
      try {
        const db = env2.DB;
        const total = await d1Query(db, "SELECT COUNT(*) as cnt FROM provider_registry");
        const active = await d1Query(db, "SELECT COUNT(*) as cnt FROM provider_registry WHERE isActive = 1");
        const byHealth = await d1Query(db, "SELECT healthStatus, COUNT(*) as cnt FROM provider_registry GROUP BY healthStatus");
        const byType = await d1Query(db, "SELECT sourceType, COUNT(*) as cnt FROM provider_registry GROUP BY sourceType");
        const totalIngested = await d1Query(db, "SELECT SUM(recordsIngested) as total FROM provider_registry");
        response = new Response(JSON.stringify({
          totalProviders: total.results?.[0]?.cnt || 0,
          activeProviders: active.results?.[0]?.cnt || 0,
          byHealth: byHealth.results || [],
          byType: byType.results || [],
          totalRecordsIngested: totalIngested.results?.[0]?.total || 0,
          generatedAt: Math.floor(Date.now() / 1e3)
        }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/discovery/search") {
      try {
        const db = env2.DB;
        const state = url.searchParams.get("state");
        const county = url.searchParams.get("county");
        const sourceType = url.searchParams.get("sourceType") || "building_permits";
        if (!state || !county) {
          response = new Response(JSON.stringify({ error: "state and county req