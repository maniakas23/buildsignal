import { mysqlTable, serial, varchar, int, text, timestamp, decimal, boolean, json, index } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  image: varchar("image", { length: 512 }),
  plan: varchar("plan", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const organizations = mysqlTable("organizations", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  plan: varchar("plan", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const organizationMembers = mysqlTable("organization_members", {
  id: varchar("id", { length: 36 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 36 }).notNull().references(() => organizations.id),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  role: varchar("role", { length: 50 }).notNull().default("member"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  orgIdx: index("org_members_org_idx").on(table.organizationId),
  userIdx: index("org_members_user_idx").on(table.userId),
}));

export const watchlists = mysqlTable("watchlists", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const watchlistItems = mysqlTable("watchlist_items", {
  id: varchar("id", { length: 36 }).primaryKey(),
  watchlistId: varchar("watchlist_id", { length: 36 }).notNull().references(() => watchlists.id),
  countyId: varchar("county_id", { length: 36 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  watchlistIdx: index("watchlist_items_watchlist_idx").on(table.watchlistId),
}));

export const counties = mysqlTable("counties", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  fips: varchar("fips", { length: 10 }).notNull().unique(),
  population: int("population"),
  growthRate: decimal("growth_rate", { precision: 5, scale: 2 }),
  permitCount: int("permit_count").default(0),
  permitValue: decimal("permit_value", { precision: 15, scale: 2 }),
  signalScore: decimal("signal_score", { precision: 5, scale: 2 }),
  lat: decimal("lat", { precision: 10, scale: 6 }),
  lng: decimal("lng", { precision: 10, scale: 6 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  stateIdx: index("counties_state_idx").on(table.state),
  signalIdx: index("counties_signal_idx").on(table.signalScore),
}));

export const recommendations = mysqlTable("recommendations", {
  id: varchar("id", { length: 36 }).primaryKey(),
  countyId: varchar("county_id", { length: 36 }).notNull().references(() => counties.id),
  countyName: varchar("county_name", { length: 255 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  summary: text("summary").notNull(),
  details: text("details"),
  status: varchar("status", { length: 50 }).notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  countyIdx: index("recommendations_county_idx").on(table.countyId),
  statusIdx: index("recommendations_status_idx").on(table.status),
}));

export const intelligenceAlerts = mysqlTable("intelligence_alerts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  severity: varchar("severity", { length: 50 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  countyId: varchar("county_id", { length: 36 }).references(() => counties.id),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  severityIdx: index("alerts_severity_idx").on(table.severity),
  statusIdx: index("alerts_status_idx").on(table.status),
}));

export const customerFeedback = mysqlTable("customer_feedback", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  recommendationId: varchar("recommendation_id", { length: 36 }).references(() => recommendations.id),
  rating: int("rating"),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const samlProviders = mysqlTable("saml_providers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }).notNull().unique(),
  entityId: varchar("entity_id", { length: 512 }).notNull(),
  acsUrl: varchar("acs_url", { length: 512 }).notNull(),
  metadataUrl: varchar("metadata_url", { length: 512 }),
  certificate: text("certificate"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ssoSessions = mysqlTable("sso_sessions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  providerId: varchar("provider_id", { length: 36 }).notNull().references(() => samlProviders.id),
  sessionId: varchar("session_id", { length: 255 }).notNull().unique(),
  active: boolean("active").notNull().default(true),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ssoUsers = mysqlTable("sso_users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  providerId: varchar("provider_id", { length: 36 }).notNull().references(() => samlProviders.id),
  externalId: varchar("external_id", { length: 255 }).notNull(),
  attributes: text("attributes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniqueIdx: index("sso_users_unique_idx").on(table.userId, table.providerId),
}));

export const subscriptionEvents = mysqlTable("subscription_events", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  stripeEventId: varchar("stripe_event_id", { length: 255 }).notNull().unique(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  payload: text("payload"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogs = mysqlTable("audit_logs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  resource: varchar("resource", { length: 255 }).notNull(),
  details: text("details"),
  ip: varchar("ip", { length: 45 }),
  userAgent: varchar("user_agent", { length: 512 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("audit_logs_user_idx").on(table.userId),
  createdAtIdx: index("audit_logs_created_idx").on(table.createdAt),
}));

export const analytics = mysqlTable("analytics", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  event: varchar("event", { length: 100 }).notNull(),
  properties: text("properties"),
  timestamp: timestamp("timestamp").defaultNow(),
}, (table) => ({
  eventIdx: index("analytics_event_idx").on(table.event),
  timestampIdx: index("analytics_timestamp_idx").on(table.timestamp),
}));

export const errorLogs = mysqlTable("error_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }),
  error: text("error").notNull(),
  stack: text("stack"),
  context: text("context"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const intelligenceReports = mysqlTable("intelligence_reports", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  content: text("content").notNull(),
  counties: text("counties"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
