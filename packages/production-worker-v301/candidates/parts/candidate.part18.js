atesDiscovered: discoveries.length,
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
            `SELECT id, providerId, sourceRecordId, sourceUrl, observedAt, ingestedAt, rawPayload, rawTitle, rawDescription, rawLocation, rawStatus, rawDates, ingestionRunId, provenance FROM raw_records WHERE providerId = ? ORDER BY observedAt DESC LIMIT ?`,
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
 