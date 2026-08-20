d1Query(db, "SELECT COUNT(*) as cnt FROM source_candidates WHERE candidateStatus = 'DISCOVERED'"),
          d1Query(db, "SELECT COUNT(*) as cnt FROM source_candidates WHERE candidateStatus = 'QUALIFIED'"),
          d1Query(db, "SELECT COUNT(*) as cnt FROM source_candidates WHERE candidateStatus = 'CERTIFIED'"),
          d1Query(db, "SELECT COUNT(*) as cnt FROM geographic_zones"),
          d1Query(db, "SELECT COUNT(*) as cnt FROM geographic_zones WHERE healthStatus = 'active'")
        ]);
        const events = await d1Query(db, "SELECT COUNT(*) as cnt FROM kestovar_canonical_events WHERE provenance = 'LIVE'");
        response = new Response(JSON.stringify({
          version: "1.6.0",
          build: "134",
          timestamp: now,
          autonomousExpansion: {
            totalJurisdictions: expTotal.results?.[0]?.cnt || 0,
            activeJurisdictions: expActive.results?.[0]?.cnt || 0,
            totalProviders: provTotal.results?.[0]?.cnt || 0,
            activeProviders: provActive.results?.[0]?.cnt || 0,
            discoveredCandidates: candDisc.results?.[0]?.cnt || 0,
            qualifiedCandidates: candQual.results?.[0]?.cnt || 0,
            certifiedCandidates: candCert.results?.[0]?.cnt || 0
          },
          coverage: {
            geographicZones: geoTotal.results?.[0]?.cnt || 0,
            activeZones: geoActive.results?.[0]?.cnt || 0,
            liveEvents: events.results?.[0]?.cnt || 0
          },
          capabilities: [
            "geographic_routing",
            "expansion_registry",
            "provider_registry",
            "source_discovery",
            "candidate_lifecycle",
            "autonomous_orchestration"
          ],
          status: "operational"
        }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/orchestrator/expand" && req.method === "POST") {
      try {
        const db = env2.DB;
        const body = await req.json();
        const { state, county, population } = body || {};
        if (!state || !county) {
          response = new Response(JSON.stringify({ error: "state and county required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          const now = Math.floor(Date.now() / 1e3);
          await d1Run(db, "INSERT OR IGNORE INTO expansion_registry (state, county, city, planningAuthority, population, coveragePercent, activeProviders, providerHealth, expansionStatus, dataSourcesAvailable, dataSourcesActive, createdAt, updatedAt, provenance) VALUES (?, ?, ?, ?, ?, 0, 0, 0, 'queued', 0, 0, ?, ?, 'LIVE')", [state, county, county, `${county} County`, population || 0, now, now]);
          const candidateId = `${county.toLowerCase().replace(/\s+/g, "-")}-${state.toLowerCase()}-building_permits`;
          const discoveries = [];
          discoveries.push({
            candidateId: candidateId + "-arcgis",
            sourceName: `${county} County Building Permits`,
            endpointUrl: `https://hub.arcgis.com/datasets/${county.toLowerCase().replace(/\s+/g, "-")}-building_permits`,
            officialSource: `https://www.${county.toLowerCase().replace(/\s+/g, "")}county.gov`,
            acquisitionMethod: "ArcGIS REST API",
            dataFormat: "GeoJSON/JSON",
            discoveryScore: 85
          });
          for (const d of discoveries) {
            await d1Run(
              db,
              `INSERT OR IGNORE INTO source_candidates (candidateId, jurisdiction, state, county, sourceName, sourceType, endpointUrl, officialSource, acquisitionMethod, dataFormat, candidateStatus, discoveryScore, recordsAvailable, createdAt, updatedAt, provenance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DISCOVERED', ?, ?, ?, ?, 'LIVE')`,
              [d.candidateId, `${county}, ${state}`, state, county, d.sourceName, "building_permits", d.endpointUrl, d.officialSource, d.acquisitionMethod, d.dataFormat, d.discoveryScore, 0, now, now]
            );
          }
          response = new Response(JSON.stringify({
            success: true,
            state,
            county,
            expansionStatus: "queued",
            candidatesDiscovered: discoveries.length,
            message: "Jurisdiction queued for autonomous expansion. Run /discovery/qualify then /discovery/certify to complete."
          }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/ingestion/run" && req.method === "POST") {
      try {
        const db = env2.DB;
        const body = await req.json();
        const providerId = body.providerId || "raleigh_building_permits";
        const limit = Math.min(Math.max(body.limit || 50, 1), 500);
        const result = await executeIngestionRun(db, providerId, limit, "manual");
        response = new Response(JSON.stringify({
          success: result.success,
          runId: result.runId,
          recordsObserved: result.recordsObserved,
          recordsCreated: result.recordsCreated,
          recordsNormalized: result.recordsNormalized,
          recordsSkipped: result.recordsSkipped,
          error: result.error,
          totalLatencyMs: result.totalLatencyMs
        }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/ingestion/status" && req.method === "GET") {
      try {
        const db = env2.DB;
        const url2 = new URL(req.url);
        const runId = url2.searchParams.get("runId");
        if (runId) {
          const runs = await d1Query(
            db,
            `SELECT * FROM ingestion_runs WHERE id = ? LIMIT 1`,
            [runId]
          );
          if (runs.results?.length > 0) {
            response = new Response(JSON.stringify({ found: true, run: runs.results[0] }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
          } else {
            response = new Response(JSON.stringify({ found: false, run: null }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
          }
        } else {
          const latestRuns = await d1Query(
            db,
            `SELECT * FROM ingestion_runs ORDER BY startedAt DESC LIMIT 20`
          );
          const runs = latestRuns.results || [];
          const totalRuns = runs.length;
          const completed = runs.filter((r) => r.status === "completed").length;
          const failed = runs.filter((r) => r.status === "failed").length;
          const running = runs.filter((r) => r.status === "running").length;
          const totalObserved = runs.reduce((sum, r) => sum + (r.recordsObserved || 0), 0);
          const totalCreated = runs.reduce((sum, r) => sum + (r.recordsCreated || 0), 0);
          const totalResolved = runs.reduce((sum, r) => sum + (r.recordsResolved || 0), 0);
          response = new Response(JSON.stringify({
            success: true,
            summary: { totalRuns, completed, failed, running, totalObserved, totalCreated, totalResolved },
            runs
          }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/ingestion/raw" && req.method === "GET") {
      try {
        const db = env2.DB;
        const url2 = new URL(req.url);
        const providerId = url2.searchParams.get("providerId");
        const limit = Math.min(Math.max(parseInt(url2.searchParams.get("limit") || "50", 10), 1), 500);
        if (!providerId) {
          response = new Response(JSON.stringify({ error: "providerId is required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          const canonicalId = {
            "raleigh_building_permits": "raleigh-permits",
            "wake_county_building_permits": "wake-county-permits",
            "mecklenburg_nc_building_permits": "mecklenburg-nc-building_permits",
            "fairfax_va_building_permits": "fairfax-va-building_permits"
          }[providerId] || providerId;
          const countResult = await d1Query(
            db,
            `SELECT COUNT(*) as cnt FROM raw_records WHERE providerId = ?`,
            [canonicalId]
          );
          const totalCount = countResult.results?.[0]?.cnt || 0;
          let fallbackCount = 0;
          if (canonicalId !== providerId) {
            const fbResult = await d1Query(
              db,
              `SELECT COUNT(*) as cnt FROM raw_records WHERE providerId = ?`,
              [providerId]
            );
            fallbackCount = fbResult.results?.[0]?.cnt || 0;
          }
          const queryId = totalCount > 0 || fallbackCount === 0 ? canonicalId : providerId;
          const recordsResult = await d1Query(
            db,
            `SELECT id, providerId, sourceRecordId, sourceUrl, observedAt, ingestedAt, rawPayload, rawTitle, rawDescription, rawLocation, rawStatus, rawDat