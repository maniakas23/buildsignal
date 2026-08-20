earchParams.get("providerId");
        let sql = `SELECT providerId, eventType, eventDescription, runId, severity, details, createdAt FROM scheduler_activity_log`;
        const params = [];
        if (providerId) {
          sql += ` WHERE providerId = ?`;
          params.push(providerId);
        }
        sql += ` ORDER BY createdAt DESC LIMIT ?`;
        params.push(limit);
        const logs = await d1Query(db, sql, params);
        response = new Response(JSON.stringify({
          success: true,
          limit,
          providerId: providerId || null,
          activities: logs.results || []
        }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/scheduler/webpush" && req.method === "POST") {
      try {
        const body = await req.json().catch(() => ({}));
        const subscription = body.subscription;
        const userId = body.userId;
        const events = body.events || ["POLL_FAILED", "CIRCUIT_BREAKER_OPENED", "STALENESS_DETECTED"];
        if (!subscription || !subscription.endpoint) {
          response = new Response(JSON.stringify({ error: "subscription.endpoint is required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else if (!userId) {
          response = new Response(JSON.stringify({ error: "userId is required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          const db = env2.DB;
          const now = Math.floor(Date.now() / 1e3);
          await d1Run(
            db,
            `INSERT INTO webpush_subscriptions (endpoint, p256dh, auth, events, userId, active, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth, events = excluded.events, userId = excluded.userId, active = 1, updatedAt = excluded.updatedAt`,
            [subscription.endpoint, subscription.keys?.p256dh || "", subscription.keys?.auth || "", JSON.stringify(events), userId, 1, now, now]
          );
          response = new Response(JSON.stringify({ success: true, message: "Subscription saved", events }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/webpush/subscriptions" && req.method === "GET") {
      try {
        const userId = url.searchParams.get("userId");
        if (!userId) {
          response = new Response(JSON.stringify({ error: "userId required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          const db = env2.DB;
          const { results } = await d1Query(db, "SELECT endpoint, events, active, createdAt FROM webpush_subscriptions WHERE userId = ?", [userId]);
          response = new Response(JSON.stringify({ subscriptions: results || [] }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/webpush/unsubscribe" && req.method === "POST") {
      try {
        const body = await req.json().catch(() => ({}));
        const endpoint = body.endpoint;
        const userId = body.userId;
        if (!endpoint || !userId) {
          response = new Response(JSON.stringify({ error: "endpoint and userId required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          const db = env2.DB;
          await d1Run(db, "DELETE FROM webpush_subscriptions WHERE endpoint = ? AND userId = ?", [endpoint, userId]);
          response = new Response(JSON.stringify({ success: true, message: "Unsubscribed" }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
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
        let eventSql = "SEL