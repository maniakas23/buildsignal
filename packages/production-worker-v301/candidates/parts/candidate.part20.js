ers(origin, env2) } });
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/adapters/accela/fetch" && req.method === "POST") {
      try {
        const body = await req.json().catch(() => ({}));
        const jurisdiction = body.jurisdiction;
        const moduleName = body.module || "Building";
        const limit = Math.min(Math.max(body.limit || 50, 1), 500);
        if (!jurisdiction) {
          response = new Response(JSON.stringify({ error: "jurisdiction is required (e.g., 'wake-county-nc')" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          const accelaBaseUrls = {
            "wake-county-nc": "https://accelaapi.wakegov.com",
            "mecklenburg-nc": "https://api.mecknc.gov",
            "charleston-sc": "https://accela.charleston-sc.gov",
            "raleigh-nc": "https://services.raleighnc.gov/accela"
          };
          const baseUrl = accelaBaseUrls[jurisdiction];
          if (!baseUrl) {
            response = new Response(JSON.stringify({ error: "Unknown Accela jurisdiction", known: Object.keys(accelaBaseUrls) }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
          } else {
            const targetUrl = `${baseUrl}/apis/v4/records?module=${moduleName}&limit=${limit}`;
            const fetchRes = await fetch(targetUrl, {
              method: "GET",
              headers: { "Accept": "application/json", "User-Agent": "BuildSignal/1.6.0" }
            });
            const fetchText = await fetchRes.text();
            let fetchData;
            try {
              fetchData = JSON.parse(fetchText);
            } catch {
              fetchData = { raw: fetchText };
            }
            const records = Array.isArray(fetchData?.result) ? fetchData.result : Array.isArray(fetchData) ? fetchData : [];
            const normalized = records.map((r) => ({
              externalId: r.id || r.customId || r.parcelId || String(Math.random()).slice(2),
              sourcePermitId: r.customId || r.id,
              title: r.name || r.description || `${moduleName} Permit`,
              description: r.description || r.name || "",
              status: r.status?.value || r.status || "Unknown",
              address: r.address?.display || r.address || "",
              city: r.address?.city || jurisdiction.split("-")[0] || "",
              county: r.address?.county || "",
              state: r.address?.state?.value || r.address?.state || jurisdiction.split("-")[2]?.toUpperCase() || "",
              zip: r.address?.postalCode || "",
              projectType: r.type?.value || r.type || moduleName,
              estimatedValue: r.estimatedValue || null,
              applicant: r.applicant?.value || r.applicant || "",
              filedDate: r.filedDate || r.openedDate || r.date || null,
              issueDate: r.issuedDate || null,
              expirationDate: r.expirationDate || null,
              url: r.url || `${baseUrl}/apps/launcher/records/${r.id || r.customId}`,
              sourceType: "ACCELA",
              raw: JSON.stringify(r)
            }));
            response = new Response(JSON.stringify({
              success: true,
              jurisdiction,
              module: moduleName,
              endpoint: targetUrl,
              statusCode: fetchRes.status,
              recordsObserved: records.length,
              recordsNormalized: normalized.length,
              records: normalized.slice(0, limit)
            }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
          }
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/recommendations") {
      try {
        const db = env2.DB;
        const limit = parseInt(url.searchParams.get("limit") || "50");
        const offset = parseInt(url.searchParams.get("offset") || "0");
        const { results } = await d1Query(db, "SELECT id, targetProduct, jurisdiction, confidenceScore, summary, rationale, generatedAt FROM signalcore_recommendations WHERE provenance = 'LIVE' ORDER BY confidenceScore DESC LIMIT ? OFFSET ?", [limit, offset]);
        const countRes = await d1Query(db, "SELECT COUNT(*) as cnt FROM signalcore_recommendations WHERE provenance = 'LIVE'");
        response = new Response(JSON.stringify({ recommendations: results || [], total: countRes.results?.[0]?.cnt || 0, limit, offset }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/kestovar/intelligence") {
      try {
        const db = env2.DB;
        const county = url.searchParams.get("county");
        const state = url.searchParams.get("state");
        const limit = parseInt(url.searchParams.get("limit") || "50");
        let eventSql = "SELECT canonicalId, eventType, title, description, address, city, county, state, permitType, workClass, status, providerId, publishedAt, ingestedAt, lat, lng, contentHash FROM kestovar_canonical_events WHERE provenance = 'LIVE'";
        const eventParams = [];
        if (county) {
          eventSql += " AND county = ?";
          eventParams.push(county);
        }
        if (state) {
          eventSql += " AND state = ?";
          eventParams.push(state);
        }
        eventSql += " ORDER BY publishedAt DESC LIMIT ?";
        eventParams.push(limit);
        const events = await d1Query(db, eventSql, eventParams);
        let patternSql = "SELECT id, name, patternType, description, county, state, confidence, evidenceCount, impactScore, summary, recommendedAction, firstDetectedAt FROM signalcore_patterns WHERE provenance = 'LIVE'";
        const patternParams = [];
        if (county) {
          patternSql += " AND county = ?";
          patternParams.push(county);
        }
        if (state) {
          patternSql += " AND state = ?";
          patternParams.push(state);
        }
        patternSql += " ORDER BY confidence DESC LIMIT ?";
        patternParams.push(limit);
        const patterns = await d1Query(db, patternSql, patternParams);
        let oppSql = "SELECT id, title, description, county, state, confidence_score, created_at FROM opportunities WHERE provenance = 'LIVE'";
        const oppParams = [];
        if (county) {
          oppSql += " AND county = ?";
          oppParams.push(county);
        }
        if (state) {
          oppSql += " AND state = ?";
          oppParams.push(state);
        }
        oppSql += " ORDER BY confidence_score DESC LIMIT ?";
        oppParams.push(limit);
        const opportunities = await d1Query(db, oppSql, oppParams);
        response = new Response(JSON.stringify({
          canonicalEvents: events.results || [],
          patterns: patterns.results || [],
          opportunities: opportunities.results || [],
          meta: {
            generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
            version: "1.6.0",
            source: "kestovar_canonical_events",
            filters: { county, state, limit }
          }
        }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/jurisdictions") {
      try {
        const db = env2.DB;
        const { results } = await d1Query(db, "SELECT county, state, COUNT(*) as signalCount, COUNT(DISTINCT providerId) as providerCount, MIN(publishedAt) as earliest, MAX(publishedAt) as latest FROM kestovar_canonical_events WHERE provenance = 'LIVE' AND county IS NOT NULL AND county <> '' AND state IS NOT NULL AND state <> '' GROUP BY county, state ORDER BY signalCount DESC");
        response = new Response(JSON.stringify({ jurisdictions: results || [], count: (results || []).length }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/search/facets") {
      try {
        const db = env2.DB;
        const q = url.searchParams.get("q") || "";
        const searchTerm = q ? "%" + q + "%" : null;
        const whereClause = searchTerm ? "WHERE (title LIKE ? OR description LIKE ? OR address LIKE ? OR city LIKE ? OR county LIKE ? OR state LIKE ? OR permitType LIKE ? OR workClass LIKE ? OR eventType LIKE ? OR status LIKE ? OR providerId LIKE ?) AND provenance = 'LIVE'" : "WHERE provenance = 'LIVE'";
        const params = searchTerm ? [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm] : [];
        const [stateFacet, countyFacet, providerFacet, eventTypeFacet, permitTypeFacet, statusFacet] = await Promise.all([
          d1Query(db, `SELECT state, COUNT(*) as cnt FROM kestovar_canonical_events ${whereClause} AND state IS NOT NULL AND state <> '' GROUP BY state ORDER BY cnt DESC`, [...params]),
          d1Query(db, `SELECT county