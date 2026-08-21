ty.detail]", e.message);
    return trpcError(e.message);
  }
}
__name(handleCountyDetail, "handleCountyDetail");
__name2(handleCountyDetail, "handleCountyDetail");
async function handlePatternList(db, input) {
  try {
    const { patternType, county, state, status, confidenceMin, sortBy, page, limit } = input || {};
    let sql = "SELECT * FROM signalcore_patterns WHERE provenance = 'LIVE'";
    const params = [];
    if (patternType) {
      sql += " AND patternType=?";
      params.push(patternType);
    }
    if (county) {
      sql += " AND county=?";
      params.push(county);
    }
    if (state) {
      sql += " AND state=?";
      params.push(state);
    }
    if (status) {
      sql += " AND status=?";
      params.push(status);
    }
    if (confidenceMin) {
      sql += " AND confidence>=?";
      params.push(confidenceMin);
    }
    const sm = { confidence: "confidence DESC", date: "firstDetectedAt DESC", relevance: "impactScore DESC" };
    sql += " ORDER BY " + (sm[sortBy] || "firstDetectedAt DESC");
    sql += " LIMIT ? OFFSET ?";
    params.push(limit || 24, ((page || 1) - 1) * (limit || 24));
    const { results } = await d1Query(db, sql, params);
    const { results: cr } = await d1Query(db, "SELECT COUNT(*) as count FROM signalcore_patterns WHERE provenance = 'LIVE'");
    return trpcResult({ patterns: results || [], total: cr[0]?.count || 0 });
  } catch (e) {
    console.error("[pattern.list]", e.message);
    return trpcResult({ patterns: [], total: 0 });
  }
}
__name(handlePatternList, "handlePatternList");
__name2(handlePatternList, "handlePatternList");
async function handleNotificationHistory(db, uid, input) {
  try {
    const lim = (input || {}).limit || 50;
    const off = (input || {}).offset || 0;
    const { results: items } = await d1Query(db, "SELECT * FROM notifications WHERE userId=? ORDER BY createdAt DESC LIMIT ? OFFSET ?", [uid, lim, off]);
    const { results: ur } = await d1Query(db, "SELECT COUNT(*) as count FROM notifications WHERE userId=? AND read=0", [uid]);
    const { results: tr } = await d1Query(db, "SELECT COUNT(*) as count FROM notifications WHERE userId=?", [uid]);
    return trpcResult({ items: items || [], unreadCount: ur[0]?.count || 0, total: tr[0]?.count || 0 });
  } catch (e) {
    console.error("[notification.history]", e.message);
    return trpcResult({ items: [], unreadCount: 0, total: 0 });
  }
}
__name(handleNotificationHistory, "handleNotificationHistory");
__name2(handleNotificationHistory, "handleNotificationHistory");
async function handleNotificationMarkRead(db, uid, input) {
  try {
    const r = await d1Run(db, "UPDATE notifications SET read=1 WHERE id=? AND userId=?", [input.id, uid]);
    if (r.meta.changes === 0) return trpcError("Notification not found or not owned", "FORBIDDEN");
    return trpcResult({ success: true });
  } catch (e) {
    console.error("[notification.markRead]", e.message);
    return trpcResult({ success: false });
  }
}
__name(handleNotificationMarkRead, "handleNotificationMarkRead");
__name2(handleNotificationMarkRead, "handleNotificationMarkRead");
async function handleNotificationMarkAllRead(db, uid) {
  try {
    await d1Run(db, "UPDATE notifications SET read=1 WHERE userId=?", [uid]);
    return trpcResult({ success: true });
  } catch (e) {
    console.error("[notification.markAllRead]", e.message);
    return trpcResult({ success: false });
  }
}
__name(handleNotificationMarkAllRead, "handleNotificationMarkAllRead");
__name2(handleNotificationMarkAllRead, "handleNotificationMarkAllRead");
async function handleWatchlistList(db, uid) {
  try {
    const { results } = await d1Query(db, "SELECT * FROM saved_areas WHERE userId=? ORDER BY createdAt DESC", [uid]);
    return trpcResult(results || []);
  } catch (e) {
    console.error("[watchlist.list]", e.message);
    return trpcResult([]);
  }
}
__name(handleWatchlistList, "handleWatchlistList");
__name2(handleWatchlistList, "handleWatchlistList");
async function handleWatchlistCreate(db, uid, input) {
  try {
    const { name, county, state, city, zipCode, lat, lng, alertRadius, alertEnabled } = input || {};
    const now = Math.floor(Date.now() / 1e3);
    const r = await d1Run(db, "INSERT INTO saved_areas (userId, name, county, state, city, zipCode, lat, lng, alertRadius, alertEnabled, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)", [uid, name, county || "", state || "", city || null, zipCode || null, lat || null, lng || null, alertRadius || 25, alertEnabled !== false ? 1 : 0, now]);
    return trpcResult({ id: r.meta.last_row_id || 0, name, county, state, alertEnabled: alertEnabled !== false });
  } catch (e) {
    console.error("[watchlist.create]", e.message);
    return trpcError(e.message);
  }
}
__name(handleWatchlistCreate, "handleWatchlistCreate");
__name2(handleWatchlistCreate, "handleWatchlistCreate");
async function handleWatchlistDelete(db, uid, input) {
  try {
    const r = await d1Run(db, "DELETE FROM saved_areas WHERE id=? AND userId=?", [input.id, uid]);
    if (r.meta.changes === 0) return trpcError("Watchlist not found or not owned", "FORBIDDEN");
    return trpcResult({ success: true });
  } catch (e) {
    console.error("[watchlist.delete]", e.message);
    return trpcResult({ success: false });
  }
}
__name(handleWatchlistDelete, "handleWatchlistDelete");
__name2(handleWatchlistDelete, "handleWatchlistDelete");
async function handleAlertList(db, uid) {
  try {
    const { results } = await d1Query(db, "SELECT id, name, type, criteria, frequency, is_active, created_at, provenance FROM alerts WHERE user_id=? ORDER BY created_at DESC", [uid]);
    return trpcResult({ alerts: results || [] });
  } catch (e) {
    console.error("[alert.list]", e.message);
    return trpcResult({ alerts: [] });
  }
}
__name(handleAlertList, "handleAlertList");
__name2(handleAlertList, "handleAlertList");
async function handleAlertCreate(db, uid, input) {
  try {
    const { name, type, criteria, frequency, is_active } = input || {};
    if (!name) return trpcError("Name is required", "BAD_REQUEST");
    const ent = await enforceEntitlement(db, uid, "alerts", 0);
    if (!ent.allowed) {
      return trpcError(ent.reason, "FORBIDDEN");
    }
    const { results: alertCount } = await d1Query(db, "SELECT COUNT(*) as cnt FROM alerts WHERE user_id = ?", [uid]);
    const currentAlerts = alertCount?.[0]?.cnt || 0;
    const ent2 = await enforceEntitlement(db, uid, "alerts", currentAlerts);
    if (!ent2.allowed) {
      return trpcError(ent2.reason, "FORBIDDEN");
    }
    const id = crypto.randomUUID();
    await d1Run(db, "INSERT INTO alerts (id, user_id, name, type, criteria, frequency, is_active, created_at, provenance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [id, uid, name, type || "search", criteria || "", frequency || "daily", is_active !== false ? 1 : 0, Math.floor(Date.now() / 1e3), "LIVE"]);
    return trpcResult({ id, name, type: type || "search", is_active: is_active !== false });
  } catch (e) {
    console.error("[alert.create]", e.message);
    return trpcError("Failed to create alert: " + e.message, "INTERNAL_SERVER_ERROR");
  }
}
__name(handleAlertCreate, "handleAlertCreate");
__name2(handleAlertCreate, "handleAlertCreate");
async function handleAlertDelete(db, uid, input) {
  try {
    const r = await d1Run(db, "DELETE FROM alerts WHERE id=? AND user_id=?", [input.id, uid]);
    if (r.meta.changes === 0) return trpcError("Alert not found or not owned", "FORBIDDEN");
    return trpcResult({ success: true });
  } catch (e) {
    console.error("[alert.delete]", e.message);
    return trpcResult({ success: false });
  }
}
__name(handleAlertDelete, "handleAlertDelete");
__name2(handleAlertDelete, "handleAlertDelete");
async function handleSearchSearch(db, input) {
  try {
    const { query, types, limit, offset, provenance } = input || {};
    if (!query || query.length < 2) return trpcResult({ results: [], total: 0, query: query || "", types: types || [] });
    if (query.length > 100) return trpcError("Query must be at most 100 characters", "BAD_REQUEST");
    const all = [];
    const tl = types || ["events", "patterns", "recommendations", "counties"];
    const q = "%" + query + "%";
    const lim = Math.min(Math.max(parseInt(limit) || 20, 1), 200);
    const off = Math.max(parseInt(offset) || 0, 0);
    const provFilter = provenance && ["LIVE", "SEED", "SAMPLE", "TEST", "SIMULATED"].includes(String(provenance).toUpperCase()) ? String(provenance).toUpperCase() : null;
    let totalEvents = 0, totalPatterns = 0, totalRecs = 0, totalCounties = 0;
    if (tl.includes("events")) {
      try {
        const provSql = provFilter ? "AND provenance = ?" : "AND provenance = 'LIVE'";
        const provParams = provFilter ? [q, q, q, q, q, q, q, q, q, q, q, provFilter, lim, off] : [q, q, q, q, q, q, q, q, q, q, q, lim, off];
        const { results } = await d1Query(db, "SELECT canonicalId as id, eventType, title, description, address, city, county, state, permitType, workClass, status, providerId, confidence, ingestedAt as createdAt, provenance FROM kestovar_canonical_events WHERE (title LIKE ? OR description LIKE ? OR address LIKE ? OR city LIKE ? OR county LIKE ? OR state LIKE ? OR permitType LIKE ? OR workClass LIKE ? OR eventType LIKE ? OR status LIKE ? OR providerId LIKE ?) " + provSql + " ORDER BY ingestedAt DESC LIMIT ? OFFSET ?", provParams);
        all.push(...(results || []).map((r) => ({ ...r, _type: "events" })));
        const countProvParams = provFilter ? [q, q, q, q, q, q, q, q, q, q, q, provFilter] : [q, q, q, q, q, q, q, q, q, q, q];
        const countRes = await d1Query(db, "SELECT COUNT(*) as cnt FROM kestovar_canonical_events WHERE (title LIKE ? OR description LIKE ? OR address LIKE ? OR city LIKE ? OR county LIKE ? OR state LIKE ? OR permitTyp