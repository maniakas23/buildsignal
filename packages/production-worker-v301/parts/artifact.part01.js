rd error:", e.message);
  }
}
__name(recordRateLimit, "recordRateLimit");
__name2(recordRateLimit, "recordRateLimit");
async function handleAuthRegister(db, env2, input, clientIP) {
  try {
    const { email, password, name } = input || {};
    if (!email || !password) return trpcError("Email and password are required.", "BAD_REQUEST");
    if (password.length < 8) return trpcError("Password must be at least 8 characters.", "BAD_REQUEST");
    const allowed = await checkRateLimit(env2, "register:" + clientIP, 5, 6e4);
    if (!allowed) return trpcError("Too many requests. Please try again later.", "TOO_MANY_REQUESTS");
    const { results: ex } = await d1Query(db, "SELECT id FROM users WHERE email=?", [email]);
    if (ex && ex.length > 0) return trpcError(AUTH_FAILURE, "UNAUTHORIZED");
    const passwordHash = await hashPassword(password);
    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1e3);
    await d1Run(db, "INSERT INTO users (unionId, name, email, passwordHash, plan, isAdmin, createdAt) VALUES (?,?,?,?,?,?,?)", [id, name || email.split("@")[0], email, passwordHash, "starter", 0, now]);
    const { results: userRows } = await d1Query(db, "SELECT id FROM users WHERE unionId = ?", [id]);
    const userId = userRows?.[0]?.id;
    if (!userId) throw new Error("User creation failed");
    const orgSlug = "org-" + id.split("-")[0];
    await d1Run(db, "INSERT INTO organizations (name, slug, ownerId, ownerUnionId, provenance) VALUES (?,?,?,?,?)", [name || email.split("@")[0] + "'s Organization", orgSlug, userId, id, "LIVE"]);
    const { results: orgRows } = await d1Query(db, "SELECT id FROM organizations WHERE slug = ?", [orgSlug]);
    const orgId = orgRows?.[0]?.id;
    if (!orgId) throw new Error("Organization creation failed");
    await d1Run(db, "INSERT INTO org_members (orgId, userId, email, name, role, status, provenance) VALUES (?,?,?,?,?,?,?)", [orgId, userId, email, name || email.split("@")[0], "owner", "active", "LIVE"]);
    await recordRateLimit(env2, "register:" + clientIP);
    console.log(JSON.stringify({ event: "auth.register", email, userId, orgId, ip: clientIP, timestamp: (/* @__PURE__ */ new Date()).toISOString() }));
    return trpcResult({ id, email, userId, orgId });
  } catch (e) {
    console.error("[auth.register]", e.message);
    return trpcError("Registration failed. Please try again.");
  }
}
__name(handleAuthRegister, "handleAuthRegister");
__name2(handleAuthRegister, "handleAuthRegister");
async function handleAuthLogin(db, env2, input, clientIP) {
  try {
    const { email, password } = input || {};
    if (!email || !password) return trpcError(AUTH_FAILURE, "UNAUTHORIZED");
    const ipAllowed = await checkRateLimit(env2, "login_ip:" + clientIP, 10, 6e4);
    if (!ipAllowed) return trpcError("Too many requests. Please try again later.", "TOO_MANY_REQUESTS");
    const emailAllowed = await checkRateLimit(env2, "login_email:" + email.toLowerCase(), 5, 6e4);
    if (!emailAllowed) return trpcError("Too many requests. Please try again later.", "TOO_MANY_REQUESTS");
    const { results } = await d1Query(db, "SELECT id, email, passwordHash FROM users WHERE email=?", [email]);
    if (!results || results.length === 0) {
      await recordRateLimit(env2, "login_ip:" + clientIP);
      await recordRateLimit(env2, "login_email:" + email.toLowerCase());
      return trpcError(AUTH_FAILURE, "UNAUTHORIZED");
    }
    const u = results[0];
    if (!u.passwordHash) {
      await recordRateLimit(env2, "login_ip:" + clientIP);
      await recordRateLimit(env2, "login_email:" + email.toLowerCase());
      return trpcError("Account requires password reset. Please contact support.", "UNAUTHORIZED");
    }
    const valid = await verifyPassword(password, u.passwordHash);
    if (!valid) {
      await recordRateLimit(env2, "login_ip:" + clientIP);
      await recordRateLimit(env2, "login_email:" + email.toLowerCase());
      console.log(JSON.stringify({ event: "auth.login.failed", email, ip: clientIP, timestamp: (/* @__PURE__ */ new Date()).toISOString() }));
      return trpcError(AUTH_FAILURE, "UNAUTHORIZED");
    }
    const h = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const pl = toBase64Url(JSON.stringify({ sub: String(u.id), email, iat: Math.floor(Date.now() / 1e3), exp: Math.floor(Date.now() / 1e3) + 604800 }));
    const enc = new TextEncoder();
    const sk = await crypto.subtle.importKey("raw", enc.encode(env2.JWT_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sig = await crypto.subtle.sign("HMAC", sk, enc.encode(h + "." + pl));
    const sigBytes = new Uint8Array(sig);
    let sigStr = "";
    for (let i = 0; i < sigBytes.length; i++) sigStr += String.fromCharCode(sigBytes[i]);
    const sg = toBase64Url(sigStr);
    console.log(JSON.stringify({ event: "auth.login.success", userId: u.id, email, ip: clientIP, timestamp: (/* @__PURE__ */ new Date()).toISOString() }));
    return trpcResult({ token: h + "." + pl + "." + sg, user: { id: u.id, email } });
  } catch (e) {
    console.error("[auth.login] ERROR:", e.message);
    return trpcError("Authentication failed. Please try again.");
  }
}
__name(handleAuthLogin, "handleAuthLogin");
__name2(handleAuthLogin, "handleAuthLogin");
async function handleAuthMe(db, token, secret) {
  try {
    const payload = await verifyJWT(token, secret);
    if (!payload) return trpcError("Unauthorized", "UNAUTHORIZED");
    const { results } = await d1Query(db, "SELECT id, name, email, plan, isAdmin FROM users WHERE id=?", [payload.sub]);
    if (!results || results.length === 0) return trpcError("Unauthorized", "UNAUTHORIZED");
    const u = results[0];
    const { results: orgResults } = await d1Query(db, "SELECT o.id, o.name, o.slug FROM organizations o JOIN org_members om ON o.id = om.orgId WHERE om.userId = ? AND om.status = 'active' LIMIT 1", [u.id]);
    const org = orgResults?.[0] || null;
    return trpcResult({ id: u.id, email: u.email, name: u.name, plan: u.plan, isAdmin: !!u.isAdmin, organizationId: org?.id || null, organization: org });
  } catch (e) {
    console.error("[auth.me]", e.message);
    return trpcError("Unauthorized", "UNAUTHORIZED");
  }
}
__name(handleAuthMe, "handleAuthMe");
__name2(handleAuthMe, "handleAuthMe");
async function handleCountySummary(db) {
  try {
    const { results } = await d1Query(db, "SELECT COUNT(*) as total, SUM(CASE WHEN healthStatus='active' THEN 1 ELSE 0 END) as active, SUM(CASE WHEN healthStatus='partial' THEN 1 ELSE 0 END) as partial, SUM(CASE WHEN healthStatus='limited' THEN 1 ELSE 0 END) as limited, SUM(CASE WHEN healthStatus='planned' THEN 1 ELSE 0 END) as planned, ROUND(AVG(coveragePercentage),1) as avgCoverage, SUM(population) as totalPopulation, SUM(totalEvents) as totalEventsLegacy, SUM(totalPatterns) as totalPatternsLegacy, SUM(totalRecommendations) as totalRecommendationsLegacy FROM counties");
    const r = results[0] || {};
    const { results: ce } = await d1Query(db, "SELECT COUNT(*) as totalEvents FROM kestovar_canonical_events WHERE provenance = 'LIVE'");
    const { results: cp } = await d1Query(db, "SELECT COUNT(*) as totalPatterns FROM signalcore_patterns WHERE provenance = 'LIVE'");
    const { results: cr } = await d1Query(db, "SELECT COUNT(*) as totalRecommendations FROM recommendations WHERE provenance = 'LIVE'");
    return trpcResult({
      total: r.total || 0,
      active: r.active || 0,
      partial: r.partial || 0,
      limited: r.limited || 0,
      planned: r.planned || 0,
      avgCoverage: r.avgCoverage || 0,
      totalPopulation: r.totalPopulation || 0,
      totalEvents: ce[0]?.totalEvents || 0,
      totalPatterns: cp[0]?.totalPatterns || 0,
      totalRecommendations: cr[0]?.totalRecommendations || 0
    });
  } catch (e) {
    console.error("[county.summary]", e.message);
    return trpcResult({ total: 0, active: 0, partial: 0, limited: 0, planned: 0, avgCoverage: 0, totalPopulation: 0, totalEvents: 0, totalPatterns: 0, totalRecommendations: 0 });
  }
}
__name(handleCountySummary, "handleCountySummary");
__name2(handleCountySummary, "handleCountySummary");
async function handleCountyList(db, input) {
  try {
    const { state, healthStatus, minCoverage, sortBy, page, limit } = input || {};
    let sql = "SELECT * FROM counties WHERE 1=1";
    const params = [];
    if (state) {
      sql += " AND state=?";
      params.push(state);
    }
    if (healthStatus) {
      sql += " AND healthStatus=?";
      params.push(healthStatus);
    }
    if (minCoverage) {
      sql += " AND coveragePercentage>=?";
      params.push(minCoverage);
    }
    const sm = { coverage: "coveragePercentage DESC", population: "population DESC", priority: "expansionPriority DESC", events: "totalEvents DESC" };
    sql += " ORDER BY " + (sm[sortBy] || "coveragePercentage DESC");
    sql += " LIMIT ? OFFSET ?";
    params.push(limit || 24, ((page || 1) - 1) * (limit || 24));
    const { results } = await d1Query(db, sql, params);
    const { results: cr } = await d1Query(db, "SELECT COUNT(*) as count FROM counties");
    return trpcResult({ counties: results || [], count: cr[0]?.count || 0, page: page || 1, totalPages: Math.ceil((cr[0]?.count || 0) / (limit || 24)) });
  } catch (e) {
    console.error("[county.list]", e.message);
    return trpcResult({ counties: [], count: 0, page: 1, totalPages: 0 });
  }
}
__name(handleCountyList, "handleCountyList");
__name2(handleCountyList, "handleCountyList");
async function handleCountyDetail(db, input) {
  try {
    const { results } = await d1Query(db, "SELECT * FROM counties WHERE id=?", [input?.id ?? null]);
    if (!results || results.length === 0) return trpcError("County not found", "NOT_FOUND");
    return trpcResult(results[0]);
  } catch (e) {
    console.error("[coun