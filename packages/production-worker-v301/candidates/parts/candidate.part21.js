, state, COUNT(*) as cnt FROM kestovar_canonical_events ${whereClause} AND county IS NOT NULL AND county <> '' GROUP BY county, state ORDER BY cnt DESC LIMIT 50`, [...params]),
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
          await d1Query(db, "INSERT INTO alert_config (userId, counties, eventTypes, keywords, channel, frequency, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now')) ON CONFLICT(userId) DO UPDATE SET counties = excluded.counties, eventTypes = excluded.eventTypes, keywords = excluded.keywords, channel = excluded.channel, frequency = excluded.frequency, updatedAt = datetime('now')", [userId, counties, eventTypes, keywords, channel, frequency]);
          response = new Response(JSON.stringify({ success: true, userId, counties, eventTypes, keywords, channel, frequency }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/alerts/status") {
      try {
        const db = env2.DB;
        const userId = url.searchParams.get("userId");
        if (!userId) {
          response = new Response(JSON.stringify({ error: "userId required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          const config = await d1Query(db, "SELECT * FROM alert_config WHERE userId = ?", [userId]);
          const recent = await d1Query(db, "SELECT * FROM alert_history WHERE userId = ? ORDER BY sentAt DESC LIMIT 10", [userId]);
          response = new Response(JSON.stringify({
            userId,
            config: config.results?.[0] || null,
            recentAlerts: recent.results || [],
            alertCount: (recent.results || []).length
          }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/conversion/track") {
      try {
        const db = env2.DB;
        const event = url.searchParams.get("event");
        const userId = url.searchParams.get("userId");
        const value = url.searchParams.get("value");
        const source = url.searchParams.get("source") || "web";
        if (!event) {
          response = new Response(JSON.stringify({ error: "event required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          await d1Query(db, "INSERT INTO conversion_events (event, userId, value, source, createdAt) VALUES (?, ?, ?, ?, datetime('now'))", [event, userId, value, source]);
          response = new Response(JSON.stringify({ success: true, event, userId }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/conversion/funnel") {
      try {
        const db = env2.DB;
        const days = parseInt(url.searchParams.get("days") || "30");
        const funnel = await d1Query(db, "SELECT event, COUNT(*) as cnt, COUNT(DISTINCT userId) as uniqueUsers FROM conversion_events WHERE createdAt >= datetime('now', '-' || ? || ' days') GROUP BY event ORDER BY cnt DESC", [days]);
        response = new Response(JSON.stringify({
          days,
          funnel: funnel.results || [],
          generatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/ops/metrics") {
      try {
        const db = env2.DB;
        const [canonicalCount, patternCount, oppCount, recCount, evidenceCount, providerHealth, recentIngestion, conversionStats, userPlans, trialStats, subEvents, alertConfigs] = await Promise.all([
          d1Query(db, "SELECT COUNT(*) as cnt FROM kestovar_canonical_events WHERE provenance = 'LIVE'"),
          d1Query(db, "SELECT COUNT(*) as cnt FROM signalcore_patterns WHERE provenance = 'LIVE'"),
          d1Query(db, "SELECT COUNT(*) as cnt FROM opportunities WHERE provenance = 'LIVE'"),
          d1Query(db, "SELECT COUNT(*) as cnt FROM signalcore_recommendations WHERE provenance = 'LIVE'"),
          d1Query(db, "SELECT COUNT(*) as cnt FROM signalcore_pattern_evidence"),
          d1Query(db, "SELECT providerId, lastPollStatus, consecutiveSuccesses, co