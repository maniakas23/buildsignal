           const openedAt = cb.results[0].openedAt;
            const timeout = 300;
            if (now - openedAt < timeout) {
              response = new Response(JSON.stringify({
                success: false,
                error: "Circuit breaker OPEN",
                providerId: canonicalId,
                cbState,
                openedAt,
                retryAfter: openedAt + timeout
              }), { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
            } else {
              await d1Run(
                db,
                `UPDATE circuit_breaker SET state = 'half-open', halfOpenedAt = ? WHERE providerId = ?`,
                [now, canonicalId]
              );
            }
          }
          if (!response) {
            await d1Run(
              db,
              `UPDATE provider_polling_schedule SET lastPollStartedAt = ?, lastPollStatus = 'running', updatedAt = ? WHERE providerId = ?`,
              [now, now, canonicalId]
            );
            response = new Response(JSON.stringify({
              success: true,
              providerId: canonicalId,
              message: "Poll scheduled. Use POST /api/v1/ingestion/run to execute.",
              cbState: cbState === "open" ? "half-open" : cbState,
              nextPollDueAt: now + 240 * 60
            }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
          }
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/scheduler/heartbeat" && req.method === "POST") {
      try {
        const db = env2.DB;
        const now = Math.floor(Date.now() / 1e3);
        const active = await d1Query(
          db,
          `SELECT COUNT(*) as cnt FROM provider_polling_schedule WHERE state = 'active'`
        );
        const due = await d1Query(
          db,
          `SELECT COUNT(*) as cnt FROM provider_polling_schedule WHERE nextPollDueAt <= ? AND state = 'active'`,
          [now]
        );
        const suspended = await d1Query(
          db,
          `SELECT COUNT(*) as cnt FROM provider_polling_schedule WHERE state = 'suspended'`
        );
        const openCB = await d1Query(
          db,
          `SELECT COUNT(*) as cnt FROM circuit_breaker WHERE state = 'open'`
        );
        const running = await d1Query(
          db,
          `SELECT COUNT(*) as cnt FROM provider_polling_schedule WHERE lastPollStatus = 'running'`
        );
        response = new Response(JSON.stringify({
          success: true,
          timestamp: now,
          scheduler: {
            activeSchedules: active.results?.[0]?.cnt || 0,
            dueNow: due.results?.[0]?.cnt || 0,
            suspended: suspended.results?.[0]?.cnt || 0,
            circuitBreakersOpen: openCB.results?.[0]?.cnt || 0,
            currentlyRunning: running.results?.[0]?.cnt || 0
          },
          status: "healthy"
        }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/scheduler/staleness" && req.method === "GET") {
      try {
        const db = env2.DB;
        const now = Math.floor(Date.now() / 1e3);
        const staleThreshold = now - 6 * 3600;
        const stale = await d1Query(
          db,
          `SELECT p.providerId, p.providerName, p.lastSuccessfulFetch, p.healthStatus, s.nextPollDueAt, s.consecutiveFailures, s.totalPolls, cb.state as cbState FROM provider_registry p LEFT JOIN provider_polling_schedule s ON p.providerId = s.providerId LEFT JOIN circuit_breaker cb ON p.providerId = cb.providerId WHERE p.isActive = 1 AND (p.lastSuccessfulFetch < ? OR p.lastSuccessfulFetch IS NULL) ORDER BY p.lastSuccessfulFetch`,
          [staleThreshold]
        );
        const healthy = await d1Query(
          db,
          `SELECT p.providerId, p.providerName, p.lastSuccessfulFetch, p.healthStatus, s.nextPollDueAt FROM provider_registry p LEFT JOIN provider_polling_schedule s ON p.providerId = s.providerId WHERE p.isActive = 1 AND p.lastSuccessfulFetch >= ? ORDER BY p.lastSuccessfulFetch DESC`,
          [staleThreshold]
        );
        response = new Response(JSON.stringify({
          success: true,
          now,
          staleThreshold,
          staleProviders: stale.results || [],
          healthyProviders: healthy.results || [],
          staleCount: stale.results?.length || 0,
          healthyCount: healthy.results?.length || 0
        }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/scheduler/activity" && req.method === "GET") {
      try {
        const db = env2.DB;
        const limit = Math.min(Math.max(parseInt(new URL(req.url).searchParams.get("limit") || "50"), 1), 500);
        const providerId = new URL(req.url).searchParams.get("providerId");
        let sql = `SELECT providerId, eventType, eventDescription, runId, severity, details, createdAt FROM scheduler_activity_log`;
        const params = [];
        if (providerId) {
          sql += ` WHERE providerId = ?`;
          params.push(providerId);
        }
        sql += ` ORDER BY createdAt DESC LIMIT ?`;
        params.push(limit);
        const logs = await d1Query(db, sql, params);
        response = new Response(JSON.stringify({
          success: true,
          limit,
          providerId: providerId || null,
          activities: logs.results || []
        }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/scheduler/webpush" && req.method === "POST") {
      try {
        const body = await req.json().catch(() => ({}));
        const subscription = body.subscription;
        const userId = body.userId;
        const events = body.events || ["POLL_FAILED", "CIRCUIT_BREAKER_OPENED", "STALENESS_DETECTED"];
        if (!subscription || !subscription.endpoint) {
          response = new Response(JSON.stringify({ error: "subscription.endpoint is required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else if (!userId) {
          response = new Response(JSON.stringify({ error: "userId is required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          const db = env2.DB;
          const now = Math.floor(Date.now() / 1e3);
          await d1Run(
            db,
            `INSERT INTO webpush_subscriptions (endpoint, p256dh, auth, events, userId, active, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth, events = excluded.events, userId = excluded.userId, active = 1, updatedAt = excluded.updatedAt`,
            [subscription.endpoint, subscription.keys?.p256dh || "", subscription.keys?.auth || "", JSON.stringify(events), userId, 1, now, now]
          );
          response = new Response(JSON.stringify({ success: true, message: "Subscription saved", events }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/webpush/subscriptions" && req.method === "GET") {
      try {
        const userId = url.searchParams.get("userId");
        if (!userId) {
          response = new Response(JSON.stringify({ error: "userId required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          const db = env2.DB;
          const { results } = await d1Query(db, "SELECT endpoint, events, active, createdAt FROM webpush_subscriptions WHERE userId = ?", [userId]);
          response = new Response(JSON.stringify({ subscriptions: results || [] }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/webpush/unsubscribe" && req.method === "POST") {
      try {
        const body = await req.json().catch(() => ({}));
        const endpoint = body.endpoint;
        const userId = body.userId;
        if (!endpoint || !userId) {
          response = new Response(JSON.stringify({ error: "endpoint and userId required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          const db = env2.DB;
          await d1Run(db, "DELETE FROM webpush_subscriptions WHERE endpoint = ? AND userId = ?", [endpoint, userId]);
          response = new Response(JSON.stringify({ success: true, message: "Unsubscribed" }), { headers: { "Content-Type": "application/json", ...corsHead