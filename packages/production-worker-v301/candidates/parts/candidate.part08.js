       result = trpcError("Feature requests are temporarily disabled.", "NOT_IMPLEMENTED");
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
var WAVE1_PROVIDER_CONFIG = {
  "durham-nc-zoning-map-changes": { endpoint: "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Permits/FeatureServer/30/query", eventType: "rezoning_filed", providerName: "Durham City-County Planning", confidence: 75, county: "Durham", state: "NC", city: "Durham", titleField: "A_PROJECT_NAME", descField: "A_DESCRIPTION", statusField: "AppStatus", createdField: "A_DATE", countyField: null, addressField: null },
  "durham-nc-subdivisions": { endpoint: "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Permits/FeatureServer/28/query", eventType: "subdivision_application", providerName: "Durham City-County Planning", confidence: 75, county: "Durham", state: "NC", city: "Durham", titleField: "A_PROJECT_NAME", descField: "A_DESCRIPTION", statusField: "AppStatus", createdField: "A_DATE", countyField: null, addressField: null },
  "durham-nc-site-plans": { endpoint: "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Permits/FeatureServer/29/query", eventType: "site_plan_submitted", providerName: "Durham City-County Planning", confidence: 75, county: "Durham", state: "NC", city: "Durham", titleField: "A_PROJECT_NAME", descField: "A_DESCRIPTION", statusField: "AppStatus", createdField: "A_DATE", countyField: null, addressField: null },
  "durham-nc-annexations": { endpoint: "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Permits/FeatureServer/17/query", eventType: "annexation_filed", providerName: "Durham City-County Planning", confidence: 75, county: "Durham", state: "NC", city: "Durham", titleField: "A_PROJECT_NAME", descField: "A_DESCRIPTION", statusField: "AppStatus", createdField: "A_DATE", countyField: null, addressField: null },
  "durham-nc-development-cases": { endpoint: "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Permits/FeatureServer/20/query", eventType: "development_case", providerName: "Durham City-County Planning", confidence: 70, county: "Durham", state: "NC", city: "Durham", titleField: "A_PROJECT_NAME", descField: "A_DESCRIPTION", statusField: "AppStatus", createdField: "A_DATE", countyField: null, addressField: null },
  "durham-nc-active-permits": { endpoint: "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Permits/FeatureServer/13/query", eventType: "building_permit", providerName: "Durham City-County Inspections", confidence: 70, county: "Durham", state: "NC", city: "Durham", titleField: "P_Type", descField: "P_Descript", statusField: "P_Status", createdField: null, countyField: null, addressField: null },
  "scdot-programmed-projects": { endpoint: "https://services1.arcgis.com/VaY7cY9pvUYUP1Lf/arcgis/rest/services/AllProgrammedProjects/FeatureServer/0/query", eventType: "programmed_highway_project", providerName: "SCDOT Programmed Projects", confidence: 75, county: "", state: "SC", city: "", titleField: "ProjectNam", descField: "ProjectDes", statusField: "ProjectAct", createdField: null, countyField: "COUNTY_NAM", addressField: null },
  "ncdot-stip-points": { endpoint: "https://gis11.services.ncdot.gov/arcgis/rest/services/NCDOT_STIP/MapServer/0/query", eventType: "funded_transportation_project", providerName: "NCDOT STIP", confidence: 75, county: "", state: "NC", city: "", titleField: "TIP", descField: "Description", statusField: null, createdField: null, countyField: "Counties", addressField: null },
  "ncdot-stip-lines": { endpoint: "https://gis11.services.ncdot.gov/arcgis/rest/services/NCDOT_STIP/MapServer/1/query", eventType: "funded_transportation_project", providerName: "NCDOT STIP", confidence: 75, county: "", state: "NC", city: "", titleField: "TIP", descField: "Description", statusField: null, createdField: null, countyField: "Counties", addressField: null }
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
    const w1 = WAVE1_PROVIDER_CONFIG[canonicalProviderId] || null;
    const targetTable = w1 ? "kestovar_canonical_events_shadow" : "kestovar_canonical_events";
  try {
    let endpoint = (w1 && w1.endpoint) || KNOWN_ENDPOINTS[providerId];
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
      const rawTitle = String((w1 && w1.titleField && attrs[w1.titleField]) || attrs.workclass || attrs.permitclass || attrs.type || attrs.permit_type || attrs.APPTYPEALIAS || attrs.PROJECT_NAME || `Permit ${attrs.permitnum || attrs.permitnumber || attrs.id || attrs.objectid || attrs.RECORDID || "unknown"}`);
      const rawDescription = String((w1 && w1.descField && attrs[w1.descField]) || attrs.proposedworkdescription || attrs.description || attrs.workdescription || attrs.comments || attrs.PROJECT_NAME || "");
      const rawLocation = String((w1 && w1.addressField && attrs[w1.addressField]) || attrs.siteaddress || attrs.address || attrs.fulladdress || 