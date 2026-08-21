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
          response = new Response(JSON.stringify({ error: "state and county required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          const now = Math.floor(Date.now() / 1e3);
          const candidateId = `${county.toLowerCase().replace(/\s+/g, "-")}-${state.toLowerCase()}-${sourceType}`;
          const existing = await d1Query(db, "SELECT id, candidateStatus FROM source_candidates WHERE candidateId = ? LIMIT 1", [candidateId]);
          let candidates = [];
          let source = "existing";
          if (!existing.results?.[0]) {
            const discoveries = [];
            if (county.toLowerCase().includes("mecklenburg") || county.toLowerCase().includes("wake") || county.toLowerCase().includes("durham")) {
              discoveries.push({
                candidateId: candidateId + "-arcgis",
                sourceName: `${county} County ${sourceType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}`,
                endpointUrl: `https://hub.arcgis.com/datasets/${county.toLowerCase().replace(/\s+/g, "-")}-${sourceType}`,
                officialSource: `https://www.${county.toLowerCase().replace(/\s+/g, "")}countync.gov`,
                acquisitionMethod: "ArcGIS REST API",
                dataFormat: "GeoJSON/JSON",
                discoveryScore: 85,
                recordsAvailable: 0
              });
            }
            if (county.toLowerCase().includes("mecklenburg") || county.toLowerCase().includes("charlotte")) {
              discoveries.push({
                candidateId: candidateId + "-socrata",
                sourceName: `City of Charlotte ${sourceType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}`,
                endpointUrl: `https://data.charlottenc.gov/resource/${sourceType}.json`,
                officialSource: "https://data.charlottenc.gov",
                acquisitionMethod: "Socrata SODA API",
                dataFormat: "JSON",
                discoveryScore: 78,
                recordsAvailable: 0
              });
            }
            for (const d of discoveries) {
              await d1Run(
                db,
                `INSERT INTO source_candidates (candidateId, jurisdiction, state, county, sourceName, sourceType, endpointUrl, officialSource, acquisitionMethod, dataFormat, candidateStatus, discoveryScore, recordsAvailable, createdAt, updatedAt, provenance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DISCOVERED', ?, ?, ?, ?, 'LIVE')`,
                [d.candidateId, `${county}, ${state}`, state, county, d.sourceName, sourceType, d.endpointUrl, d.officialSource, d.acquisitionMethod, d.dataFormat, d.discoveryScore, d.recordsAvailable, now, now]
              );
            }
            candidates = discoveries;
            source = "discovery";
          } else {
            const rows = await d1Query(db, "SELECT candidateId, sourceName, sourceType, endpointUrl, officialSource, acquisitionMethod, dataFormat, candidateStatus, discoveryScore, recordsAvailable, createdAt FROM source_candidates WHERE state = ? AND county = ?", [state, county]);
            candidates = rows.results || [];
          }
          response = new Response(JSON.stringify({
            state,
            county,
            sourceType,
            candidates,
            count: candidates.length,
            source,
            generatedAt: now
          }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/discovery/candidates") {
      try {
        const db = env2.DB;
        const status = url.searchParams.get("status");
        const state = url.searchParams.get("state");
        let sql = "SELECT candidateId, jurisdiction, state, county, sourceName, sourceType, endpointUrl, officialSource, acquisitionMethod, dataFormat, candidateStatus, discoveryScore, healthScore, recordsAvailable, lastVerifiedAt, qualifiedAt, certifiedAt, createdAt FROM source_candidates WHERE 1=1";
        const params = [];
        if (status) {
          sql += " AND candidateStatus = ?";
          params.push(status);
        }
        if (state) {
          sql += " AND state = ?";
          params.push(state);
        }
        sql += " 