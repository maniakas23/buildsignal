a-z\s]+),?\s*(?:NC|North Carolina|VA|Virginia|SC|South Carolina)?/i);
          if (match) city = match[1].trim();
        }
        const county = attrs.county || attrs.sitecounty || "";
        const state = attrs.state || attrs.sitestate || "";
        const zipCode = attrs.zip || attrs.zipcode || attrs.postalcode || attrs.sitezip || null;
        const providerName = "Raleigh Open Data";
        const canonicalId = `kev-${crypto.randomUUID()}`;
        const nowMs = Date.now();
        await d1Run(
          db,
          `INSERT INTO kestovar_canonical_events (canonicalId, providerId, sourceRecordId, eventType, title, description, county, state, city, zipCode, lat, lng, address, publishedAt, ingestedAt, confidence, status, contentHash, rawData, dataSource, provenance, createdAt, syncedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [canonicalId, row.providerId, row.sourceRecordId || null, "building_permit", title, description, county, state, city, zipCode, lat, lng, address, publishedAtMs, nowMs, 70, "active", contentHash, rawPayload, providerName, "LIVE", nowMs, nowMs]
        );
        recordsNormalized++;
        lastEventId = canonicalId;
      }
      await d1Run(
        db,
        `INSERT INTO kestovar_ingestion_watermark (providerId, lastSourceTimestamp, lastRecordId, lastIngestedAt, totalRecordsIngested, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(providerId) DO UPDATE SET lastSourceTimestamp = ?, lastRecordId = ?, lastIngestedAt = ?, totalRecordsIngested = totalRecordsIngested + ?, updatedAt = ?`,
        [canonicalProviderId, now, lastEventId, now, recordsNormalized, now, now, now, lastEventId, now, recordsNormalized, now]
      );
    } catch (normErr) {
      console.error("Normalization error:", normErr);
    }
    resolveLatency = Date.now() - normalizeStart;
    await d1Run(
      db,
      `UPDATE ingestion_runs SET status = ?, completedAt = ?, recordsObserved = ?, recordsCreated = ?, recordsResolved = ?, fetchLatencyMs = ?, parseLatencyMs = ?, resolveLatencyMs = ?, totalLatencyMs = ?, sourceRecordCount = ? WHERE id = ?`,
      ["completed", now, recordsObserved, recordsCreated, recordsNormalized, fetchLatency, parseLatency, resolveLatency, totalLatency, recordsObserved, runId]
    );
    await d1Run(
      db,
      `UPDATE provider_registry SET lastSuccessfulFetch = ?, recordsIngested = recordsIngested + ?, healthStatus = 'healthy', isActive = 1, updatedAt = ? WHERE providerId = ?`,
      [now, recordsCreated, now, canonicalProviderId]
    );
    await d1Run(
      db,
      `UPDATE provider_polling_schedule SET lastPollCompletedAt = ?, lastPollStatus = 'completed', lastPollRunId = ?, consecutiveFailures = 0, consecutiveSuccesses = consecutiveSuccesses + 1, totalPolls = totalPolls + 1, backoffMultiplier = 1.0, nextPollDueAt = ?, updatedAt = ? WHERE providerId = ?`,
      [now, runId, now + 240 * 60, now, canonicalProviderId]
    );
    await d1Run(
      db,
      `UPDATE circuit_breaker SET successCount = successCount + 1, lastSuccessAt = ?, state = CASE WHEN state = 'half-open' AND successCount + 1 >= successThreshold THEN 'closed' ELSE state END, updatedAt = ? WHERE providerId = ?`,
      [now, now, canonicalProviderId]
    );
  } catch (err) {
    fetchError = err?.message || String(err);
    if (runId) {
      const now = Math.floor(Date.now() / 1e3);
      await d1Run(
        db,
        `UPDATE ingestion_runs SET status = ?, completedAt = ?, recordsObserved = ?, recordsCreated = ?, error = ?, errorCode = ?, totalLatencyMs = ? WHERE id = ?`,
        ["failed", now, recordsObserved, recordsCreated, fetchError, "FETCH_ERROR", Date.now() - overallStart, runId]
      );
      await d1Run(
        db,
        `UPDATE provider_registry SET healthStatus = 'error', isActive = 0, updatedAt = ? WHERE providerId = ?`,
        [now, canonicalProviderId]
      );
      await d1Run(
        db,
        `UPDATE provider_polling_schedule SET lastPollCompletedAt = ?, lastPollStatus = 'failed', lastPollRunId = ?, consecutiveFailures = consecutiveFailures + 1, consecutiveSuccesses = 0, totalPolls = totalPolls + 1, totalFailures = totalFailures + 1, backoffMultiplier = MIN(backoffMultiplier * 2, 16.0), nextPollDueAt = ? + (cadenceMinutes * 60 * MIN(backoffMultiplier * 2, 16.0)), updatedAt = ? WHERE providerId = ?`,
        [now, runId, now, now, canonicalProviderId]
      );
      await d1Run(
        db,
        `UPDATE circuit_breaker SET failureCount = failureCount + 1, lastFailureAt = ?, state = CASE WHEN failureCount + 1 >= failureThreshold THEN 'open' ELSE state END, openedAt = CASE WHEN failureCount + 1 >= failureThreshold AND openedAt IS NULL THEN ? ELSE openedAt END, updatedAt = ? WHERE providerId = ?`,
        [now, now, now, canonicalProviderId]
      );
    }
  }
  return {
    success: !fetchError,
    runId,
    recordsObserved,
    recordsCreated,
    recordsNormalized,
    recordsSkipped,
    error: fetchError,
    totalLatencyMs: Date.now() - overallStart,
    providerId: canonicalProviderId
  };
}
__name(executeIngestionRun, "executeIngestionRun");
__name2(executeIngestionRun, "executeIngestionRun");
async function runSchedulerCron(db, cronTimestamp) {
  const now = Math.floor(Date.now() / 1e3);
  const results = {
    timestamp: now,
    cronTimestamp,
    providersEvaluated: 0,
    providersDue: 0,
    providersSucceeded: 0,
    providersFailed: 0,
    providersSkipped: 0,
    skipReasons: [],
    runs: []
  };
  try {
    await d1Run(
      db,
      `INSERT INTO scheduler_activity_log (providerId, eventType, eventDescription, severity, details, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
      ["scheduler", "SCHEDULER_START", "Cron scheduler cycle started", "info", JSON.stringify({ cronTimestamp }), now]
    );
    const schedules = await d1Query(
      db,
      `SELECT providerId, state, cadenceMinutes, nextPollDueAt, lastPollStartedAt, lastPollCompletedAt, lastPollStatus, consecutiveFailures, consecutiveSuccesses, totalPolls, backoffMultiplier FROM provider_polling_schedule WHERE state = 'active' ORDER BY nextPollDueAt`
    );
    results.providersEvaluated = schedules.results?.length || 0;
    for (const sched of schedules.results || []) {
      const providerId = sched.providerId;
      const isDue = sched.nextPollDueAt <= now;
      if (!isDue) {
        results.providersSkipped++;
        results.skipReasons.push({ providerId, reason: "NOT_DUE", nextPollDueAt: sched.nextPollDueAt });
        continue;
      }
      results.providersDue++;
      const cb = await d1Query(
        db,
        `SELECT state, failureCount, lastFailureAt, openedAt FROM circuit_breaker WHERE providerId = ?`,
        [providerId]
      );
      const cbState = cb.results?.[0]?.state || "closed";
      if (cbState === "open") {
        const openedAt = cb.results[0].openedAt;
        const timeout = 300;
        if (now - openedAt < timeout) {
          results.providersSkipped++;
          results.skipReasons.push({ providerId, reason: "CIRCUIT_OPEN", openedAt, retryAfter: openedAt + timeout });
          await d1Run(
            db,
            `INSERT INTO scheduler_activity_log (providerId, eventType, eventDescription, severity, details, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
            [providerId, "CIRCUIT_SUPPRESSED", `Poll suppressed: circuit breaker OPEN since ${openedAt}`, "warning", JSON.stringify({ cbState, openedAt, retryAfter: openedAt + timeout }), now]
          );
          continue;
        } else {
          await d1Run(
            db,
            `UPDATE circuit_breaker SET state = 'half-open', halfOpenedAt = ? WHERE providerId = ?`,
            [now, providerId]
          );
        }
      }
      if (sched.lastPollStatus === "running" && sched.lastPollStartedAt) {
        const elapsed = now - sched.lastPollStartedAt;
        if (elapsed < 300) {
          results.providersSkipped++;
          results.skipReasons.push({ providerId, reason: "ALREADY_RUNNING", lastPollStartedAt: sched.lastPollStartedAt });
          await d1Run(
            db,
            `INSERT INTO scheduler_activity_log (providerId, eventType, eventDescription, severity, details, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
            [providerId, "OVERLAP_SKIPPED", "Poll skipped: previous run still active", "warning", JSON.stringify({ lastPollStartedAt: sched.lastPollStartedAt }), now]
          );
          continue;
        } else {
          await d1Run(
            db,
            `UPDATE provider_polling_schedule SET lastPollStatus = 'timed_out', lastPollCompletedAt = ?, consecutiveFailures = consecutiveFailures + 1, consecutiveSuccesses = 0, totalPolls = totalPolls + 1, totalFailures = totalFailures + 1, updatedAt = ? WHERE providerId = ?`,
            [now, now, providerId]
          );
          await d1Run(
            db,
            `INSERT INTO scheduler_activity_log (providerId, eventType, eventDescription, severity, details, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
            [providerId, "STALE_RUN_RECOVERED", `Previous poll timed out after ${elapsed}s, recovered for retry`, "warning", JSON.stringify({ elapsed, lastPollStartedAt: sched.lastPollStartedAt }), now]
          );
        }
      }
      await d1Run(
        db,
        `UPDATE provider_polling_schedule SET lastPollStartedAt = ?, lastPollStatus = 'running', updatedAt = ? WHERE providerId = ?`,
        [now, now, providerId]
      );
      await d1Run(
        db,
        `INSERT INTO scheduler_activity_log (providerId, eventType, eventDescription, severity, details, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
        [providerId, "POLL_STARTED", `Scheduled poll started for ${providerId}`, "info", JSON.stringify({ trigger: "cron", scheduledAt: sched.nextPollDueAt }), now]
      );
  