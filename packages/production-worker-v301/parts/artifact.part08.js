esult = trpcError("Feature requests are temporarily disabled.", "NOT_IMPLEMENTED");
        break;
      }
      case "roadmap.vote": {
        if (!jwtPayload) { result = trpcError("Unauthorized", "UNAUTHORIZED"); break; }
        result = trpcError("Voting is temporarily disabled.", "NOT_IMPLEMENTED");
        break;
      }
      case "stripe.markAllRead": {
        if (!jwtPayload) { result = trpcError("Unauthorized", "UNAUTHORIZED"); break; }
        result = trpcResult({ success: true, message: "Billing notifications marked as read." });
        break;
      }
      // === PHASE 10: REPORT ROUTING ===
      case "report.generate": {
        if (!jwtPayload) { result = trpcError("Unauthorized", "UNAUTHORIZED"); break; }
        result = await handleReportGenerate(db, jwtPayload.sub, input);
        break;
      }
      case "report.list": {
        if (!jwtPayload) { result = trpcError("Unauthorized", "UNAUTHORIZED"); break; }
        result = await handleReportList(db, jwtPayload.sub);
        break;
      }
      case "report.get": {
        if (!jwtPayload) { result = trpcError("Unauthorized", "UNAUTHORIZED"); break; }
        result = await handleReportGet(db, jwtPayload.sub, input);
        break;
      }
