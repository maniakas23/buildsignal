rsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/freshness") {
      try {
        const db = env2.DB;
        const now = Math.floor(Date.now() / 1e3);
        const liveCount = await d1Query(db, "SELECT COUNT(*) as count FROM kestovar_canonical_events WHERE provenance = 'LIVE'");
        const seedCount = await d1Query(db, "SELECT COUNT(*) as count FROM kestovar_canonical_events WHERE provenance = 'SEED'");
        const newestLive = await d1Query(db, "SELECT MAX(publishedAt) as newest FROM kestovar_canonical_events WHERE provenance = 'LIVE'");
        const oldestLive = await d1Query(db, "SELECT MIN(publishedAt) as oldest FROM kestovar_canonical_events WHERE provenance = 'LIVE'");
        const providerState = await d1Query(db, "SELECT id, providerName, recordsIngested, updatedAt, metadata FROM provider_registry WHERE recordsIngested > 0 OR id = 'wake-county-permits'");
        const liveTotal = liveCount.results?.[0]?.count || 0;
        const newest = newestLive.results?.[0]?.newest || 0;
        const oldest = oldestLive.results?.[0]?.oldest || 0;
        const ageSpan = newest - oldest;
        let systemFreshness = "unknown";
        if (newest > now - 86400) systemFreshness = "current";
        else if (newest > now - 604800) systemFreshness = "recent";
        else if (newest > now - 2592e3) systemFreshness = "stale";
        else systemFreshness = "archived";
        response = new Response(JSON.stringify({
          now,
          systemFreshness,
          summary: { liveRecords: liveTotal, seedRecords: seedCount.results?.[0]?.count || 0, newestRecord: newest, oldestRecord: oldest, ageSpanDays: Math.round(ageSpan / 86400) },
          providers: providerState.results || [],
          freshnessRules: { current: "< 24 hours", recent: "< 7 days", stale: "< 30 days", archived: "> 30 days" }
        }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message, stack: e.stack }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/ingest/test-source") {
      try {
        const testResp = await fetch("https://maps.wake.gov/arcgis/rest/services/Inspections/Building_Permits/MapServer/0?f=pjson", { cf: { cacheTtl: 0 } });
        const testBody = await testResp.text();
        response = new Response(JSON.stringify({
          sourceReachable: testResp.ok,
          status: testResp.status,
          bodyPreview: testBody.substring(0, 500),
          source: "Wake County ArcGIS"
        }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ sourceReachable: false, error: e.message }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/ingest/current-sample") {
      try {
        const infoResp = await fetch("https://maps.wake.gov/arcgis/rest/services/Inspections/Building_Permits/MapServer/0?f=pjson", { cf: { cacheTtl: 0 } });
        const infoData = await infoResp.json();
        const dateFields = (infoData.fields || []).filter((f) => f.type === "esriFieldTypeDate").map((f) => f.name);
        const thirtyDaysAgo = /* @__PURE__ */ new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dateStr = thirtyDaysAgo.toISOString().split("T")[0];
        let queryUrl = "https://maps.wake.gov/arcgis/rest/services/Inspections/Building_Permits/MapServer/0/query?where=ISSUE_DATE%3E%3Ddate%27" + dateStr + "%27&outFields=*&outSR=4326&resultRecordCount=20&orderByFields=ISSUE_DATE+DESC&f=json";
        let apiResp = await fetch(queryUrl, { cf: { cacheTtl: 0 } });
        let apiData = await apiResp.json();
        if ((apiData.features || []).length === 0) {
          queryUrl = "https://maps.wake.gov/arcgis/rest/services/Inspections/Building_Permits/MapServer/0/query?where=APPLICATION_DATE%3E%3Ddate%27" + dateStr + "%27&outFields=*&outSR=4326&resultRecordCount=20&orderByFields=APPLICATION_DATE+DESC&f=json";
          apiResp = await fetch(queryUrl, { cf: { cacheTtl: 0 } });
          apiData = await apiResp.json();
        }
        const features = apiData.features || [];
        const records = features.map((f) => {
          const a = f.attributes;
          return {
            id: a.PERMIT_NUMBER || a.OBJECTID,
            description: a.DESCRIPTION,
            issueDate: a.ISSUE_DATE,
            appDate: a.APPLICATION_DATE,
            status: a.PERMIT_STATUS,
            workClass: a.WORK_CLASS,
            permitType: a.PERMIT_TYPE,
            address: a.MAILING_ADDRESS,
            city: a.MAILING_CITY,
            state: a.MAILING_STATE,
            zip: a.MAILING_POSTAL_CODE,
            district: a.DISTRICT,
            x: f.geometry?.x,
            y: f.geometry?.y
          };
        });
        response = new Response(JSON.stringify({
          source: "Wake County ArcGIS",
          layerName: infoData.name,
          description: infoData.description,
          dateFields,
          queryDate: dateStr,
          recordCount: records.length,
          records
        }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message, stack: e.stack }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/ingest/wake-county" && req.method === "POST") {
      try {
        const db = env2.DB;
        const body = await req.json().catch(() => ({}));
        const dryRun = body.dryRun === true;
        const daysBack = body.daysBack || 30;
        const providerRes = await d1Query(db, "SELECT id, metadata FROM provider_registry WHERE id = ?", ["wake-county-permits"]);
        const provider = (providerRes.results || [])[0];
        let watermark = null;
        try {
          const meta = JSON.parse(provider?.metadata || "{}");
          watermark = meta.lastIngestionWatermark;
        } catch (e) {
        }
        const cutoffDate = /* @__PURE__ */ new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysBack);
        const dateStr = cutoffDate.toISOString().split("T")[0];
        const queryUrl = "https://maps.wake.gov/arcgis/rest/services/Inspections/Building_Permits/MapServer/0/query?where=ISSUE_DATE%3E%3Ddate%27" + dateStr + "%27&outFields=*&outSR=4326&resultRecordCount=100&orderByFields=ISSUE_DATE+DESC&f=json";
        const apiResp = await fetch(queryUrl, { cf: { cacheTtl: 0 } });
        const apiData = await apiResp.json();
        const features = apiData.features || [];
        if (dryRun) {
          response = new Response(JSON.stringify({
            dryRun: true,
            watermark,
            queryDate: dateStr,
            recordsFound: features.length,
            sample: features.slice(0, 3).map((f) => f.attributes.PERMIT_NUMBER)
          }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          let inserted = 0;
          let skipped = 0;
          const now = Math.floor(Date.now() / 1e3);
          for (const f of features) {
            const a = f.attributes;
            const permitId = a.PERMIT_NUMBER || String(a.OBJECTID);
            const contentStr = JSON.stringify(a);
            const contentHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(contentStr)).then((buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join(""));
            const dupCheck = await d1Query(db, "SELECT canonicalId as id FROM kestovar_canonical_events WHERE contentHash = ? AND provenance = 'LIVE'", [contentHash]);
            if ((dupCheck.results || []).length > 0) {
              skipped++;
              continue;
            }
            const issueTs = a.ISSUE_DATE ? Math.floor(a.ISSUE_DATE / 1e3) : null;
            const batchCanonicalId = `kev-${crypto.randomUUID()}`;
            await d1Run(db, `
              INSERT INTO kestovar_canonical_events 
              (canonicalId, providerId, sourceRecordId, eventType, title, description, county, state, city, zipCode, address, publishedAt, ingestedAt, confidence, status, contentHash, rawData, provenance, dataSource)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              batchCanonicalId,
              permitId,
              permitId,
              a.WORK_CLASS || a.PERMIT_TYPE || "building_permit",
              a.DESCRIPTION || permitId,
              a.DESCRIPTION || "",
              "Wake",
              "NC",
              a.MAILING_CITY || "Raleigh",
              a.MAILING_POSTAL_CODE || "",
              a.MAILING_ADDRESS || "",
              issueTs,
              now,
              85,
              a.PERMIT_STATUS || "Issued",
              contentHash,
              JSON.stringify(a),
              "LIVE"
            ]);
            inserted++;
          }
          const newMetadata = JSON.stringify({ lastIngestionWatermark: now, lastIngestionDate: (/* @__PURE__ */ new Date()).toISOString() });
          await d1Run(db, "UPDATE provider_registry SET recordsIngested = recordsIngested + ?, updatedAt = ?, metadata = ? WHERE id = ?", [inserted, now, newMetadata, "wake-county-permits"]);
          await d1Run(db, "UPDATE provider_registry SET updatedAt = ?, metadata = ? WHERE id = ?", [now, newMetadata, "raleigh-permits"]);
          response = new Response(JSON.stringify({
            success: true,
            source: "Wake County ArcGIS",
            que