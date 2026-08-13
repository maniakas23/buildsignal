async function runNormalization(db, env) {
  console.log("[scheduled] starting normalization run");
  const now = Math.floor(Date.now() / 1000);
  let recordsNormalized = 0;
  let lastEventId = 0;

  try {
    const { results: rawEvents } = await d1Query(db, "SELECT * FROM raw_provider_events WHERE processedAt IS NULL ORDER BY id ASC LIMIT 100");
    for (const row of (rawEvents || [])) {
      try {
        const providerName = row.providerName || "unknown";
        const rawPayload = row.rawData || "{}";
        let parsed;
        try { parsed = JSON.parse(rawPayload); } catch { parsed = {}; }
        const title = (parsed.permit_description || parsed.project_name || parsed.work_description || parsed.DESCRIPTION || "Unknown Permit").toString().substring(0, 200);
        const description = (parsed.proposed_use || parsed.notes || parsed.comments || "").toString().substring(0, 500);
        const county = (parsed.county || parsed.COUNTY || parsed.jurisdiction || "Unknown").toString().substring(0, 100);
        const state = (parsed.state || parsed.STATE || parsed.jurisdiction_state || "NC").toString().substring(0, 10);
        const city = (parsed.city || parsed.CITY || parsed.jurisdiction_city || "").toString().substring(0, 100);
        const zipCode = (parsed.zip || parsed.ZIP || parsed.postal_code || "").toString().substring(0, 20);
        const address = (parsed.original_address || parsed.address || parsed.MAILING_ADDRESS || "").toString().substring(0, 300);
        const lat = parsed.latitude || parsed.lat || parsed.latitude_perm || "";
        const lng = parsed.longitude || parsed.lng || parsed.longitude_perm || "";
        const publishedAt = parsed.published_at || parsed.issued_date || parsed.applied_date || parsed.issueddate || now;
        const publishedAtSeconds = typeof publishedAt === "string" ? Math.floor(new Date(publishedAt).getTime() / 1000) : (publishedAt || now);
        const contentHash = await hashString(rawPayload);

        const dupCheck = await d1Query(db, `SELECT canonicalId FROM kestovar_canonical_events WHERE contentHash = ? OR rawData = ? LIMIT 1`, [contentHash, rawPayload]);
        if ((dupCheck.results || []).length > 0) {
          await d1Run(db, "UPDATE raw_provider_events SET processedAt = ?, dedupStatus = 'duplicate' WHERE id = ?", [now, row.id]);
          continue;
        }

        // ─── CANONICAL INSERT ONLY ───
        const canonicalId = "kev-" + crypto.randomUUID();
        await d1Run(db,
          `INSERT INTO kestovar_canonical_events (canonicalId, providerId, sourceRecordId, eventType, title, description, county, state, city, zipCode, lat, lng, address, publishedAt, ingestedAt, confidence, status, contentHash, rawData, provenance, statusCanonical, lineageVersion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [canonicalId, row.providerId, row.sourceRecordId || null, "building_permit", title, description, county, state, city, zipCode, lat, lng, address, publishedAtSeconds, now, 70, "active", contentHash, rawPayload, "LIVE", "active", 1]
        );
        recordsNormalized++;
        if (canonicalId) lastEventId = canonicalId;

        await d1Run(db, "UPDATE raw_provider_events SET processedAt = ?, dedupStatus = 'unique' WHERE id = ?", [now, row.id]);
      } catch (e) {
        console.error("[normalization] row error", row.id, e.message);
      }
    }
  } catch (e) {
    console.error("[normalization] error", e.message);
  }

  console.log("[scheduled] normalization complete, records:", recordsNormalized);
}

async function runPatternDetection(db, env) {
  console.log("[scheduled] starting pattern detection");
  try {
    const { results: events } = await d1Query(db, "SELECT county, state, eventType, COUNT(*) as count FROM kestovar_canonical_events WHERE publishedAt > ? GROUP BY county, state, eventType", [Math.floor(Date.now() / 1000) - 86400 * 7]);
    for (const e of (events || [])) {
      if (e.count >= 5) {
        const existing = await d1Query(db, "SELECT id FROM signalcore_patterns WHERE county = ? AND state = ? AND patternType = ?", [e.county, e.state, e.eventType]);
        if ((existing.results || []).length === 0) {
          await d1Run(db, "INSERT INTO signalcore_patterns (patternType, county, state, confidence, firstDetectedAt, name, description) VALUES (?, ?, ?, ?, ?, ?, ?)", [e.eventType, e.county, e.state, Math.min(95, 50 + e.count * 5), Math.floor(Date.now() / 1000), e.county + " " + e.eventType + " surge", e.count + " " + e.eventType + " permits in 7 days"]);
        }
      }
    }
  } catch (e) {
    console.error("[pattern] error", e.message);
  }
  console.log("[scheduled] pattern detection complete");
}

async function runIntelligence(db, env) {
  console.log("[scheduled] starting intelligence run");
  try {
    const { results: patterns } = await d1Query(db, "SELECT * FROM signalcore_patterns WHERE confidence >= 70 AND notified = 0 LIMIT 10");
    for (const pattern of (patterns || [])) {
      await d1Run(db, "INSERT INTO signalcore_recommendations (targetProduct, jurisdiction, confidenceScore, summary, rationale, userId, generatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)", ["construction intelligence", pattern.county + ", " + pattern.state, pattern.confidence, pattern.name, pattern.description, 1, Math.floor(Date.now() / 1000)]);
      await d1Run(db, "UPDATE signalcore_patterns SET notified = 1 WHERE id = ?", [pattern.id]);
    }
  } catch (e) {
    console.error("[intelligence] error", e.message);
  }
  console.log("[scheduled] intelligence complete");
}

async function runStaleCheck(db, env) {
  try {
    const now = Math.floor(Date.now() / 1000);
    const { results } = await d1Query(db, "SELECT MAX(publishedAt) as newest FROM kestovar_canonical_events WHERE provenance = 'LIVE'");
    const newest = (results || [])[0]?.newest || 0;
    const hoursOld = Math.round((now - newest) / 3600);
    if (hoursOld > 24) {
      console.error("[stale-check] CRITICAL: No new events in", hoursOld, "hours");
    } else if (hoursOld > 6) {
      console.warn("[stale-check] WARNING: No new events in", hoursOld, "hours");
    } else {
      console.log("[stale-check] OK: newest event is", hoursOld, "hours old");
    }
  } catch (e) {
    console.error("[stale-check] error", e.message);
  }
}

async function runWakeCountyIngestion(db, env) {
  console.log("[scheduled] Wake County ingestion starting");
  const now = Math.floor(Date.now() / 1000);
  let recordsInserted = 0;

  try {
    const url = "https://data-wake.opendata.arcgis.com/api/search/v1";
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!res.ok) throw new Error("Wake County API error: " + res.status);
    const data = await res.json();
    const results = data.results || data.features || [];
    for (const a of results) {
      try {
        const permitId = (a.PERMIT_NUM || a.permitnum || a.id || a.OBJECTID || "").toString();
        if (!permitId) continue;
        const rawPayload = JSON.stringify(a);
        const contentHash = await hashString(rawPayload);
        const dupCheck = await d1Query(db, "SELECT canonicalId FROM kestovar_canonical_events WHERE contentHash = ? AND provenance = 'LIVE'", [contentHash]);
        if ((dupCheck.results || []).length > 0) continue;

        const issueDate = a.ISSUE_DATE || a.issueddate || a.ISSUED_DATE;
        const issueTs = issueDate ? Math.floor(new Date(issueDate).getTime() / 1000) : now;

        const canonicalId = "kev-" + crypto.randomUUID();
        await d1Run(db, `
          INSERT INTO kestovar_canonical_events
          (canonicalId, providerId, sourceRecordId, eventType, title, description, county, state, city, zipCode, address, publishedAt, ingestedAt, confidence, status, contentHash, rawData, provenance, statusCanonical, lineageVersion)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          canonicalId,
          'wake-county-canonical',
          permitId,
          a.WORK_CLASS || a.PERMIT_TYPE || 'building_permit',
          a.DESCRIPTION || permitId,
          a.DESCRIPTION || '',
          'Wake',
          'NC',
          a.MAILING_CITY || 'Raleigh',
          a.MAILING_POSTAL_CODE || '',
          a.MAILING_ADDRESS || '',
          issueTs,
          now,
          85,
          a.PERMIT_STATUS || 'Issued',
          contentHash,
          JSON.stringify(a),
          'LIVE',
          'active',
          1
        ]);
        recordsInserted++;
      } catch (e) {
        console.error("[wake] record error", e.message);
      }
    }
  } catch (e) {
    console.error("[wake] ingestion error", e.message);
  }

  console.log("[scheduled] Wake County ingestion complete, inserted:", recordsInserted);
}

