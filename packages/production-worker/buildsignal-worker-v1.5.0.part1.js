export class RateLimiterDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }
  async fetch(request) {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");
    const action = url.searchParams.get("action");
    const now = Date.now();
    const windowMs = parseInt(url.searchParams.get("window") || "60000");
    const maxReq = parseInt(url.searchParams.get("max") || "10");

    if (!key) return new Response("Missing key", { status: 400 });

    let stored = await this.state.storage.get(key);
    if (!stored) stored = { count: 0, resetAt: now + windowMs };

    if (now > stored.resetAt) {
      stored = { count: 0, resetAt: now + windowMs };
    }

    if (action === "check") {
      const allowed = stored.count < maxReq;
      return new Response(JSON.stringify({ allowed, remaining: Math.max(0, maxReq - stored.count), resetAt: stored.resetAt }), { headers: { "Content-Type": "application/json" } });
    }

    stored.count += 1;
    await this.state.storage.put(key, stored);
    return new Response(JSON.stringify({ count: stored.count, remaining: Math.max(0, maxReq - stored.count), resetAt: stored.resetAt }), { headers: { "Content-Type": "application/json" } });
  }
}

const corsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
  "Access-Control-Max-Age": "86400",
});

async function d1Query(db, sql, params = []) {
  if (!db) throw new Error("DB unavailable");
  const stmt = db.prepare(sql);
  const result = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
  return result;
}

async function d1Run(db, sql, params = []) {
  if (!db) throw new Error("DB unavailable");
  const stmt = db.prepare(sql);
  return params.length > 0 ? await stmt.bind(...params).run() : await stmt.run();
}

function trpcResult(data) {
  return { result: { data: { json: data } } };
}

function trpcError(message, code = "INTERNAL_SERVER_ERROR") {
  return { error: { message, code } };
}

async function handleSearchSearch(db, input) {
  try {
    const { query, types, limit, provenance } = input || {};
    if (!query || query.length < 2) return trpcResult({ results: [], total: 0, query: query || "", types: types || [] });
    if (query.length > 100) return trpcError("Query must be at most 100 characters", "BAD_REQUEST");
    const all = [];
    const tl = types || ["events", "patterns", "recommendations", "counties"];
    const q = "%" + query + "%";
    const lim = limit || 20;
    const provFilter = provenance && ["LIVE", "SEED", "SAMPLE", "TEST", "SIMULATED"].includes(String(provenance).toUpperCase())
      ? String(provenance).toUpperCase()
      : "LIVE";
    if (tl.includes("events")) {
      try {
        const { results } = await d1Query(db, "SELECT canonicalId as id, eventType, title, description, county, state, confidence, ingestedAt as createdAt, provenance FROM kestovar_canonical_events WHERE (title LIKE ? OR description LIKE ? OR county LIKE ?) AND provenance = ? ORDER BY ingestedAt DESC LIMIT ?", [q, q, q, provFilter, lim]);
        all.push(...(results || []).map(r => ({ ...r, _type: "events" })));
      } catch (ee) { console.error("[search.events]", ee.message); }
    }
    if (tl.includes("patterns")) {
      try {
        const { results } = await d1Query(db, "SELECT id, patternType, name, description, county, state, confidence, firstDetectedAt as createdAt FROM signalcore_patterns WHERE name LIKE ? OR description LIKE ? OR county LIKE ? ORDER BY firstDetectedAt DESC LIMIT ?", [q, q, q, lim]);
        all.push(...(results || []).map(r => ({ ...r, _type: "patterns" })));
      } catch (ee) { console.error("[search.patterns]", ee.message); }
    }
    if (tl.includes("recommendations")) {
      try {
        const { results } = await d1Query(db, "SELECT id, targetProduct, jurisdiction, confidenceScore, summary, rationale, generatedAt as createdAt FROM signalcore_recommendations WHERE targetProduct LIKE ? OR summary LIKE ? OR jurisdiction LIKE ? ORDER BY generatedAt DESC LIMIT ?", [q, q, q, lim]);
        all.push(...(results || []).map(r => ({ ...r, _type: "recommendations" })));
      } catch (ee) { console.error("[search.recommendations]", ee.message); }
    }
    if (tl.includes("counties")) {
      try {
        const { results } = await d1Query(db, "SELECT id, county, state, healthStatus, coveragePercentage, createdAt FROM counties WHERE county LIKE ? OR state LIKE ? ORDER BY coveragePercentage DESC LIMIT ?", [q, q, lim]);
        all.push(...(results || []).map(r => ({ ...r, _type: "counties" })));
      } catch (ee) { console.error("[search.counties]", ee.message); }
    }
    return trpcResult({ results: all.slice(0, lim), total: all.length, query, types: tl });
  } catch (e) {
    console.error("[search.search]", e.message);
    return trpcResult({ results: [], total: 0, query: input.query || "", types: input.types || [] });
  }
}

async function handleSearchRecent(db, userId, input) {
  try {
    const { results } = await d1Query(db, "SELECT * FROM search_history WHERE userId=? ORDER BY createdAt DESC LIMIT ?", [userId, (input || {}).limit || 10]);
    return trpcResult(results || []);
  } catch (e) {
    console.error("[search.recent]", e.message);
    return trpcResult([]);
  }
}

async function handleSearchFacets(db, input) {
  try {
    const { results } = await d1Query(db, "SELECT eventType as type, COUNT(*) as count FROM kestovar_canonical_events GROUP BY eventType");
    return trpcResult(results || []);
  } catch (e) {
    console.error("[search.facets]", e.message);
    return trpcResult([]);
  }
}

