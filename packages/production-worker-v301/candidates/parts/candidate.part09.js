attrs.location || attrs.PARCEL_ID || "");
      const rawStatus = String((w1 && w1.statusField && attrs[w1.statusField]) || attrs.status || attrs.permitstatus || attrs.permit_status || attrs.RECORD_STATUS || "");
      const rawDates = JSON.stringify({
        applied: attrs.applieddate || attrs.applied_date || attrs.dateapplied || attrs.SUBMITTED_DATE,
        issued: attrs.issueddate || attrs.issued_date || attrs.dateissued || attrs.RECORD_STATUS_DATE,
        completed: attrs.completeddate || attrs.completed_date || attrs.datecompleted
      });
      const existing = await d1Query(
        db,
        `SELECT id FROM raw_records WHERE providerId = ? AND rawPayload = ? LIMIT 1`,
        [canonicalProviderId, rawPayload]
      );
      if (existing.results?.length > 0) {
        await d1Run(db, `UPDATE raw_records SET observedAt = ? WHERE id = ?`, [now, existing.results[0].id]);
        continue;
      }
      const sourceRecordId = String(attrs.permitnum || attrs.permitnumber || attrs.id || attrs.objectid || attrs.OBJECTID || attrs.RECORDID || "");
      await d1Run(
        db,
        `INSERT INTO raw_records (providerId, sourceRecordId, sourceUrl, observedAt, ingestedAt, rawPayload, rawTitle, rawDescription, rawLocation, rawStatus, rawDates, rawMetadata, ingestionRunId, provenance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [canonicalProviderId, sourceRecordId, endpoint, now, now, rawPayload, rawTitle, rawDescription, rawLocation, rawStatus, rawDates, (w1 ? JSON.stringify({ geometry: feature.geometry || null }) : null), runId, "LIVE"]
      );
      recordsCreated++;
    }
    parseLatency = Date.now() - parseStart;
    const totalLatency = Date.now() - overallStart;
    const normalizeStart = Date.now();
    let lastEventId = 0;
    try {
      const rawRows = await d1Query(
        db,
        `SELECT id, providerId, sourceRecordId, rawPayload, rawTitle, rawDescription, rawLocation, rawStatus, rawDates, rawMetadata FROM raw_records WHERE ingestionRunId = ? AND isDeleted = 0`,
        [runId]
      );
      for (const row of rawRows.results || []) {
        if (!row.rawPayload) continue;
        const attrs = JSON.parse(row.rawPayload);
        const rawPayload = row.rawPayload;
        let hash = 0;
        for (let i = 0; i < rawPayload.length; i++) {
          const ch = rawPayload.charCodeAt(i);
          hash = (hash << 5) - hash + ch;
          hash = hash & hash;
        }
        const contentHash = Math.abs(hash).toString(16);
        const dupCheck = await d1Query(
          db,
          `SELECT canonicalId as id FROM ${targetTable} WHERE contentHash = ? OR rawData = ? LIMIT 1`,
          [contentHash, rawPayload]
        );
        if (dupCheck.results?.length > 0) {
          recordsSkipped++;
          continue;
        }
        const workClass = (w1 && w1.titleField && attrs[w1.titleField]) || attrs.workclass || attrs.permitclass || attrs.type || attrs.permit_type || attrs.APPTYPEALIAS || attrs.PROJECT_NAME;
        const workDesc = (w1 && w1.descField && attrs[w1.descField]) || attrs.proposedworkdescription || attrs.description || attrs.workdescription || attrs.comments || attrs.PROJECT_NAME;
        const title = row.rawTitle || (workClass && workDesc ? `${workClass}: ${workDesc}` : workClass || workDesc || "Building Permit");
        const description = row.rawDescription || workDesc || "";
        const address = row.rawLocation || attrs.siteaddress || attrs.address || attrs.fulladdress || attrs.location || attrs.PARCEL_ID || "";
        let lat = null;
        let lng = null;
        if (row.rawMetadata) {
          try {
            const meta = JSON.parse(row.rawMetadata);
            if (meta.geometry?.y) lat = String(meta.geometry.y);
            if (meta.geometry?.x) lng = String(meta.geometry.x);
          } catch {
          }
        }
        if (!lat) lat = attrs.latitude || attrs.lat || attrs.y || null;
        if (!lng) lng = attrs.longitude || attrs.lng || attrs.long || attrs.x || null;
        if (w1) {
          try {
            const g = row.rawMetadata ? JSON.parse(row.rawMetadata).geometry : null;
            let pts = [];
            if (g && g.paths) pts = g.paths.flat();
            else if (g && g.points) pts = g.points;
            else if (g && g.rings) pts = g.rings.flat();
            else if (g && g.x != null && g.y != null) pts = [[g.x, g.y]];
            if (pts.length) {
              const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length;
              const cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
              if (cx >= -90 && cx <= -70 && cy >= 30 && cy <= 40) { lng = String(cx); lat = String(cy); }
              else { lng = null; lat = null; }
            }
          } catch (e) {}
        }
        const appliedDateRaw = (w1 && w1.createdField && attrs[w1.createdField]) || attrs.applieddate || attrs.applied_date || attrs.dateapplied || attrs.SUBMITTED_DATE;
        const publishedAtMs = normalizeTimestampToMs(appliedDateRaw);
        let city = attrs.city || attrs.sitecity || attrs.jurisdiction || "";
        if (!city && address) {
          const match = address.match(/,\s*([A-Za-z\s]+),?\s*(?:NC|North Carolina|VA|Virginia|SC|South Carolina)?/i);
          if (match) city = match[1].trim();
        }
        let county = attrs.county || attrs.sitecounty || "";
        if (w1) county = (w1.countyField && attrs[w1.countyField]) || w1.county || county;
        let state = attrs.state || attrs.sitestate || "";
        if (w1) { state = w1.state || state; city = w1.city || city; }
        const zipCode = attrs.zip || attrs.zipcode || attrs.postalcode || attrs.sitezip || null;
        const providerName = w1 ? w1.providerName : "Raleigh Open Data";
        const canonicalId = `kev-${crypto.randomUUID()}`;
        const nowMs = Date.now();
        await d1Run(
          db,
          `INSERT INTO ${targetTable} (canonicalId, providerId, sourceRecordId, eventType, title, description, county, state, city, zipCode, lat, lng, address, publishedAt, ingestedAt, confidence, status, contentHash, rawData, dataSource, provenance, createdAt, syncedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [canonicalId, row.providerId, row.sourceRecordId || null, (w1 ? w1.eventType : "building_permit"), title, description, county, state, city, zipCode, lat, lng, address, publishedAtMs, nowMs, (w1 ? w1.confidence : 70), "active", contentHash, rawPayload, providerName, "LIVE", nowMs, nowMs]
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
        [now, runId, now, now, canonicalPro