async function hashString(str) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "*";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return new Response(JSON.stringify({ status: "ok", version: "1.5.0", build: "131", timestamp: new Date().toISOString(), environment: "production", features: ["trpc", "d1", "auth", "stripe", "billing", "webhooks", "county", "pattern", "search", "watchlist", "notification", "brief", "analytics", "recommendation", "provider", "rateLimiting", "passwordHashing", "securityHeaders", "canonicalEvents", "staleCheck", "intelligence"] }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
    }

    if (url.pathname === "/api/ingest" && request.method === "POST") {
      try {
        const db = env.DB;
        const body = await request.json().catch(() => ({}));
        const { provider, events } = body;
        if (!provider || !events || !Array.isArray(events)) {
          return new Response(JSON.stringify({ error: "Provider and events array required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
        }
        const now = Math.floor(Date.now() / 1000);
        let inserted = 0;
        for (const event of events) {
          try {
            const rawPayload = JSON.stringify(event);
            const contentHash = await hashString(rawPayload);
            const dupCheck = await d1Query(db, "SELECT canonicalId FROM kestovar_canonical_events WHERE contentHash = ? AND provenance = 'LIVE'", [contentHash]);
            if ((dupCheck.results || []).length > 0) continue;
            const canonicalId = "kev-" + crypto.randomUUID();
            await d1Run(db, "INSERT INTO kestovar_canonical_events (canonicalId, providerId, sourceRecordId, eventType, title, description, county, state, city, address, publishedAt, ingestedAt, confidence, status, contentHash, rawData, provenance, statusCanonical, lineageVersion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [canonicalId, provider, event.id || null, event.type || "building_permit", (event.title || "").substring(0, 200), (event.description || "").substring(0, 500), event.county || "", event.state || "", event.city || "", event.address || "", event.publishedAt || now, now, event.confidence || 70, event.status || "active", contentHash, rawPayload, "LIVE", "active", 1]);
            inserted++;
          } catch (e) {
            console.error("[ingest] event error", e.message);
          }
        }
        return new Response(JSON.stringify({ success: true, inserted, provider }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
      }
    }

    return handleRequest(request, env);
  },
  async scheduled(event, env, ctx) {
    const db = env.DB;
    await runIngestion(db, env);
    await runNormalization(db, env);
    await runWakeCountyIngestion(db, env);
    await runPatternDetection(db, env);
    await runIntelligence(db, env);
    await runStaleCheck(db, env);
  },
};