default:
        result = trpcError("Not found: " + op, "NOT_FOUND");
    }
    results.push(result);
  }
  return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
}
__name(handleTRPCBatch, "handleTRPCBatch");
__name2(handleTRPCBatch, "handleTRPCBatch");
var KNOWN_ENDPOINTS = {
  "raleigh-permits": "https://services.arcgis.com/v400IkDOw1ad7Yad/arcgis/rest/services/Building_Permits_Pending/FeatureServer/0/query",
  "raleigh_building_permits": "https://services.arcgis.com/v400IkDOw1ad7Yad/arcgis/rest/services/Building_Permits_Pending/FeatureServer/0/query",
  "wake-county-permits": "https://maps.wake.gov/arcgis/rest/services/Inspections/Building_Permits/MapServer/0/query",
  "wake_county_building_permits": "https://maps.wake.gov/arcgis/rest/services/Inspections/Building_Permits/MapServer/0/query",
  "mecklenburg-nc-building_permits": "https://gis.mecknc.gov/arcgis/rest/services/CodeEnforcement/BuildingPermits/MapServer/0/query",
  "mecklenburg_nc_building_permits": "https://gis.mecknc.gov/arcgis/rest/services/CodeEnforcement/BuildingPermits/MapServer/0/query",
  "fairfax-va-building_permits": "https://www.fairfaxcounty.gov/gispub1/rest/services/LDS/DevelopmentTracker/MapServer/5/query",
  "fairfax_va_building_permits": "https://www.fairfaxcounty.gov/gispub1/rest/services/LDS/DevelopmentTracker/MapServer/5/query"
};
var providerIdMap = {
  "raleigh_building_permits": "raleigh-permits",
  "wake_county_building_permits": "wake-county-permits",
  "mecklenburg_nc_building_permits": "mecklenburg-nc-building_permits",
  "fairfax_va_building_permits": "fairfax-va-building_permits"
};
async function executeIngestionRun(db, providerId, limit, triggerType) {
  const overallStart = Date.now();
  let runId = 0;
  let recordsObserved = 0;
  let recordsCreated = 0;
  let recordsNormalized = 0;
  let recordsSkipped = 0;
  let fetchError = null;
  let fetchLatency = 0;
  let parseLatency = 0;
  let resolveLatency = 0;
  const canonicalProviderId = providerIdMap[providerId] || providerId;
  try {
    let endpoint = KNOWN_ENDPOINTS[providerId];
    if (!endpoint) {
      const rows = await d1Query(db, "SELECT apiEndpoint FROM provider_registry WHERE providerId = ? LIMIT 1", [canonicalProviderId]);
      if (rows.results?.[0]?.apiEndpoint) {
        endpoint = rows.results[0].apiEndpoint;
      }
    }
    if (!endpoint) {
      throw new Error(`No endpoint configured for providerId: ${providerId}`);
    }
    const now = Math.floor(Date.now() / 1e3);
    const runResult = await d1Run(
      db,
      `INSERT INTO ingestion_runs (providerId, startedAt, status, triggerType) VALUES (?, ?, ?, ?)`,
      [providerId, now, "running", triggerType]
    );
    runId = runResult.meta?.last_row_id || runResult.lastRowId || 0;
    const params = new URLSearchParams({
      where: "1=1",
      outFields: "*",
      outSR: "4326",
      f: "json",
      resultRecordCount: String(limit)
    });
    const fetchStart = Date.now();
    const res = await fetch(`${endpoint}?${params.toString()}`, {
      method: "GET",
      headers: { Accept: "application/json" }
    });
    fetchLatency = Date.now() - fetchStart;
    if (!res.ok) {
      throw new Error(`ArcGIS HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    if (data.error) {
      throw new Error(`ArcGIS Error ${data.error.code}: ${data.error.message}`);
    }
    const features = data.features || [];
    recordsObserved = features.length;
    const parseStart = Date.now();
    for (const feature of features) {
      const attrs = feature.attributes || {};
      const rawPayload = JSON.stringify(attrs);
      let hash = 0;
      for (let i = 0; i < rawPayload.length; i++) {
        const ch = rawPayload.charCodeAt(i);
        hash = (hash << 5) - hash + ch;
        hash = hash & hash;
      }
      const contentHash = Math.abs(hash).toString(16);
      const rawTitle = String(attrs.workclass || attrs.permitclass || attrs.type || attrs.permit_type || attrs.APPTYPEALIAS || attrs.PROJECT_NAME || `Permit ${attrs.permitnum || attrs.permitnumber || attrs.id || attrs.objectid || attrs.RECORDID || "unknown"}`);
      const rawDescription = String(attrs.proposedworkdescription || attrs.description || attrs.workdescription || attrs.comments || attrs.PROJECT_NAME || "");
      const rawLocation = String(attrs.siteaddress || attrs.address || attrs.fulladdress || attrs.location || attrs.PARCEL_ID || "");
      const rawStatus = String(attrs.status || attrs.permitstatus || attrs.permit_status || attrs.RECORD_STATUS || "");
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
        `INSERT INTO raw_records (providerId, sourceRecordId, sourceUrl, observedAt, ingestedAt, rawPayload, rawTitle, rawDescription, rawLocation, rawStatus, rawDates, ingestionRunId, provenance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [canonicalProviderId, sourceRecordId, endpoint, now, now, rawPayload, rawTitle, rawDescription, rawLocation, rawStatus, rawDates, runId, "LIVE"]
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
          `SELECT canonicalId as id FROM kestovar_canonical_events WHERE contentHash = ? OR rawData = ? LIMIT 1`,
          [contentHash, rawPayload]
        );
        if (dupCheck.results?.length > 0) {
          recordsSkipped++;
          continue;
        }
        const workClass = attrs.workclass || attrs.permitclass || attrs.type || attrs.permit_type || attrs.APPTYPEALIAS || attrs.PROJECT_NAME;
        const workDesc = attrs.proposedworkdescription || attrs.description || attrs.workdescription || attrs.comments || attrs.PROJECT_NAME;
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
        const appliedDateRaw = attrs.applieddate || attrs.applied_date || attrs.dateapplied || attrs.SUBMITTED_DATE;
        const publishedAtMs = normalizeTimestampToMs(appliedDateRaw);
        let city = attrs.city || attrs.sitecity || attrs.jurisdiction || "";
        if (!city && address) {
          const match = address.match(/,\s*([A-Z