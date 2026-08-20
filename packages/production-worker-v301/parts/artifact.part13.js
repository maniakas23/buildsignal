ryDate: dateStr,
            recordsFound: features.length,
            inserted,
            skipped,
            watermark: now
          }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message, stack: e.stack }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/alerts/generate" && req.method === "POST") {
      try {
        const db = env2.DB;
        const body = await req.json().catch(() => ({}));
        const opportunityId = body.opportunityId;
        const userId = body.userId || 1;
        const orgId = body.organizationId || 1;
        if (!opportunityId) {
          response = new Response(JSON.stringify({ error: "opportunityId required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          const oppId = opportunityId.replace("opp-", "");
          const oppRes = await d1Query(db, "SELECT * FROM opportunities WHERE id = ? AND provenance = 'LIVE'", [oppId]);
          const opp = (oppRes.results || [])[0];
          if (!opp) {
            response = new Response(JSON.stringify({ error: "Opportunity not found" }), { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
          } else {
            const freshness = opp.freshness || "unknown";
            const isCurrent = freshness === "current" || freshness === "recent";
            const title = isCurrent ? "New Raleigh permit activity matched your watchlist" : "BuildSignal identified historical Raleigh development activity relevant to your watchlist";
            const reason = isCurrent ? "Current permit data indicates active development matching your saved area preferences." : "Historical permit records show development patterns in your area of interest.";
            const alertId = "alert-" + Math.random().toString(36).substring(2, 10);
            const now = Math.floor(Date.now() / 1e3);
            await d1Run(db, "INSERT INTO generated_alerts (alertId, opportunityId, organizationId, userId, title, reason, location, score, confidence, freshness, urgency, provenance, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [alertId, opportunityId, orgId, userId, title, reason, opp.location || "Wake, NC", opp.confidence_score || opp.score, "High", opp.freshness || "unknown", opp.urgency || "normal", opp.provenance || "LIVE", now]);
            response = new Response(JSON.stringify({ success: true, alertId, opportunityId, title, reason, freshness: opp.freshness, urgency: opp.urgency, provenance: opp.provenance, createdAt: now }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
          }
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message, stack: e.stack }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/alerts") {
      try {
        const db = env2.DB;
        const userId = url.searchParams.get("userId") || "1";
        const rows = await d1Query(db, "SELECT * FROM generated_alerts WHERE userId = ? ORDER BY createdAt DESC LIMIT 50", [userId]);
        response = new Response(JSON.stringify({ alerts: rows.results || [] }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/reports/generate" && req.method === "POST") {
      try {
        const db = env2.DB;
        const body = await req.json().catch(() => ({}));
        const opportunityId = body.opportunityId;
        const userId = body.userId || 1;
        const orgId = body.organizationId || 1;
        if (!opportunityId) {
          response = new Response(JSON.stringify({ error: "opportunityId required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          const oppRes = await d1Query(db, "SELECT * FROM opportunities WHERE id = ? AND provenance = 'LIVE'", [opportunityId.replace("opp-", "")]);
          const opp = (oppRes.results || [])[0];
          if (!opp) {
            response = new Response(JSON.stringify({ error: "Opportunity not found" }), { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
          } else {
            const evidenceEvents = await d1Query(db, "SELECT title, description, city, publishedAt, provenance FROM kestovar_canonical_events WHERE county = ? AND provenance = 'LIVE' ORDER BY publishedAt DESC LIMIT 5", [opp.county || "Wake"]);
            const events = evidenceEvents.results || [];
            const reportId = "rpt-" + Math.random().toString(36).substring(2, 10);
            const now = Math.floor(Date.now() / 1e3);
            const freshness = opp.freshness || "unknown";
            const isCurrent = freshness === "current" || freshness === "recent";
            const execSummary = isCurrent ? "BuildSignal has identified current development activity in " + (opp.county || "Wake") + " County, NC. " + events.length + " recent permit records support this opportunity." : "BuildSignal has identified historical development patterns in " + (opp.county || "Wake") + " County, NC based on archived permit records.";
            const evidence = JSON.stringify(events.map((e) => ({ title: e.title, city: e.city, date: e.publishedAt, provenance: e.provenance })));
            const sources = JSON.stringify(["Wake County ArcGIS REST API", "maps.wake.gov"]);
            const riskFactors = "Permit data represents official government records but may not reflect final project completion.";
            const recommended = "Verify permit status with Wake County Inspections Department before making business decisions.";
            await d1Run(db, "INSERT INTO reports (reportId, opportunityId, organizationId, userId, title, executiveSummary, location, freshness, evidence, sources, score, confidence, riskFactors, recommendedInvestigation, provenance, generatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [reportId, opportunityId, orgId, userId, opp.title || "Report", execSummary, opp.location || "Wake, NC", freshness, evidence, sources, opp.confidence_score || opp.score, "High", riskFactors, recommended, opp.provenance || "LIVE", now]);
            response = new Response(JSON.stringify({ success: true, reportId, opportunityId, title: opp.title, executiveSummary: execSummary, freshness, evidenceCount: events.length, score: opp.confidence_score || opp.score, confidence: "High", generatedAt: now, provenance: opp.provenance || "LIVE", noForecasts: true }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
          }
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message, stack: e.stack }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/reports") {
      try {
        const db = env2.DB;
        const userId = url.searchParams.get("userId") || "1";
        const rows = await d1Query(db, "SELECT * FROM reports WHERE userId = ? AND provenance = 'LIVE' ORDER BY generatedAt DESC LIMIT 20", [userId]);
        response = new Response(JSON.stringify({ reports: rows.results || [] }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/search") {
      try {
        const db = env2.DB;
        const q = url.searchParams.get("q") || "";
        let provenance = url.searchParams.get("provenance");
        const offset = parseInt(url.searchParams.get("offset") || "0");
        const limit = parseInt(url.searchParams.get("limit") || "50");
        const clampedLimit = Math.min(Math.max(limit, 1), 200);
        const clampedOffset = Math.max(offset, 0);
        if (!q || q.length < 2) {
          response = new Response(JSON.stringify({ error: "Query must be at least 2 characters" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else if (q.length > 100) {
          response = new Response(JSON.stringify({ error: "Query must be at most 100 characters" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          const searchTerm = "%" + q + "%";
          let sql = "SELECT canonicalId as id, eventType, title, description, address, city, county, state, permitType, workClass, status, providerId, publishedAt, provenance FROM kestovar_canonical_events WHERE (title LIKE ? OR description LIKE ? OR address LIKE ? OR city LIKE ? OR county LIKE ? OR state LIKE ? OR permitType LIKE ? OR workClass LIKE ? OR eventType LIKE ? OR status LIKE ? OR providerId LIKE ?)";
          const params = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];
          if (provenance && ["LIVE", "SEED", "SAMPLE", "TEST", "SIMULATED"].includes(provenance.toUpperCase())) {
            sql += " AND provenance = ?";
            params.push(provenance.toUpperCase());
          } else {
            sql += " AND proven