ertFrequency = COALESCE(?, alertFrequency), updatedAt = datetime('now') WHERE id = ? AND userId = ?`).bind(name, description, counties ? JSON.stringify(counties) : null, alertEnabled, alertFrequency, id, userId).run();
  return trpcResult({ success: true });
}

// === PHASE 6: STRIPE CANCELLATION ===
async function handleStripeCancelSubscription(db, userId, env2) {
  if (!env2.STRIPE_SECRET_KEY) return trpcError("Stripe not configured", "NOT_CONFIGURED");
  const user = await db.prepare("SELECT stripeCustomerId, stripeSubscriptionId, plan FROM users WHERE id = ?").bind(userId).first();
  if (!user?.stripeSubscriptionId) return trpcError("No active subscription", "NOT_FOUND");
  const stripeRes = await fetch(`https://api.stripe.com/v1/subscriptions/${user.stripeSubscriptionId}`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${env2.STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "cancel_at_period_end=true"
  });
  if (!stripeRes.ok) {
    const err = await stripeRes.json();
    return trpcError(err.error?.message || "Failed to cancel subscription", "STRIPE_ERROR");
  }
  const sub = await stripeRes.json();
  await db.prepare("UPDATE users SET subscription_status = ?, updatedAt = datetime('now') WHERE id = ?").bind(sub.status, userId).run();
  await db.prepare("INSERT INTO subscription_events (userId, eventType, plan, stripeEventId, createdAt, provenance) VALUES (?, ?, ?, ?, datetime('now'), 'LIVE')").bind(userId, "subscription.cancel_scheduled", user.plan, sub.id).run();
  return trpcResult({ success: true, status: sub.status, cancelAtPeriodEnd: sub.cancel_at_period_end, currentPeriodEnd: sub.current_period_end });
}

// === PHASE 7: BILLING HISTORY ===
async function handleBillingHistory(db, userId, env2) {
  if (!env2.STRIPE_SECRET_KEY) return trpcError("Stripe not configured", "NOT_CONFIGURED");
  const user = await db.prepare("SELECT stripeCustomerId FROM users WHERE id = ?").bind(userId).first();
  if (!user?.stripeCustomerId) return trpcResult({ invoices: [] });
  const stripeRes = await fetch(`https://api.stripe.com/v1/invoices?customer=${user.stripeCustomerId}&limit=24`, {
    headers: { "Authorization": `Bearer ${env2.STRIPE_SECRET_KEY}` }
  });
  if (!stripeRes.ok) return trpcError("Failed to fetch billing history", "STRIPE_ERROR");
  const data = await stripeRes.json();
  const invoices = (data.data || []).map(inv => ({
    id: inv.id, number: inv.number, amount: inv.amount_due, currency: inv.currency,
    status: inv.status, created: inv.created, pdf: inv.invoice_pdf,
    hostedUrl: inv.hosted_invoice_url, periodStart: inv.period_start, periodEnd: inv.period_end,
  }));
  return trpcResult({ invoices });
}

// === PHASE 8: BILLING USAGE ===
async function handleBillingUsage(db, userId) {
  const user = await db.prepare("SELECT plan FROM users WHERE id = ?").bind(userId).first();
  const plan = user?.plan || 'free';
  const searches = await db.prepare("SELECT COUNT(*) as c FROM search_queries WHERE userId = ? AND createdAt > datetime('now', '-30 days')").bind(userId).first();
  const watchlists = await db.prepare("SELECT COUNT(*) as c FROM watchlists WHERE userId = ?").bind(userId).first();
  const alerts = await db.prepare("SELECT COUNT(*) as c FROM alerts WHERE userId = ?").bind(userId).first();
  const reports = await db.prepare("SELECT COUNT(*) as c FROM reports WHERE userId = ? AND createdAt > datetime('now', '-30 days')").bind(userId).first();
  const limits = { free: { counties: 1, alerts: 3, watchlists: 1, searches: 50 }, starter: { counties: 3, alerts: 10, watchlists: 5, searches: 500 }, scout: { counties: 3, alerts: 10, watchlists: 5, searches: 500 }, professional: { counties: 10, alerts: 50, watchlists: 20, searches: 5000 }, pro: { counties: 10, alerts: 50, watchlists: 20, searches: 5000 }, business: { counties: 999, alerts: 999, watchlists: 999, searches: 99999 }, enterprise: { counties: 999, alerts: 999, watchlists: 999, searches: 99999 } };
  const limit = limits[plan] || limits.free;
  return trpcResult({ plan, usage: { counties: { used: 0, allowed: limit.counties }, alerts: { used: alerts?.c || 0, allowed: limit.alerts }, watchlists: { used: watchlists?.c || 0, allowed: limit.watchlists }, searches: { used: searches?.c || 0, allowed: limit.searches }, reports: { used: reports?.c || 0, allowed: limit.searches } }, apiAccess: plan === 'business' || plan === 'enterprise', period: "current_month" });
}

// === PHASE 10: REPORT ROUTING ===
async function handleReportGenerate(db, userId, input) {
  const user = await db.prepare("SELECT plan FROM users WHERE id = ?").bind(userId).first();
  const allowedPlans = ['professional', 'pro', 'business', 'enterprise'];
  if (!allowedPlans.includes(user?.plan)) return trpcError("Report generation requires Pro or higher", "FORBIDDEN");
  const { type, filters, format } = input;
  const reportId = crypto.randomUUID();
  const now = new Date().toISOString();
  await db.prepare(`INSERT INTO reports (id, userId, type, filters, format, status, createdAt, provenance) VALUES (?, ?, ?, ?, ?, 'pending', ?, 'LIVE')`).bind(reportId, userId, type, JSON.stringify(filters), format, now).run();
  return trpcResult({ reportId, status: "pending", message: "Report generation started." });
}

async function handleReportList(db, userId) {
  const reports = await db.prepare("SELECT id, type, status, createdAt FROM reports WHERE userId = ? AND provenance = 'LIVE' ORDER BY createdAt DESC LIMIT 50").bind(userId).all();
  return trpcResult({ reports: reports.results || [] });
}

async function handleReportGet(db, userId, input) {
  const { id } = input;
  const report = await db.prepare("SELECT * FROM reports WHERE id = ? AND userId = ? AND provenance = 'LIVE'").bind(id, userId).first();
  if (!report) return trpcError("Report not found", "NOT_FOUND");
  return trpcResult(report);
}