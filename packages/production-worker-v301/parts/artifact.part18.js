es, ingestionRunId, provenance FROM raw_records WHERE providerId = ? ORDER BY observedAt DESC LIMIT ?`,
            [queryId, limit]
          );
          response = new Response(JSON.stringify({
            success: true,
            providerId: queryId,
            count: totalCount + fallbackCount,
            records: recordsResult.results || []
          }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/scheduler/status" && req.method === "GET") {
      try {
        const db = env2.DB;
        const schedules = await d1Query(
          db,
          `SELECT providerId, state, cadenceMinutes, nextPollDueAt, lastPollStartedAt, lastPollCompletedAt, lastPollStatus, lastPollRunId, consecutiveFailures, consecutiveSuccesses, totalPolls, totalFailures, backoffMultiplier, retryAfter, scheduledFrom, updatedAt FROM provider_polling_schedule ORDER BY nextPollDueAt`
        );
        const cb = await d1Query(
          db,
          `SELECT providerId, state as cbState, failureCount, successCount, lastFailureAt, lastSuccessAt, openedAt, halfOpenedAt FROM circuit_breaker ORDER BY providerId`
        );
        const queue = await d1Query(
          db,
          `SELECT providerId, dueAt, priority, state as queueState, lockId, lockedAt, lockExpiresAt FROM provider_due_queue ORDER BY dueAt`
        );
        response = new Response(JSON.stringify({
          success: true,
          now: Math.floor(Date.now() / 1e3),
          schedules: schedules.results || [],
          circuitBreakers: cb.results || [],
          dueQueue: queue.results || []
        }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/scheduler/due" && req.method === "GET") {
      try {
        const db = env2.DB;
        const now = Math.floor(Date.now() / 1e3);
        const due = await d1Query(
          db,
          `SELECT s.providerId, s.cadenceMinutes, s.nextPollDueAt, s.lastPollStatus, s.consecutiveFailures, s.consecutiveSuccesses, s.totalPolls, s.backoffMultiplier, cb.state as cbState FROM provider_polling_schedule s LEFT JOIN circuit_breaker cb ON s.providerId = cb.providerId WHERE s.nextPollDueAt <= ? AND s.state = 'active' ORDER BY s.nextPollDueAt`,
          [now]
        );
        response = new Response(JSON.stringify({
          success: true,
          now,
          dueCount: due.results?.length || 0,
          providers: due.results || []
        }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/scheduler/poll" && req.method === "POST") {
      try {
        const db = env2.DB;
        const body = await req.json().catch(() => ({}));
        const providerId = body.providerId;
        const limit = Math.min(Math.max(body.limit || 50, 1), 500);
        const now = Math.floor(Date.now() / 1e3);
        if (!providerId) {
          response = new Response(JSON.stringify({ error: "providerId is required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          const canonicalId = {
            "raleigh_building_permits": "raleigh-permits",
            "wake_county_building_permits": "wake-county-permits",
            "mecklenburg_nc_building_permits": "mecklenburg-nc-building_permits",
            "fairfax_va_building_permits": "fairfax-va-building_permits"
          }[providerId] || providerId;
          const cb = await d1Query(
            db,
            `SELECT state, failureCount, lastFailureAt, openedAt FROM circuit_breaker WHERE providerId = ?`,
            [canonicalId]
          );
          const cbState = cb.results?.[0]?.state || "closed";
          if (cbState === "open") {
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
        const providerId = new URL(req.url).s