ECT canonicalId, eventType, title, description, address, city, county, state, permitType, workClass, status, providerId, publishedAt, ingestedAt, lat, lng, contentHash FROM kestovar_canonical_events WHERE provenance = 'LIVE'";
        const eventParams = [];
        if (county) {
          eventSql += " AND county = ?";
          eventParams.push(county);
        }
        if (state) {
          eventSql += " AND state = ?";
          eventParams.push(state);
        }
        eventSql += " ORDER BY publishedAt DESC LIMIT ?";
        eventParams.push(limit);
        const events = await d1Query(db, eventSql, eventParams);
        let patternSql = "SELECT id, name, patternType, description, county, state, confidence, evidenceCount, impactScore, summary, recommendedAction, firstDetectedAt FROM signalcore_patterns WHERE provenance = 'LIVE'";
        const patternParams = [];
        if (county) {
          patternSql += " AND county = ?";
          patternParams.push(county);
        }
        if (state) {
          patternSql += " AND state = ?";
          patternParams.push(state);
        }
        patternSql += " ORDER BY confidence DESC LIMIT ?";
        patternParams.push(limit);
        const patterns = await d1Query(db, patternSql, patternParams);
        let oppSql = "SELECT id, title, description, county, state, confidence_score, created_at FROM opportunities WHERE provenance = 'LIVE'";
        const oppParams = [];
        if (county) {
          oppSql += " AND county = ?";
          oppParams.push(county);
        }
        if (state) {
          oppSql += " AND state = ?";
          oppParams.push(state);
        }
        oppSql += " ORDER BY confidence_score DESC LIMIT ?";
        oppParams.push(limit);
        const opportunities = await d1Query(db, oppSql, oppParams);
        response = new Response(JSON.stringify({
          canonicalEvents: events.results || [],
          patterns: patterns.results || [],
          opportunities: opportunities.results || [],
          meta: {
            generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
            version: "1.6.0",
            source: "kestovar_canonical_events",
            filters: { county, state, limit }
          }
        }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/jurisdictions") {
      try {
        const db = env2.DB;
        const { results } = await d1Query(db, "SELECT county, state, COUNT(*) as signalCount, COUNT(DISTINCT providerId) as providerCount, MIN(publishedAt) as earliest, MAX(publishedAt) as latest FROM kestovar_canonical_events WHERE provenance = 'LIVE' AND county IS NOT NULL AND county <> '' AND state IS NOT NULL AND state <> '' GROUP BY county, state ORDER BY signalCount DESC");
        response = new Response(JSON.stringify({ jurisdictions: results || [], count: (results || []).length }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/search/facets") {
      try {
        const db = env2.DB;
        const q = url.searchParams.get("q") || "";
        const searchTerm = q ? "%" + q + "%" : null;
        const whereClause = searchTerm ? "WHERE (title LIKE ? OR description LIKE ? OR address LIKE ? OR city LIKE ? OR county LIKE ? OR state LIKE ? OR permitType LIKE ? OR workClass LIKE ? OR eventType LIKE ? OR status LIKE ? OR providerId LIKE ?) AND provenance = 'LIVE'" : "WHERE provenance = 'LIVE'";
        const params = searchTerm ? [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm] : [];
        const [stateFacet, countyFacet, providerFacet, eventTypeFacet, permitTypeFacet, statusFacet] = await Promise.all([
          d1Query(db, `SELECT state, COUNT(*) as cnt FROM kestovar_canonical_events ${whereClause} AND state IS NOT NULL AND state <> '' GROUP BY state ORDER BY cnt DESC`, [...params]),
          d1Query(db, `SELECT county, state, COUNT(*) as cnt FROM kestovar_canonical_events ${whereClause} AND county IS NOT NULL AND county <> '' GROUP BY county, state ORDER BY cnt DESC LIMIT 50`, [...params]),
          d1Query(db, `SELECT providerId, COUNT(*) as cnt FROM kestovar_canonical_events ${whereClause} AND providerId IS NOT NULL AND providerId <> '' GROUP BY providerId ORDER BY cnt DESC`, [...params]),
          d1Query(db, `SELECT eventType, COUNT(*) as cnt FROM kestovar_canonical_events ${whereClause} AND eventType IS NOT NULL AND eventType <> '' GROUP BY eventType ORDER BY cnt DESC`, [...params]),
          d1Query(db, `SELECT permitType, COUNT(*) as cnt FROM kestovar_canonical_events ${whereClause} AND permitType IS NOT NULL AND permitType <> '' GROUP BY permitType ORDER BY cnt DESC LIMIT 20`, [...params]),
          d1Query(db, `SELECT status, COUNT(*) as cnt FROM kestovar_canonical_events ${whereClause} AND status IS NOT NULL AND status <> '' GROUP BY status ORDER BY cnt DESC LIMIT 20`, [...params])
        ]);
        response = new Response(JSON.stringify({
          query: q,
          state: (stateFacet.results || []).map((r) => ({ value: r.state, count: r.cnt })),
          county: (countyFacet.results || []).map((r) => ({ value: r.county, state: r.state, count: r.cnt })),
          providerId: (providerFacet.results || []).map((r) => ({ value: r.providerId, count: r.cnt })),
          eventType: (eventTypeFacet.results || []).map((r) => ({ value: r.eventType, count: r.cnt })),
          permitType: (permitTypeFacet.results || []).map((r) => ({ value: r.permitType, count: r.cnt })),
          status: (statusFacet.results || []).map((r) => ({ value: r.status, count: r.cnt }))
        }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/onboarding/track") {
      try {
        const db = env2.DB;
        const step = url.searchParams.get("step");
        const userId = url.searchParams.get("userId");
        if (!step || !userId) {
          response = new Response(JSON.stringify({ error: "step and userId required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          await d1Query(db, "INSERT INTO onboarding_tracking (userId, step, completedAt) VALUES (?, ?, datetime('now')) ON CONFLICT(userId, step) DO UPDATE SET completedAt = datetime('now')", [userId, step]);
          response = new Response(JSON.stringify({ success: true, step, userId }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/onboarding/status") {
      try {
        const db = env2.DB;
        const userId = url.searchParams.get("userId");
        if (!userId) {
          response = new Response(JSON.stringify({ error: "userId required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          const completed = await d1Query(db, "SELECT step FROM onboarding_tracking WHERE userId = ?", [userId]);
          const allSteps = ["signup", "verify_email", "select_counties", "view_first_signal", "set_alert", "invite_team", "upgrade"];
          const done = new Set((completed.results || []).map((r) => r.step));
          const nextStep = allSteps.find((s) => !done.has(s)) || "complete";
          response = new Response(JSON.stringify({
            userId,
            completed: Array.from(done),
            nextStep,
            progress: Math.round(done.size / allSteps.length * 100),
            allSteps
          }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/alerts/configure") {
      try {
        const db = env2.DB;
        const userId = url.searchParams.get("userId");
        const counties = url.searchParams.get("counties");
        const eventTypes = url.searchParams.get("eventTypes");
        const keywords = url.searchParams.get("keywords");
        const channel = url.searchParams.get("channel") || "email";
        const frequency = url.searchParams.get("frequency") || "daily";
        if (!userId) {
          response = new Response(JSON.stringify({ error: "userId required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          await d1Query(db, "INSERT INTO alert_config (userId, counties, eventTypes, keywords, channel, frequency, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now')) ON CONFLICT(userId) DO UPDATE SET counties = excluded.counties, eventTypes = excluded.eventTypes, keywords = excluded.keywords, channel = excluded.channel, frequency = excluded.frequency, updatedAt = datetime