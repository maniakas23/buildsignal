import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  plan: text("plan"),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  plan: text("plan"),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const organizationMembers = sqliteTable("organization_members", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  userId: text("user_id").notNull().references(() => users.id),
  role: text("role").notNull().default("member"),
  createdAt: integer("created_at", { mode: "timestamp" }),
}, (table) => ({
  orgIdx: index("org_members_org_idx").on(table.organizationId),
  userIdx: index("org_members_user_idx").on(table.userId),
}));

export const watchlists = sqliteTable("watchlists", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const watchlistItems = sqliteTable("watchlist_items", {
  id: text("id").primaryKey(),
  watchlistId: text("watchlist_id").notNull().references(() => watchlists.id),
  countyId: text("county_id").notNull(),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
}, (table) => ({
  watchlistIdx: index("watchlist_items_watchlist_idx").on(table.watchlistId),
}));

export const counties = sqliteTable("counties", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  state: text("state").notNull(),
  fips: text("fips").notNull().unique(),
  population: integer("population"),
  growthRate: real("growth_rate"),
  permitCount: integer("permit_count").default(0),
  permitValue: real("permit_value"),
  signalScore: real("signal_score"),
  lat: real("lat"),
  lng: real("lng"),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
}, (table) => ({
  stateIdx: index("counties_state_idx").on(table.state),
  signalIdx: index("counties_signal_idx").on(table.signalScore),
}));

export const recommendations = sqliteTable("recommendations", {
  id: text("id").primaryKey(),
  countyId: text("county_id").notNull().references(() => counties.id),
  countyName: text("county_name").notNull(),
  state: text("state").notNull(),
  confidence: real("confidence").notNull(),
  type: text("type").notNull(),
  summary: text("summary").notNull(),
  details: text("details"),
  status: text("status").notNull().default("new"),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
}, (table) => ({
  countyIdx: index("recommendations_county_idx").on(table.countyId),
  statusIdx: index("recommendations_status_idx").on(table.status),
}));

export const intelligenceAlerts = sqliteTable("intelligence_alerts", {
  id: text("id").primaryKey(),
  severity: text("severity").notNull(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  countyId: text("county_id").references(() => counties.id),
  status: text("status").notNull().default("active"),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
}, (table) => ({
  severityIdx: index("alerts_severity_idx").on(table.severity),
  statusIdx: index("alerts_status_idx").on(table.status),
}));

export const customerFeedback = sqliteTable("customer_feedback", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  recommendationId: text("recommendation_id").references(() => recommendations.id),
  rating: integer("rating"),
  comment: text("comment"),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const samlProviders = sqliteTable("saml_providers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  domain: text("domain").notNull().unique(),
  entityId: text("entity_id").notNull(),
  acsUrl: text("acs_url").notNull(),
  metadataUrl: text("metadata_url"),
  certificate: text("certificate"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const ssoSessions = sqliteTable("sso_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  providerId: text("provider_id").notNull().references(() => samlProviders.id),
  sessionId: text("session_id").notNull().unique(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
});

export const ssoUsers = sqliteTable("sso_users", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  providerId: text("provider_id").notNull().references(() => samlProviders.id),
  externalId: text("external_id").notNull(),
  attributes: text("attributes"),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
}, (table) => ({
  uniqueIdx: index("sso_users_unique_idx").on(table.userId, table.providerId),
}));

export const subscriptionEvents = sqliteTable("subscription_events", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  stripeEventId: text("stripe_event_id").notNull().unique(),
  eventType: text("event_type").notNull(),
  payload: text("payload"),
  createdAt: integer("created_at", { mode: "timestamp" }),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  details: text("details"),
  ip: text("ip"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" }),
}, (table) => ({
  userIdx: index("audit_logs_user_idx").on(table.userId),
  createdAtIdx: index("audit_logs_created_idx").on(table.createdAt),
}));

export const analytics = sqliteTable("analytics", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  event: text("event").notNull(),
  properties: text("properties"),
  timestamp: integer("timestamp", { mode: "timestamp" }),
}, (table) => ({
  eventIdx: index("analytics_event_idx").on(table.event),
  timestampIdx: index("analytics_timestamp_idx").on(table.timestamp),
}));

export const errorLogs = sqliteTable("error_logs", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: text("user_id"),
  error: text("error").notNull(),
  stack: text("stack"),
  context: text("context"),
  createdAt: integer("created_at", { mode: "timestamp" }),
});

export const intelligenceReports = sqliteTable("intelligence_reports", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  type: text("type").notNull(),
  content: text("content").notNull(),
  counties: text("counties"),
  status: text("status").notNull().default("draft"),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});
