import { sql } from "drizzle-orm";
import { text, integer, real, sqliteTable, primaryKey, uniqueIndex, index } from "drizzle-orm/sqlite-core";

// SQLite schema — mirrors schema.ts for D1 compatibility
// All JSON arrays stored as text columns with JSON.parse/JSON.stringify

export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  unionId: text("union_id").notNull().unique(),
  name: text("name"),
  avatar: text("avatar"),
  role: text("role", { enum: ["admin", "user", "enterprise"] }).notNull().default("user"),
  plan: text("plan", { enum: ["scout", "professional", "business", "enterprise"] }).notNull().default("scout"),
  orgId: integer("org_id"),
  workspaceId: integer("workspace_id"),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  lastSignInAt: text("last_sign_in_at"),
});

export const organizations = sqliteTable("organizations", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  logo: text("logo"),
  website: text("website"),
  plan: text("plan", { enum: ["scout", "professional", "business", "enterprise"] }).notNull().default("scout"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status", { enum: ["active", "canceled", "past_due", "incomplete"] }).default("incomplete"),
  subscriptionCurrentPeriodStart: text("subscription_current_period_start"),
  subscriptionCurrentPeriodEnd: text("subscription_current_period_end"),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const workspaces = sqliteTable("workspaces", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  orgId: integer("org_id").notNull(),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const counties = sqliteTable("counties", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  fips: text("fips").notNull().unique(),
  name: text("name").notNull(),
  state: text("state").notNull(),
  stateFips: text("state_fips"),
  population: integer("population"),
  medianIncome: integer("median_income"),
  permitVolume: integer("permit_volume"),
  permitGrowthRate: real("permit_growth_rate"),
  dataQualityScore: real("data_quality_score"),
  lastUpdated: text("last_updated").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const opportunities = sqliteTable("opportunities", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  county: text("county").notNull(),
  state: text("state").notNull(),
  type: text("type", { enum: ["permit", "planning", "infrastructure", "mixed"] }).notNull().default("permit"),
  volume: integer("volume").notNull().default(0),
  growthRate: real("growth_rate").notNull().default(0),
  confidence: real("confidence").notNull().default(0),
  status: text("status", { enum: ["active", "closed", "archived"] }).notNull().default("active"),
  orgId: integer("org_id"),
  workspaceId: integer("workspace_id"),
  createdBy: integer("created_by"),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  expiresAt: text("expires_at"),
});

export const watchlists = sqliteTable("watchlists", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  userId: integer("user_id").notNull(),
  counties: text("counties").notNull().default("[]"),
  alertsEnabled: integer("alerts_enabled", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const alerts = sqliteTable("alerts", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  opportunityId: integer("opportunity_id"),
  type: text("type", { enum: ["surge", "decline", "pattern", "data"] }).notNull(),
  severity: text("severity", { enum: ["critical", "high", "medium", "low"] }).notNull().default("medium"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const briefs = sqliteTable("briefs", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  period: text("period").notNull(),
  sources: text("sources").notNull().default("[]"),
  wordCount: integer("word_count"),
  tone: text("tone").default("professional"),
  format: text("format").default("executive"),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const subscriptionEvents = sqliteTable("subscription_events", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  event: text("event", { enum: ["subscribed", "cancelled", "updated", "payment_succeeded", "payment_failed"] }).notNull(),
  plan: text("plan").notNull(),
  amount: integer("amount"),
  metadata: text("metadata"),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const samlProviders = sqliteTable("saml_providers", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  orgId: integer("org_id").notNull(),
  name: text("name").notNull(),
  entityId: text("entity_id").notNull(),
  ssoUrl: text("sso_url").notNull(),
  certificate: text("certificate").notNull(),
  metadata: text("metadata"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("user_id"),
  orgId: integer("org_id"),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  details: text("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const feedback = sqliteTable("feedback", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  type: text("type", { enum: ["feature", "bug", "praise", "other"] }).notNull(),
  rating: integer("rating"),
  message: text("message").notNull(),
  page: text("page"),
  metadata: text("metadata"),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const dataSources = sqliteTable("data_sources", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type", { enum: ["government", "commercial", "proprietary"] }).notNull().default("government"),
  status: text("status", { enum: ["active", "inactive", "degraded"] }).notNull().default("active"),
  coverage: text("coverage").notNull().default("[]"),
  signalCount: integer("signal_count").notNull().default(0),
  lastUpdated: text("last_updated").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  latencyMs: integer("latency_ms"),
  errorRate: real("error_rate"),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const countyDataSources = sqliteTable("county_data_sources", {
  countyId: integer("county_id").notNull().references(() => counties.id),
  dataSourceId: integer("data_source_id").notNull().references(() => dataSources.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.countyId, t.dataSourceId] }),
}));

export const predictions = sqliteTable("predictions", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  countyId: integer("county_id").notNull(),
  metric: text("metric", { enum: ["permits", "volume", "value"] }).notNull().default("permits"),
  horizon: text("horizon", { enum: ["30d", "90d", "1y"] }).notNull().default("90d"),
  value: real("value").notNull(),
  confidence: real("confidence").notNull().default(0),
  modelVersion: text("model_version").notNull().default("1.0.0"),
  features: text("features").notNull().default("[]"),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const patterns = sqliteTable("patterns", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  formula: text("formula"),
  signalTypes: text("signal_types").notNull().default("[]"),
  industries: text("industries").notNull().default("[]"),
  avgLeadTimeDays: integer("avg_lead_time_days"),
  confidence: real("confidence").notNull().default(0),
  status: text("status", { enum: ["active", "inactive", "beta"] }).notNull().default("active"),
  maturity: real("maturity").notNull().default(0),
  aiWeight: real("ai_weight").notNull().default(0),
  historicalExamples: text("historical_examples").notNull().default("[]"),
  createdMatches: integer("created_matches").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const idxUsersUnionId = uniqueIndex("idx_users_union_id").on(users.unionId);
export const idxUsersOrgId = index("idx_users_org_id").on(users.orgId);
export const idxOpportunitiesCounty = index("idx_opportunities_county").on(opportunities.county, opportunities.state);
export const idxOpportunitiesStatus = index("idx_opportunities_status").on(opportunities.status);
export const idxOpportunitiesOrgId = index("idx_opportunities_org_id").on(opportunities.orgId);
export const idxAlertsUserId = index("idx_alerts_user_id").on(alerts.userId);
export const idxAlertsRead = index("idx_alerts_read").on(alerts.isRead);
export const idxWatchlistsUserId = index("idx_watchlists_user_id").on(watchlists.userId);
export const idxAuditLogsCreatedAt = index("idx_audit_logs_created_at").on(auditLogs.createdAt);
export const idxAuditLogsUserId = index("idx_audit_logs_user_id").on(auditLogs.userId);
export const idxAuditLogsOrgId = index("idx_audit_logs_org_id").on(auditLogs.orgId);
export const idxPredictionsCountyId = index("idx_predictions_county_id").on(predictions.countyId);
export const idxPredictionsHorizon = index("idx_predictions_horizon").on(predictions.horizon);
export const idxPatternsActive = index("idx_patterns_active").on(patterns.isActive);
export const idxPatternsStatus = index("idx_patterns_status").on(patterns.status);
