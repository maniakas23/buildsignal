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
            queryDate: dateStr,
            recordsFound: features.length,
            inserted,
            skipped,
            watermark: now
          }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message, stack: e.stack }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/alerts/generate" && req.method === "POST") {
      try {
        const db = env2.DB;
        const body = await req.json().catch(() => ({}));
        const opportunityId = body.opportunityId;
        const userId = body.userId || 1;
        const orgId = body.organizationId || 1;
        if (!opportunityId) {
          response = new Response(JSON.stringify({ error: "opportunityId required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          const oppId = opportunityId.replace("opp-", "");
          const oppRes = await d1Query(db, "SELECT * FROM opportunities WHERE id = ? AND provenance = 'LIVE'", [oppId]);
          const opp = (oppRes.results || [])[0];
          if (!opp) {
            response = new Response(JSON.stringify({ error: "Opportunity not found" }), { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
          } else {
            const freshness = opp.freshness || "unknown";
            const isCurrent = freshness === "current" || freshness === "recent";
            const title = isCurrent ? "New Raleigh permit activity matched your watchlist" : "BuildSignal identified historical Raleigh development activity relevant to your watchlist";
            const reason = isCurrent ? "Current permit data indicates active development matching your saved area preferences." : "Historical permit records show development patterns in your area of interest.";
            const alertId = "alert-" + Math.random().toString(36).substring(2, 10);
            const now = Math.floor(Date.now() / 1e3);
            await d1Run(db, "INSERT INTO generated_alerts (alertId, opportunityId, organizationId, userId, title, reason, location, score, confidence, freshness, urgency, provenance, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [alertId, opportunityId, orgId, userId, title, reason, opp.location || "Wake, NC", opp.confidence_score || opp.score, "High", opp.freshness || "unknown", opp.urgency || "normal", opp.provenance || "LIVE", now]);
            response = new Response(JSON.stringify({ success: true, alertId, opportunityId, title, reason, freshness: opp.freshness, urgency: opp.urgency, provenance: opp.provenance, createdAt: now }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
          }
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message, stack: e.stack }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/alerts") {
      try {
        const db = env2.DB;
        const userId = url.searchParams.get("userId") || "1";
        const rows = await d1Query(db, "SELECT * FROM generated_alerts WHERE userId = ? ORDER BY createdAt DESC LIMIT 50", [userId]);
        response = new Response(JSON.stringify({ alerts: rows.results || [] }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/reports/generate" && req.method === "POST") {
      try {
        const db = env2.DB;
        const body = await req.json().catch(() => ({}));
        const opportunityId = body.opportunityId;
        const userId = body.userId || 1;
        const orgId = body.organizationId || 1;
        if (!opportunityId) {
          response = new Response(JSON.stringify({ error: "opportunityId required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          const oppRes = await d1Query(db, "SELECT * FROM opportunities WHERE id = ? AND provenance = 'LIVE'", [opportunityId.repl