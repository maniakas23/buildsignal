import { sql } from "drizzle-orm";
import { text, int, decimal, mysqlTable, primaryKey, uniqueIndex, index, varchar, timestamp, boolean, json, longtext } from "drizzle-orm/mysql-core";

// MySQL schema — mirrors schema.ts for MySQL compatibility (PlanetScale, etc.)
// JSON arrays use native JSON columns where supported

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  unionId: varchar("union_id", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  avatar: varchar("avatar", { length: 512 }),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  plan: varchar("plan", { length: 50 }).notNull().default("scout"),
  orgId: int("org_id"),
  workspaceId: int("workspace_id"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  lastSignInAt: timestamp("last_sign_in_at"),
});

export const organizations = mysqlTable("organizations", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  logo: varchar("logo", { length: 512 }),
  website: varchar("website", { length: 255 }),
  plan: varchar("plan", { length: 50 }).notNull().default("scout"),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  subscriptionStatus: varchar("subscription_status", { length: 50 }).default("incomplete"),
  subscriptionCurrentPeriodStart: timestamp("subscription_current_period_start"),
  subscriptionCurrentPeriodEnd: timestamp("subscription_current_period_end"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const workspaces = mysqlTable("workspaces", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  orgId: int("org_id").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const counties = mysqlTable("counties", {
  id: int("id").primaryKey().autoincrement(),
  fips: varchar("fips", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  stateFips: varchar("state_fips", { length: 10 }),
  population: int("population"),
  medianIncome: int("median_income"),
  permitVolume: int("permit_volume"),
  permitGrowthRate: decimal("permit_growth_rate", { precision: 5, scale: 2 }),
  dataQualityScore: decimal("data_quality_score", { precision: 5, scale: 2 }),
  lastUpdated: timestamp("last_updated").notNull().default(sql`CURRENT_TIMESTAMP`),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const opportunities = mysqlTable("opportunities", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  county: varchar("county", { length: 255 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  type: varchar("type", { length: 50 }).notNull().default("permit"),
  volume: int("volume").notNull().default(0),
  growthRate: decimal("growth_rate", { precision: 5, scale: 2 }).notNull().default("0.00"),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull().default("0.00"),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  orgId: int("org_id"),
  workspaceId: int("workspace_id"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  expiresAt: timestamp("expires_at"),
});

export const watchlists = mysqlTable("watchlists", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  userId: int("user_id").notNull(),
  counties: json("counties").notNull().default(sql`'[]'`),
  alertsEnabled: boolean("alerts_enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const alerts = mysqlTable("alerts", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  opportunityId: int("opportunity_id"),
  type: varchar("type", { length: 50 }).notNull(),
  severity: varchar("severity", { length: 50 }).notNull().default("medium"),
  title: varchar("title", { length: 255 }).notNull(),
  message: longtext("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const briefs = mysqlTable("briefs", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: longtext("content").notNull(),
  period: varchar("period", { length: 50 }).notNull(),
  sources: json("sources").notNull().default(sql`'[]'`),
  wordCount: int("word_count"),
  tone: varchar("tone", { length: 50 }).default("professional"),
  format: varchar("format", { length: 50 }).default("executive"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const subscriptionEvents = mysqlTable("subscription_events", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  event: varchar("event", { length: 50 }).notNull(),
  plan: varchar("plan", { length: 50 }).notNull(),
  amount: int("amount"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const samlProviders = mysqlTable("saml_providers", {
  id: int("id").primaryKey().autoincrement(),
  orgId: int("org_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  entityId: varchar("entity_id", { length: 512 }).notNull(),
  ssoUrl: varchar("sso_url", { length: 512 }).notNull(),
  certificate: longtext("certificate").notNull(),
  metadata: longtext("metadata"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id"),
  orgId: int("org_id"),
  action: varchar("action", { length: 255 }).notNull(),
  resource: varchar("resource", { length: 255 }).notNull(),
  details: json("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 512 }),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const feedback = mysqlTable("feedback", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  rating: int("rating"),
  message: longtext("message").notNull(),
  page: varchar("page", { length: 255 }),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const dataSources = mysqlTable("data_sources", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull().default("government"),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  coverage: json("coverage").notNull().default(sql`'[]'`),
  signalCount: int("signal_count").notNull().default(0),
  lastUpdated: timestamp("last_updated").notNull().default(sql`CURRENT_TIMESTAMP`),
  latencyMs: int("latency_ms"),
  errorRate: decimal("error_rate", { precision: 5, scale: 4 }),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const countyDataSources = mysqlTable("county_data_sources", {
  countyId: int("county_id").notNull().references(() => counties.id),
  dataSourceId: int("data_source_id").notNull().references(() => dataSources.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.countyId, t.dataSourceId] }),
}));

export const predictions = mysqlTable("predictions", {
  id: int("id").primaryKey().autoincrement(),
  countyId: int("county_id").notNull(),
  metric: varchar("metric", { length: 50 }).notNull().default("permits"),
  horizon: varchar("horizon", { length: 50 }).notNull().default("90d"),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull().default("0.00"),
  modelVersion: varchar("model_version", { length: 50 }).notNull().default("1.0.0"),
  features: json("features").notNull().default(sql`'[]'`),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const patterns = mysqlTable("patterns", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  formula: varchar("formula", { length: 512 }),
  signalTypes: json("signal_types").notNull().default(sql`'[]'`),
  industries: json("industries").notNull().default(sql`'[]'`),
  avgLeadTimeDays: int("avg_lead_time_days"),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull().default("0.00"),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  maturity: decimal("maturity", { precision: 5, scale: 2 }).notNull().default("0.00"),
  aiWeight: decimal("ai_weight", { precision: 5, scale: 2 }).notNull().default("0.00"),
  historicalExamples: json("historical_examples").notNull().default(sql`'[]'`),
  createdMatches: int("created_matches").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
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