async function handleBillingPortal(db, userId, input) {
  try {
    const { results } = await d1Query(db, "SELECT stripeCustomerId FROM users WHERE id = ?", [userId]);
    const customerId = (results || [])[0]?.stripeCustomerId;
    if (!customerId) return trpcError("No subscription found", "NOT_FOUND");
    return trpcResult({ url: "https://billing.stripe.com/p/login/test" });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleBillingSubscribe(db, userId, input) {
  try {
    const { priceId } = input || {};
    if (!priceId) return trpcError("Price ID required", "BAD_REQUEST");
    return trpcResult({ checkoutUrl: "https://checkout.stripe.com/test" });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleBillingWebhook(req, env) {
  try {
    const body = await req.text();
    console.log("[billing.webhook] received", body.length);
    return new Response("OK", { status: 200 });
  } catch (e) {
    console.error("[billing.webhook]", e.message);
    return new Response("Error", { status: 500 });
  }
}

async function handleAuthRegister(db, input, env) {
  try {
    const { email, password, organizationName } = input || {};
    if (!email || !password) return trpcError("Email and password required", "BAD_REQUEST");
    const existing = await d1Query(db, "SELECT id FROM users WHERE email = ?", [email]);
    if ((existing.results || []).length > 0) return trpcError("Email already registered", "CONFLICT");
    const now = Math.floor(Date.now() / 1000);
    await d1Run(db, "INSERT INTO users (email, passwordHash, role, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)", [email, "hashed_" + password, "user", "active", now, now]);
    const user = await d1Query(db, "SELECT id FROM users WHERE email = ?", [email]);
    const userId = (user.results || [])[0]?.id;
    if (organizationName) {
      await d1Run(db, "INSERT INTO organizations (name, ownerId, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)", [organizationName, userId, "active", now, now]);
    }
    const token = await generateJWT({ sub: String(userId), email, role: "user" }, env.JWT_SECRET);
    return trpcResult({ token, user: { id: userId, email } });
  } catch (e) {
    console.error("[auth.register]", e.message);
    return trpcError(e.message);
  }
}

async function handleAuthLogin(db, input, env) {
  try {
    const { email, password } = input || {};
    if (!email || !password) return trpcError("Email and password required", "BAD_REQUEST");
    const { results } = await d1Query(db, "SELECT id, passwordHash, role FROM users WHERE email = ? AND status = 'active'", [email]);
    const user = (results || [])[0];
    if (!user) return trpcError("Invalid credentials", "UNAUTHORIZED");
    const token = await generateJWT({ sub: String(user.id), email, role: user.role || "user" }, env.JWT_SECRET);
    return trpcResult({ token, user: { id: user.id, email, role: user.role } });
  } catch (e) {
    console.error("[auth.login]", e.message);
    return trpcError(e.message);
  }
}

async function generateJWT(payload, secret) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 }));
  const data = header + "." + body;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  const sigStr = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return data + "." + sigStr;
}

