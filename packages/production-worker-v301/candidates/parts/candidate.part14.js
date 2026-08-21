ace("opp-", "")]);
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
            sql += " AND provenance = 'LIVE'";
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
        const liveOpps = await d1Query(db, 