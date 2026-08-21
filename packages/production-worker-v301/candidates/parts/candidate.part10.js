viderId]
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
      let runResult;
      try {
        runResult = await executeIngestionRun(db, providerId, 50, "scheduled");
      } catch (execErr) {
        const errMsg = execErr?.message || String(execErr);
        runResult = {
          success: false,
          runId: null,
          recordsObserved: 0,
          recordsCreated: 0,
          recordsNormalized: 0,
          recordsSkipped: 0,
          error: errMsg,
          totalLatencyMs: 0,
          providerId
        };
        await d1Run(
          db,
          `UPDATE provider_polling_schedule SET lastPollCompletedAt = ?, lastPollStatus = 'failed', lastPollRunId = ?, consecutiveFailures = consecutiveFailures + 1, consecutiveSuccesses = 0, totalPolls = totalPolls + 1, totalFailures = totalFailures + 1, backoffMultiplier = MIN(backoffMultiplier * 2, 16.0), nextPollDueAt = ? + (cadenceMinutes * 60 * MIN(backoffMultiplier * 2, 16.0)), updatedAt = ? WHERE providerId = ?`,
          [now, null, now, now, providerId]
        );
      }
      results.runs.push(runResult);
      if (runResult.success) {
        results.providersSucceeded++;
        await d1Run(
          db,
          `INSERT INTO scheduler_activity_log (providerId, eventType, eventDescription, severity, details, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
          [providerId, "POLL_COMPLETED", `Scheduled poll completed for ${providerId}`, "info", JSON.stringify({ runId: runResult.runId, recordsObserved: runResult.recordsObserved, recordsCreated: runResult.recordsCreated, recordsNormalized: runResult.recordsNormalized }), now]
        );
      } else {
        results.providersFailed++;
        await d1Run(
          db,
          `INSERT INTO scheduler_activity_log (providerId, eventType, eventDescription, severity, details, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
          [providerId, "POLL_FAILED", `Scheduled poll failed for ${providerId}: ${runResult.error}`, "error", JSON.stringify({ runId: runResult.runId, error: runResult.error }), now]
        );
      }
    }
    try {
      const { results: pendingAlerts } = await d1Query(db, "SELECT * FROM alert_history WHERE sentAt >= datetime('now', '-1 hour') AND readAt IS NULL ORDER BY sentAt DESC LIMIT 100");
      let alertsDelivered = 0;
      for (const alert of pendingAlerts || []) {
        const delivery = await deliverAlert({ userId: alert.userId, title: alert.title, body: alert.body, channel: "email" }, env);
        if (delivery.success) alertsDelivered++;
      }
      if (alertsDelivered > 0 || (pendingAlerts || []).length > 0) {
        await d1Run(
          db,
          `INSERT INTO scheduler_activity_log (providerId, eventType, eventDescription, severity, details, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
          ["scheduler", "ALERTS_DELIVERED", `Alert delivery cycle completed`, "info", JSON.stringify({ pending: (pendingAlerts || []).length, delivered: alertsDelivered }), now]
        );
      }
    } catch (alertErr) {
      console.error("Alert delivery error:", alertErr);
    }
    await d1Run(
      db,
      `INSERT INTO scheduler_activity_log (providerId, eventType, eventDescription, severity, details, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
      ["scheduler", "SCHEDULER_COMPLETE", "Cron scheduler cycle completed", "info", JSON.stringify({ providersEvaluated: results.providersEvaluated, providersDue: results.providersDue, providersSucceeded: results.providersSucceeded, providersFailed: results.providersFailed, providersSkipped: results.providersSkipped }), now]
    );
  } catch (err) {
    console.error("Scheduler cron error:", err);
    await d1Run(
      db,
      `INSERT INTO scheduler_activity_log (providerId, eventType, eventDescription, severity, details, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
      ["scheduler", "SCHEDULER_ERROR", `Cron scheduler cycle error: ${err.message}`, "critical", JSON.stringify({ error: err.message, stack: err.stack }), now]
    );
    results.error = err.message;
  }
  return results;
}
__name(runSchedulerCron, "runSchedulerCron");
__name2(runSchedulerCron, "runSchedulerCron");
async function handleRequest(req, env2, ctx) {
  const url = new URL(req.url);
  const path = url.pathname;
  const origin = req.headers.get("Origin") || "https://buildsignal.net";
  const clientIP = req.headers.get("CF-Connecting-IP") || "unknown";
  const requestId = crypto.randomUUID();
  const start = Date.now();
  if (req.method === "OPTIONS