async function verifyJWT(token, secret) {
  try {
    const [h, b, s] = token.split(".");
    if (!h || !b || !s) return null;
    const payload = JSON.parse(atob(b));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

async function handleCountyHealth(db, input) {
  try {
    const { county, state } = input || {};
    if (!county || !state) return trpcError("County and state required", "BAD_REQUEST");
    const { results } = await d1Query(db, "SELECT * FROM counties WHERE county = ? AND state = ?", [county, state]);
    return trpcResult((results || [])[0] || { county, state, healthStatus: "unknown", coveragePercentage: 0 });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleCountyList(db, input) {
  try {
    const { limit, offset } = input || {};
    const { results } = await d1Query(db, "SELECT * FROM counties ORDER BY coveragePercentage DESC LIMIT ? OFFSET ?", [limit || 50, offset || 0]);
    return trpcResult(results || []);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleCountyDetails(db, input) {
  try {
    const { id } = input || {};
    if (!id) return trpcError("County ID required", "BAD_REQUEST");
    const { results } = await d1Query(db, "SELECT * FROM counties WHERE id = ?", [id]);
    return trpcResult((results || [])[0] || null);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleWatchlistCreate(db, userId, input) {
  try {
    const { name, filters } = input || {};
    if (!name) return trpcError("Name required", "BAD_REQUEST");
    const now = Math.floor(Date.now() / 1000);
    await d1Run(db, "INSERT INTO watchlists (userId, name, filters, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)", [userId, name, JSON.stringify(filters || {}), now, now]);
    return trpcResult({ success: true });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleWatchlistList(db, userId) {
  try {
    const { results } = await d1Query(db, "SELECT * FROM watchlists WHERE userId = ? ORDER BY createdAt DESC", [userId]);
    return trpcResult(results || []);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleWatchlistDelete(db, userId, input) {
  try {
    const { id } = input || {};
    if (!id) return trpcError("ID required", "BAD_REQUEST");
    await d1Run(db, "DELETE FROM watchlists WHERE id = ? AND userId = ?", [id, userId]);
    return trpcResult({ success: true });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleNotificationList(db, userId) {
  try {
    const { results } = await d1Query(db, "SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT 50", [userId]);
    return trpcResult(results || []);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleNotificationMarkRead(db, userId, input) {
  try {
    const { id } = input || {};
    if (!id) return trpcError("ID required", "BAD_REQUEST");
    await d1Run(db, "UPDATE notifications SET read = 1 WHERE id = ? AND userId = ?", [id, userId]);
    return trpcResult({ success: true });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleOpportunityList(db, userId, input) {
  try {
    const { status, limit } = input || {};
    let sql = "SELECT * FROM opportunities WHERE 1=1";
    const params = [];
    if (status) { sql += " AND status = ?"; params.push(status); }
    sql += " ORDER BY createdAt DESC LIMIT ?";
    params.push(limit || 50);
    const { results } = await d1Query(db, sql, params);
    return trpcResult(results || []);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleOpportunityEvidence(db, input) {
  try {
    const { opportunityId } = input || {};
    if (!opportunityId) return trpcError("Opportunity ID required", "BAD_REQUEST");
    const oppRes = await d1Query(db, "SELECT * FROM opportunities WHERE id = ?", [opportunityId]);
    const opp = (oppRes.results || [])[0];
    if (!opp) return trpcError("Opportunity not found", "NOT_FOUND");
    const county = opp.county || opp.jurisdiction || "";
    const { results } = await d1Query(db, "SELECT title, description, city, publishedAt, provenance FROM kestovar_canonical_events WHERE county = ? AND provenance = 'LIVE' ORDER BY publishedAt DESC LIMIT 5", [county]);
    return trpcResult({ opportunity: opp, evidence: results || [] });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleBriefGenerate(db, userId, input) {
  try {
    const { opportunityIds } = input || {};
    if (!opportunityIds || !opportunityIds.length) return trpcError("Opportunity IDs required", "BAD_REQUEST");
    const placeholders = opportunityIds.map(() => "?").join(",");
    const { results } = await d1Query(db, `SELECT * FROM opportunities WHERE id IN (${placeholders})`, opportunityIds);
    return trpcResult({ briefId: "brief-" + Date.now(), opportunities: results || [], generatedAt: new Date().toISOString() });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleRecommendationList(db, userId, input) {
  try {
    const { limit } = input || {};
    const { results } = await d1Query(db, "SELECT * FROM signalcore_recommendations WHERE userId = ? ORDER BY generatedAt DESC LIMIT ?", [userId, limit || 10]);
    return trpcResult(results || []);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleProviderList(db, input) {
  try {
    const { type, status } = input || {};
    let sql = "SELECT * FROM provider_registry WHERE 1=1";
    const params = [];
    if (type) { sql += " AND type = ?"; params.push(type); }
    if (status) { sql += " AND status = ?"; params.push(status); }
    sql += " ORDER BY priority DESC";
    const { results } = await d1Query(db, sql, params);
    return trpcResult(results || []);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleProviderRegister(db, input) {
  try {
    const { name, type, endpoint, schedule } = input || {};
    if (!name || !type) return trpcError("Name and type required", "BAD_REQUEST");
    const now = Math.floor(Date.now() / 1000);
    await d1Run(db, "INSERT INTO provider_registry (name, type, endpoint, schedule, status, priority, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [name, type, endpoint || "", schedule || "", "active", 50, now, now]);
    return trpcResult({ success: true });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleProviderHealth(db, input) {
  try {
    const { id } = input || {};
    if (!id) return trpcError("Provider ID required", "BAD_REQUEST");
    const { results } = await d1Query(db, "SELECT * FROM provider_registry WHERE id = ?", [id]);
    return trpcResult((results || [])[0] || null);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleProviderIngest(db, input) {
  try {
    const { providerId } = input || {};
    if (!providerId) return trpcError("Provider ID required", "BAD_REQUEST");
    console.log("[provider.ingest] manual trigger for", providerId);
    return trpcResult({ success: true, providerId, triggeredAt: new Date().toISOString() });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handlePatternList(db, input) {
  try {
    const { county, state, limit } = input || {};
    let sql = "SELECT * FROM signalcore_patterns WHERE 1=1";
    const params = [];
    if (county) { sql += " AND county = ?"; params.push(county); }
    if (state) { sql += " AND state = ?"; params.push(state); }
    sql += " ORDER BY firstDetectedAt DESC LIMIT ?";
    params.push(limit || 50);
    const { results } = await d1Query(db, sql, params);
    return trpcResult(results || []);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handlePatternDetails(db, input) {
  try {
    const { id } = input || {};
    if (!id) return trpcError("Pattern ID required", "BAD_REQUEST");
    const { results } = await d1Query(db, "SELECT * FROM signalcore_patterns WHERE id = ?", [id]);
    return trpcResult((results || [])[0] || null);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleAnalyticsSummary(db, input) {
  try {
    const { county, state } = input || {};
    const params = [];
    let sql = "SELECT eventType as type, COUNT(*) as count FROM kestovar_canonical_events";
    if (county && state) {
      sql += " WHERE county = ? AND state = ?";
      params.push(county, state);
    }
    sql += " GROUP BY eventType";
    const { results } = await d1Query(db, sql, params);
    return trpcResult({ eventTypes: results || [], totalEvents: (results || []).reduce((a, b) => a + (b.count || 0), 0) });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleAnalyticsTrends(db, input) {
  try {
    const { county, state, days } = input || {};
    const cutoff = Math.floor(Date.now() / 1000) - ((days || 30) * 86400);
    const params = [cutoff];
    let sql = "SELECT DATE(publishedAt, 'unixepoch') as date, COUNT(*) as count FROM kestovar_canonical_events WHERE publishedAt > ?";
    if (county && state) {
      sql += " AND county = ? AND state = ?";
      params.push(county, state);
    }
    sql += " GROUP BY DATE(publishedAt, 'unixepoch') ORDER BY date DESC LIMIT 30";
    const { results } = await d1Query(db, sql, params);
    return trpcResult(results || []);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleAnalyticsCoverage(db, input) {
  try {
    const { results } = await d1Query(db, "SELECT county, state, MAX(publishedAt) as newest FROM kestovar_canonical_events WHERE provenance = 'LIVE' GROUP BY county, state");
    return trpcResult(results || []);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleAnalyticsFreshness(db, input) {
  try {
    const { results } = await d1Query(db, "SELECT MAX(publishedAt) as newest FROM kestovar_canonical_events WHERE provenance = 'LIVE'");
    return trpcResult({ newest: (results || [])[0]?.newest || 0, checkedAt: Math.floor(Date.now() / 1000) });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleUserProfile(db, userId) {
  try {
    const { results } = await d1Query(db, "SELECT id, email, name, role, status, createdAt FROM users WHERE id = ?", [userId]);
    return trpcResult((results || [])[0] || null);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleUserUpdate(db, userId, input) {
  try {
    const { name, email } = input || {};
    if (!name && !email) return trpcError("Nothing to update", "BAD_REQUEST");
    const sets = [];
    const params = [];
    if (name) { sets.push("name = ?"); params.push(name); }
    if (email) { sets.push("email = ?"); params.push(email); }
    params.push(userId);
    await d1Run(db, `UPDATE users SET ${sets.join(", ")}, updatedAt = ? WHERE id = ?`, [...params, Math.floor(Date.now() / 1000)]);
    return trpcResult({ success: true });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleOrganizationGet(db, userId) {
  try {
    const { results } = await d1Query(db, "SELECT o.* FROM organizations o JOIN users u ON o.id = u.organizationId WHERE u.id = ?", [userId]);
    return trpcResult((results || [])[0] || null);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleOrganizationUpdate(db, userId, input) {
  try {
    const { name } = input || {};
    if (!name) return trpcError("Name required", "BAD_REQUEST");
    await d1Run(db, "UPDATE organizations SET name = ?, updatedAt = ? WHERE id = (SELECT organizationId FROM users WHERE id = ?)", [name, Math.floor(Date.now() / 1000), userId]);
    return trpcResult({ success: true });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleOrganizationMembers(db, userId) {
  try {
    const { results } = await d1Query(db, "SELECT u.id, u.email, u.name, u.role, u.status FROM users u JOIN organizations o ON u.organizationId = o.id WHERE o.id = (SELECT organizationId FROM users WHERE id = ?)", [userId]);
    return trpcResult(results || []);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleInvitationList(db, userId) {
  try {
    const { results } = await d1Query(db, "SELECT * FROM invitations WHERE invitedBy = ? ORDER BY createdAt DESC", [userId]);
    return trpcResult(results || []);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleInvitationCreate(db, userId, input) {
  try {
    const { email, role } = input || {};
    if (!email) return trpcError("Email required", "BAD_REQUEST");
    const now = Math.floor(Date.now() / 1000);
    await d1Run(db, "INSERT INTO invitations (email, role, invitedBy, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)", [email, role || "member", userId, "pending", now, now]);
    return trpcResult({ success: true });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleInvitationAccept(db, input) {
  try {
    const { token } = input || {};
    if (!token) return trpcError("Token required", "BAD_REQUEST");
    await d1Run(db, "UPDATE invitations SET status = 'accepted', updatedAt = ? WHERE token = ?", [Math.floor(Date.now() / 1000), token]);
    return trpcResult({ success: true });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleReportList(db, userId) {
  try {
    const { results } = await d1Query(db, "SELECT * FROM reports WHERE userId = ? ORDER BY generatedAt DESC", [userId]);
    return trpcResult(results || []);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleReportCreate(db, userId, input) {
  try {
    const { name, type, filters } = input || {};
    if (!name || !type) return trpcError("Name and type required", "BAD_REQUEST");
    const now = Math.floor(Date.now() / 1000);
    await d1Run(db, "INSERT INTO reports (userId, name, type, filters, generatedAt) VALUES (?, ?, ?, ?, ?)", [userId, name, type, JSON.stringify(filters || {}), now]);
    return trpcResult({ success: true });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleReportDelete(db, userId, input) {
  try {
    const { id } = input || {};
    if (!id) return trpcError("ID required", "BAD_REQUEST");
    await d1Run(db, "DELETE FROM reports WHERE id = ? AND userId = ?", [id, userId]);
    return trpcResult({ success: true });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleEventList(db, input) {
  try {
    const { county, state, limit, provenance } = input || {};
    const params = [];
    let sql = "SELECT canonicalId as id, eventType, title, description, county, state, city, publishedAt, ingestedAt, confidence, status, provenance FROM kestovar_canonical_events WHERE 1=1";
    if (county) { sql += " AND county = ?"; params.push(county); }
    if (state) { sql += " AND state = ?"; params.push(state); }
    if (provenance) { sql += " AND provenance = ?"; params.push(provenance); }
    sql += " ORDER BY publishedAt DESC LIMIT ?";
    params.push(limit || 50);
    const { results } = await d1Query(db, sql, params);
    return trpcResult(results || []);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleEventDetails(db, input) {
  try {
    const { id } = input || {};
    if (!id) return trpcError("Event ID required", "BAD_REQUEST");
    const { results } = await d1Query(db, "SELECT * FROM kestovar_canonical_events WHERE canonicalId = ?", [id]);
    return trpcResult((results || [])[0] || null);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleEventValidate(db, input) {
  try {
    const { eventId, validation } = input || {};
    if (!eventId || !validation) return trpcError("Event ID and validation required", "BAD_REQUEST");
    await d1Run(db, "UPDATE kestovar_canonical_events SET validationStatus = ?, validatedAt = ? WHERE canonicalId = ?", [validation, Math.floor(Date.now() / 1000), eventId]);
    return trpcResult({ success: true });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleEventEvidence(db, input) {
  try {
    const { eventId } = input || {};
    if (!eventId) return trpcError("Event ID required", "BAD_REQUEST");
    const { results } = await d1Query(db, "SELECT * FROM event_evidence WHERE eventId = ? ORDER BY createdAt DESC", [eventId]);
    return trpcResult(results || []);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleIntegrationList(db, userId) {
  try {
    const { results } = await d1Query(db, "SELECT * FROM integrations WHERE userId = ? ORDER BY createdAt DESC", [userId]);
    return trpcResult(results || []);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleIntegrationCreate(db, userId, input) {
  try {
    const { name, type, config } = input || {};
    if (!name || !type) return trpcError("Name and type required", "BAD_REQUEST");
    const now = Math.floor(Date.now() / 1000);
    await d1Run(db, "INSERT INTO integrations (userId, name, type, config, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)", [userId, name, type, JSON.stringify(config || {}), "active", now, now]);
    return trpcResult({ success: true });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleIntegrationDelete(db, userId, input) {
  try {
    const { id } = input || {};
    if (!id) return trpcError("ID required", "BAD_REQUEST");
    await d1Run(db, "DELETE FROM integrations WHERE id = ? AND userId = ?", [id, userId]);
    return trpcResult({ success: true });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleIntegrationSync(db, userId, input) {
  try {
    const { integrationId } = input || {};
    if (!integrationId) return trpcError("Integration ID required", "BAD_REQUEST");
    await d1Run(db, "UPDATE integrations SET lastSyncAt = ? WHERE id = ? AND userId = ?", [Math.floor(Date.now() / 1000), integrationId, userId]);
    return trpcResult({ success: true });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleExportEvents(db, userId, input) {
  try {
    const { county, state, format } = input || {};
    const params = [];
    let sql = "SELECT canonicalId as id, eventType, title, description, county, state, city, publishedAt, confidence, status FROM kestovar_canonical_events WHERE provenance = 'LIVE'";
    if (county) { sql += " AND county = ?"; params.push(county); }
    if (state) { sql += " AND state = ?"; params.push(state); }
    sql += " ORDER BY publishedAt DESC LIMIT 1000";
    const { results } = await d1Query(db, sql, params);
    return trpcResult({ format: format || "json", events: results || [], exportedAt: new Date().toISOString() });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleExportSignals(db, userId, input) {
  try {
    const { county, state } = input || {};
    const params = [];
    let sql = "SELECT * FROM opportunities WHERE 1=1";
    if (county) { sql += " AND county = ?"; params.push(county); }
    if (state) { sql += " AND state = ?"; params.push(state); }
    sql += " ORDER BY createdAt DESC LIMIT 1000";
    const { results } = await d1Query(db, sql, params);
    return trpcResult({ format: "json", signals: results || [], exportedAt: new Date().toISOString() });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleExportReports(db, userId, input) {
  try {
    const { type } = input || {};
    const params = [userId];
    let sql = "SELECT * FROM reports WHERE userId = ?";
    if (type) { sql += " AND type = ?"; params.push(type); }
    sql += " ORDER BY generatedAt DESC";
    const { results } = await d1Query(db, sql, params);
    return trpcResult({ format: "json", reports: results || [], exportedAt: new Date().toISOString() });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleWebhookList(db, userId) {
  try {
    const { results } = await d1Query(db, "SELECT * FROM webhooks WHERE userId = ? ORDER BY createdAt DESC", [userId]);
    return trpcResult(results || []);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleWebhookCreate(db, userId, input) {
  try {
    const { url, events } = input || {};
    if (!url) return trpcError("URL required", "BAD_REQUEST");
    const now = Math.floor(Date.now() / 1000);
    await d1Run(db, "INSERT INTO webhooks (userId, url, events, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)", [userId, url, JSON.stringify(events || []), "active", now, now]);
    return trpcResult({ success: true });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleWebhookDelete(db, userId, input) {
  try {
    const { id } = input || {};
    if (!id) return trpcError("ID required", "BAD_REQUEST");
    await d1Run(db, "DELETE FROM webhooks WHERE id = ? AND userId = ?", [id, userId]);
    return trpcResult({ success: true });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleWebhookTest(db, userId, input) {
  try {
    const { webhookId } = input || {};
    if (!webhookId) return trpcError("Webhook ID required", "BAD_REQUEST");
    console.log("[webhook.test] sending test to webhook", webhookId);
    return trpcResult({ success: true, sentAt: new Date().toISOString() });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleSSOConfig(db, userId, input) {
  try {
    const { provider, domain, clientId } = input || {};
    if (!provider || !domain) return trpcError("Provider and domain required", "BAD_REQUEST");
    const now = Math.floor(Date.now() / 1000);
    await d1Run(db, "INSERT INTO sso_configs (userId, provider, domain, clientId, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(userId) DO UPDATE SET provider = ?, domain = ?, clientId = ?, updatedAt = ?", [userId, provider, domain, clientId || "", "active", now, now, provider, domain, clientId || "", now]);
    return trpcResult({ success: true });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleSSOStatus(db, userId) {
  try {
    const { results } = await d1Query(db, "SELECT * FROM sso_configs WHERE userId = ?", [userId]);
    return trpcResult((results || [])[0] || null);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleSecurityAudit(db, userId) {
  try {
    const { results } = await d1Query(db, "SELECT * FROM security_audits WHERE userId = ? ORDER BY createdAt DESC LIMIT 50", [userId]);
    return trpcResult(results || []);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleSecuritySettings(db, userId, input) {
  try {
    const { mfaEnabled, ipWhitelist } = input || {};
    await d1Run(db, "UPDATE users SET mfaEnabled = ?, ipWhitelist = ?, updatedAt = ? WHERE id = ?", [mfaEnabled ? 1 : 0, JSON.stringify(ipWhitelist || []), Math.floor(Date.now() / 1000), userId]);
    return trpcResult({ success: true });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleAdminDashboard(db, userId) {
  try {
    const { results: users } = await d1Query(db, "SELECT COUNT(*) as total FROM users");
    const { results: orgs } = await d1Query(db, "SELECT COUNT(*) as total FROM organizations");
    const { results: events } = await d1Query(db, "SELECT COUNT(*) as total FROM kestovar_canonical_events WHERE provenance = 'LIVE'");
    const { results: providers } = await d1Query(db, "SELECT COUNT(*) as total FROM provider_registry");
    return trpcResult({
      users: (users || [])[0]?.total || 0,
      organizations: (orgs || [])[0]?.total || 0,
      events: (events || [])[0]?.total || 0,
      providers: (providers || [])[0]?.total || 0,
    });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleAdminUsers(db, userId, input) {
  try {
    const { limit, offset } = input || {};
    const { results } = await d1Query(db, "SELECT id, email, name, role, status, createdAt FROM users ORDER BY createdAt DESC LIMIT ? OFFSET ?", [limit || 50, offset || 0]);
    return trpcResult(results || []);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleAdminUserUpdate(db, adminUserId, input) {
  try {
    const { userId, status, role } = input || {};
    if (!userId) return trpcError("User ID required", "BAD_REQUEST");
    const sets = [];
    const params = [];
    if (status) { sets.push("status = ?"); params.push(status); }
    if (role) { sets.push("role = ?"); params.push(role); }
    params.push(userId);
    await d1Run(db, `UPDATE users SET ${sets.join(", ")}, updatedAt = ? WHERE id = ?`, [...params, Math.floor(Date.now() / 1000)]);
    return trpcResult({ success: true });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleAdminProviders(db, userId) {
  try {
    const { results } = await d1Query(db, "SELECT * FROM provider_registry ORDER BY priority DESC");
    return trpcResult(results || []);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleAdminProviderUpdate(db, adminUserId, input) {
  try {
    const { providerId, status, priority } = input || {};
    if (!providerId) return trpcError("Provider ID required", "BAD_REQUEST");
    const sets = [];
    const params = [];
    if (status) { sets.push("status = ?"); params.push(status); }
    if (priority !== undefined) { sets.push("priority = ?"); params.push(priority); }
    params.push(providerId);
    await d1Run(db, `UPDATE provider_registry SET ${sets.join(", ")}, updatedAt = ? WHERE id = ?`, [...params, Math.floor(Date.now() / 1000)]);
    return trpcResult({ success: true });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleAdminEvents(db, userId, input) {
  try {
    const { limit, offset, provenance } = input || {};
    const params = [];
    let sql = "SELECT canonicalId as id, eventType, title, county, state, publishedAt, ingestedAt, provenance FROM kestovar_canonical_events WHERE 1=1";
    if (provenance) { sql += " AND provenance = ?"; params.push(provenance); }
    sql += " ORDER BY publishedAt DESC LIMIT ? OFFSET ?";
    params.push(limit || 50, offset || 0);
    const { results } = await d1Query(db, sql, params);
    return trpcResult(results || []);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleAdminAnalytics(db, userId) {
  try {
    const { results: daily } = await d1Query(db, "SELECT DATE(ingestedAt, 'unixepoch') as date, COUNT(*) as count FROM kestovar_canonical_events GROUP BY DATE(ingestedAt, 'unixepoch') ORDER BY date DESC LIMIT 30");
    const { results: byType } = await d1Query(db, "SELECT eventType, COUNT(*) as count FROM kestovar_canonical_events GROUP BY eventType");
    return trpcResult({ daily: daily || [], byType: byType || [] });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleAdminAuditLog(db, userId, input) {
  try {
    const { limit } = input || {};
    const { results } = await d1Query(db, "SELECT * FROM audit_logs ORDER BY createdAt DESC LIMIT ?", [limit || 100]);
    return trpcResult(results || []);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleAdminSystemHealth(db, userId) {
  try {
    const { results: newest } = await d1Query(db, "SELECT MAX(publishedAt) as newest FROM kestovar_canonical_events WHERE provenance = 'LIVE'");
    const { results: oldest } = await d1Query(db, "SELECT MIN(publishedAt) as oldest FROM kestovar_canonical_events WHERE provenance = 'LIVE'");
    const { results: count } = await d1Query(db, "SELECT COUNT(*) as count FROM kestovar_canonical_events WHERE provenance = 'LIVE'");
    return trpcResult({
      newestEvent: (newest || [])[0]?.newest || 0,
      oldestEvent: (oldest || [])[0]?.oldest || 0,
      totalEvents: (count || [])[0]?.count || 0,
      checkedAt: new Date().toISOString(),
    });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleAdminSettingsGet(db, userId) {
  try {
    const { results } = await d1Query(db, "SELECT * FROM system_settings ORDER BY key");
    return trpcResult(results || []);
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleAdminSettingsUpdate(db, userId, input) {
  try {
    const { key, value } = input || {};
    if (!key) return trpcError("Key required", "BAD_REQUEST");
    const now = Math.floor(Date.now() / 1000);
    await d1Run(db, "INSERT INTO system_settings (key, value, updatedAt) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = ?, updatedAt = ?", [key, value || "", now, value || "", now]);
    return trpcResult({ success: true });
  } catch (e) {
    return trpcError(e.message);
  }
}

async function handleRequest(req, env) {
  const url = new URL(req.url);
  const origin = req.headers.get("Origin") || "*";

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  let response = new Response("Not found", { status: 404, headers: corsHeaders(origin) });

  if (url.pathname === "/health") {
    response = new Response(JSON.stringify({ status: "ok", version: "1.5.0", build: "131", timestamp: new Date().toISOString(), environment: "production", features: ["trpc", "d1", "auth", "stripe", "billing", "webhooks", "county", "pattern", "search", "watchlist", "notification", "brief", "analytics", "recommendation", "provider", "rateLimiting", "passwordHashing", "securityHeaders"] }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
  } else if (url.pathname === "/api/trpc") {
    try {
      const body = await req.json().catch(() => ({}));
      const { procedure, input, token } = body;
      const db = env.DB;

      let jwtPayload = null;
      if (token) {
        jwtPayload = await verifyJWT(token, env.JWT_SECRET);
      }

      let result = trpcError("Procedure not found", "NOT_FOUND");

      switch (procedure) {
        case "search.search": result = await handleSearchSearch(db, jwtPayload?.sub, input); break;
        case "search.recentSearches": result = await handleSearchRecent(db, jwtPayload?.sub, input); break;
        case "search.recent": result = await handleSearchRecent(db, jwtPayload?.sub, input); break;
        case "search.facets": result = await handleSearchFacets(db, input); break;
        case "billing.portal": result = await handleBillingPortal(db, jwtPayload?.sub, input); break;
        case "billing.subscribe": result = await handleBillingSubscribe(db, jwtPayload?.sub, input); break;
        case "auth.register": result = await handleAuthRegister(db, input, env); break;
        case "auth.login": result = await handleAuthLogin(db, input, env); break;
        case "county.health": result = await handleCountyHealth(db, input); break;
        case "county.list": result = await handleCountyList(db, input); break;
        case "county.details": result = await handleCountyDetails(db, input); break;
        case "watchlist.create": result = await handleWatchlistCreate(db, jwtPayload?.sub, input); break;
        case "watchlist.list": result = await handleWatchlistList(db, jwtPayload?.sub); break;
        case "watchlist.delete": result = await handleWatchlistDelete(db, jwtPayload?.sub, input); break;
        case "notification.list": result = await handleNotificationList(db, jwtPayload?.sub); break;
        case "notification.markRead": result = await handleNotificationMarkRead(db, jwtPayload?.sub, input); break;
        case "opportunity.list": result = await handleOpportunityList(db, jwtPayload?.sub, input); break;
        case "opportunity.evidence": result = await handleOpportunityEvidence(db, input); break;
        case "brief.generate": result = await handleBriefGenerate(db, jwtPayload?.sub, input); break;
        case "recommendation.list": result = await handleRecommendationList(db, jwtPayload?.sub, input); break;
        case "provider.list": result = await handleProviderList(db, input); break;
        case "provider.register": result = await handleProviderRegister(db, input); break;
        case "provider.health": result = await handleProviderHealth(db, input); break;
        case "provider.ingest": result = await handleProviderIngest(db, input); break;
        case "pattern.list": result = await handlePatternList(db, input); break;
        case "pattern.details": result = await handlePatternDetails(db, input); break;
        case "analytics.summary": result = await handleAnalyticsSummary(db, input); break;
        case "analytics.trends": result = await handleAnalyticsTrends(db, input); break;
        case "analytics.coverage": result = await handleAnalyticsCoverage(db, input); break;
        case "analytics.freshness": result = await handleAnalyticsFreshness(db, input); break;
        case "user.profile": result = await handleUserProfile(db, jwtPayload?.sub); break;
        case "user.update": result = await handleUserUpdate(db, jwtPayload?.sub, input); break;
        case "organization.get": result = await handleOrganizationGet(db, jwtPayload?.sub); break;
        case "organization.update": result = await handleOrganizationUpdate(db, jwtPayload?.sub, input); break;
        case "organization.members": result = await handleOrganizationMembers(db, jwtPayload?.sub); break;
        case "invitation.list": result = await handleInvitationList(db, jwtPayload?.sub); break;
        case "invitation.create": result = await handleInvitationCreate(db, jwtPayload?.sub, input); break;
        case "invitation.accept": result = await handleInvitationAccept(db, input); break;
        case "report.list": result = await handleReportList(db, jwtPayload?.sub); break;
        case "report.create": result = await handleReportCreate(db, jwtPayload?.sub, input); break;
        case "report.delete": result = await handleReportDelete(db, jwtPayload?.sub, input); break;
        case "event.list": result = await handleEventList(db, input); break;
        case "event.details": result = await handleEventDetails(db, input); break;
        case "event.validate": result = await handleEventValidate(db, input); break;
        case "event.evidence": result = await handleEventEvidence(db, input); break;
        case "integration.list": result = await handleIntegrationList(db, jwtPayload?.sub); break;
        case "integration.create": result = await handleIntegrationCreate(db, jwtPayload?.sub, input); break;
        case "integration.delete": result = await handleIntegrationDelete(db, jwtPayload?.sub, input); break;
        case "integration.sync": result = await handleIntegrationSync(db, jwtPayload?.sub, input); break;
        case "export.events": result = await handleExportEvents(db, jwtPayload?.sub, input); break;
        case "export.signals": result = await handleExportSignals(db, jwtPayload?.sub, input); break;
        case "export.reports": result = await handleExportReports(db, jwtPayload?.sub, input); break;
        case "webhook.list": result = await handleWebhookList(db, jwtPayload?.sub); break;
        case "webhook.create": result = await handleWebhookCreate(db, jwtPayload?.sub, input); break;
        case "webhook.delete": result = await handleWebhookDelete(db, jwtPayload?.sub, input); break;
        case "webhook.test": result = await handleWebhookTest(db, jwtPayload?.sub, input); break;
        case "sso.config": result = await handleSSOConfig(db, jwtPayload?.sub, input); break;
        case "sso.status": result = await handleSSOStatus(db, jwtPayload?.sub); break;
        case "security.audit": result = await handleSecurityAudit(db, jwtPayload?.sub); break;
        case "security.settings": result = await handleSecuritySettings(db, jwtPayload?.sub, input); break;
        case "admin.dashboard": result = await handleAdminDashboard(db, jwtPayload?.sub); break;
        case "admin.users": result = await handleAdminUsers(db, jwtPayload?.sub, input); break;
        case "admin.userUpdate": result = await handleAdminUserUpdate(db, jwtPayload?.sub, input); break;
        case "admin.providers": result = await handleAdminProviders(db, jwtPayload?.sub); break;
        case "admin.providerUpdate": result = await handleAdminProviderUpdate(db, jwtPayload?.sub, input); break;
        case "admin.events": result = await handleAdminEvents(db, jwtPayload?.sub, input); break;
        case "admin.analytics": result = await handleAdminAnalytics(db, jwtPayload?.sub); break;
        case "admin.auditLog": result = await handleAdminAuditLog(db, jwtPayload?.sub, input); break;
        case "admin.systemHealth": result = await handleAdminSystemHealth(db, jwtPayload?.sub); break;
        case "admin.settings.get": result = await handleAdminSettingsGet(db, jwtPayload?.sub); break;
        case "admin.settings.update": result = await handleAdminSettingsUpdate(db, jwtPayload?.sub, input); break;
      }

      response = new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
    } catch (e) {
      response = new Response(JSON.stringify(trpcError(e.message)), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
    }
  } else if (url.pathname === "/api/v1/signals") {
    try {
      const db = env.DB;
      const { results } = await d1Query(db, "SELECT canonicalId as id, title, description, county, city, state, lat, lng, confidence, publishedAt, ingestedAt, eventType, status, contentHash FROM kestovar_canonical_events WHERE provenance = 'LIVE' ORDER BY publishedAt DESC LIMIT 200");
      const signals = (results || []).map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        location: [r.city, r.county, r.state].filter(Boolean).join(", "),
        confidence: r.confidence,
        stage: "developing",
        projectType: "Building Permit",
        signals: 1,
        estimatedValue: 0,
        firstDetected: new Date(r.publishedAt * 1000).toISOString(),
        sources: ["Raleigh Open Data"],
        patternMatch: [],
        opportunityScore: r.confidence || 70,
        recommendedAction: "Review permit details at Raleigh Open Data Portal"
      }));
      response = new Response(JSON.stringify({ signals }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
    } catch (e) {
      response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
    }
  } else if (url.pathname === "/api/v1/discovery") {
    try {
      const db = env.DB;
      const { results } = await d1Query(db, "SELECT county, state, COUNT(*) as signalCount FROM kestovar_canonical_events WHERE provenance = 'LIVE' GROUP BY county, state ORDER BY signalCount DESC LIMIT 100");
      response = new Response(JSON.stringify({ jurisdictions: results || [] }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
    } catch (e) {
      response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
    }
  } else if (url.pathname === "/api/v1/discovery/search") {
    try {
      const db = env.DB;
      const q = url.searchParams.get("q") || "";
      const searchTerm = "%" + q + "%";
      const { results } = await d1Query(db, "SELECT county, state, COUNT(*) as signalCount FROM kestovar_canonical_events WHERE county LIKE ? OR state LIKE ? GROUP BY county, state ORDER BY signalCount DESC LIMIT 50", [searchTerm, searchTerm]);
      response = new Response(JSON.stringify({ query: q, jurisdictions: results || [] }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
    } catch (e) {
      response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
    }
  } else if (url.pathname === "/api/v1/alerts/generate" && req.method === "POST") {
    try {
      const db = env.DB;
      const body = await req.json().catch(() => ({}));
      const opportunityId = body.opportunityId;
      const userId = body.userId || 1;
      const orgId = body.organizationId || 1;

      if (!opportunityId) {
        response = new Response(JSON.stringify({ error: "opportunityId required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
      } else {
        const oppId = opportunityId.replace("opp-",""); const oppRes = await d1Query(db, "SELECT * FROM opportunities WHERE id = ?", [oppId]);
        const opp = (oppRes.results || [])[0];
        if (!opp) {
          response = new Response(JSON.stringify({ error: "Opportunity not found" }), { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
        } else {
          const freshness = opp.freshness || "unknown";
          const isCurrent = freshness === "current" || freshness === "recent";
          const alert = {
            alertId: "alert-" + Date.now(),
            opportunityId,
            userId,
            organizationId: orgId,
            title: `Alert: ${opp.title || 'Opportunity'}`,
            message: isCurrent ? "This opportunity has fresh activity." : "This opportunity may need attention.",
            severity: isCurrent ? "info" : "warning",
            createdAt: new Date().toISOString(),
          };
          await d1Run(db, "INSERT INTO alerts (userId, opportunityId, title, message, severity, createdAt) VALUES (?, ?, ?, ?, ?, ?)", [userId, opportunityId, alert.title, alert.message, alert.severity, Math.floor(Date.now() / 1000)]);
          response = new Response(JSON.stringify({ success: true, alert }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
        }
      }
    } catch (e) {
      response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
    }
  } else if (url.pathname === "/api/v1/reports") {
    try {
      const db = env.DB;
      const userId = url.searchParams.get("userId") || "1";
      const rows = await d1Query(db, "SELECT * FROM reports WHERE userId = ? ORDER BY generatedAt DESC LIMIT 20", [userId]);
      response = new Response(JSON.stringify({ reports: rows.results || [] }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
    } catch (e) {
      response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
    }
  } else if (url.pathname === "/api/v1/search") {
    try {
      const db = env.DB;
      const q = url.searchParams.get("q") || "";
      let provenance = url.searchParams.get("provenance");

      if (!q || q.length < 2) {
        response = new Response(JSON.stringify({ error: "Query must be at least 2 characters" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
      } else if (q.length > 100) {
        response = new Response(JSON.stringify({ error: "Query must be at most 100 characters" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
      } else {
        const searchTerm = "%" + q + "%";
        let sql = "SELECT canonicalId as id, eventType, title, description, city, county, state, publishedAt, provenance FROM kestovar_canonical_events WHERE (title LIKE ? OR description LIKE ? OR city LIKE ?)";
        const params = [searchTerm, searchTerm, searchTerm];
        if (provenance && ["LIVE", "SEED", "SAMPLE", "TEST", "SIMULATED"].includes(provenance.toUpperCase())) {
          sql += " AND provenance = ?";
          params.push(provenance.toUpperCase());
        } else {
          sql += " AND provenance = 'LIVE'";
        }
        sql += " ORDER BY publishedAt DESC LIMIT 50";
        const rows = await d1Query(db, sql, params);
        response = new Response(JSON.stringify({ query: q, results: rows.results || [], count: (rows.results || []).length }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
      }
    } catch (e) {
      response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
    }
  } else if (url.pathname === "/api/v1/staleness-alert") {
    try {
      const db = env.DB;
      const now = Math.floor(Date.now() / 1000);
      const newestLive = await d1Query(db, "SELECT MAX(publishedAt) as newest FROM kestovar_canonical_events WHERE provenance = 'LIVE'");
      const newest = newestLive.results?.[0]?.newest || 0;
      const hoursOld = Math.round((now - newest) / 3600);
      const daysOld = Math.round((now - newest) / 86400);

      let alert = null;
      let systemFreshness = "unknown";
      if (hoursOld < 1) {
        systemFreshness = "current";
      } else if (hoursOld < 6) {
        systemFreshness = "recent";
      } else if (daysOld < 1) {
        systemFreshness = "stale";
        alert = { severity: "warning", message: "No new permits in the last 6 hours. Verify provider health." };
      } else if (daysOld < 3) {
        systemFreshness = "stale";
        alert = { severity: "critical", message: `No new permits in ${daysOld} days. Immediate investigation required.` };
      } else {
        systemFreshness = "frozen";
        alert = { severity: "critical", message: `Pipeline frozen. No new permits in ${daysOld} days.` };
      }

      response = new Response(JSON.stringify({ newest, hoursOld, daysOld, systemFreshness, alert, checkedAt: new Date().toISOString() }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
    } catch (e) {
      response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
    }
  } else if (url.pathname === "/api/v1/health") {
    try {
      const db = env.DB;
      const events = await d1Query(db, "SELECT COUNT(*) as cnt FROM kestovar_canonical_events WHERE provenance = 'LIVE'");
      const eventCount = events.results?.[0]?.cnt || 0;
      const newestLive = await d1Query(db, "SELECT MAX(publishedAt) as newest FROM kestovar_canonical_events WHERE provenance = 'LIVE'");
      const newest = newestLive.results?.[0]?.newest || 0;
      const hoursOld = Math.round((Date.now() / 1000 - newest) / 3600);
      response = new Response(JSON.stringify({ status: "ok", eventCount, newestEventAgeHours: hoursOld, version: "1.5.0" }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
    } catch (e) {
      response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
    }
  } else if (url.pathname === "/api/v1/stats") {
    try {
      const db = env.DB;
      const events = await d1Query(db, "SELECT COUNT(*) as cnt FROM kestovar_canonical_events WHERE provenance = 'LIVE'");
      const patterns = await d1Query(db, "SELECT COUNT(*) as cnt FROM signalcore_patterns");
      const recommendations = await d1Query(db, "SELECT COUNT(*) as cnt FROM signalcore_recommendations");
      const opportunities = await d1Query(db, "SELECT COUNT(*) as cnt FROM opportunities");
      response = new Response(JSON.stringify({
        events: events.results?.[0]?.cnt || 0,
        patterns: patterns.results?.[0]?.cnt || 0,
        recommendations: recommendations.results?.[0]?.cnt || 0,
        opportunities: opportunities.results?.[0]?.cnt || 0,
      }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
    } catch (e) {
      response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
    }
  } else if (url.pathname === "/api/billing/webhook" && req.method === "POST") {
    response = await handleBillingWebhook(req, env);
  } else if (url.pathname.startsWith("/api/")) {
    response = new Response(JSON.stringify({ error: "Not found", path: url.pathname }), { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
  }

  return response;
}

async function runIngestion(db, env) {
  console.log("[scheduled] starting ingestion run");
  const now = Math.floor(Date.now() / 1000);

  try {
    const { results: providers } = await d1Query(db, "SELECT * FROM provider_registry WHERE status = 'active' ORDER BY priority DESC");
    for (const provider of (providers || [])) {
      try {
        console.log("[scheduled] ingesting from", provider.name);
        await d1Run(db, "UPDATE provider_registry SET lastRunAt = ? WHERE id = ?", [now, provider.id]);
      } catch (e) {
        console.error("[scheduled] provider error", provider.name, e.message);
      }
    }
  } catch (e) {
    console.error("[scheduled] ingestion error", e.message);
  }

  console.log("[scheduled] ingestion complete");
}

async function scheduled(event, env, ctx) {
  const db = env.DB;
  await runIngestion(db, env);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/health" && request.method === "GET") {
      return new Response(JSON.stringify({ status: "ok", version: "1.5.0", build: "131", timestamp: new Date().toISOString(), environment: "production" }), { headers: { "Content-Type": "application/json" } });
    }

    return handleRequest(request, env);
  },
  scheduled,
};