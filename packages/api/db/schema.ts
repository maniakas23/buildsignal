/**
 * SQLite/D1-compatible schema — mirrors db/schema.ts exactly.
 * All column names match the MySQL schema for code compatibility.
 */

import { sqliteTable, integer, text, real, uniqueIndex } from "drizzle-orm/sqlite-core";

// ─── Users ───
export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  unionId: text("unionId").notNull(),
  orgId: integer("orgId"),
  name: text("name"),
  email: text("email"),
  avatar: text("avatar"),
  plan: text("plan").notNull().default("starter"),
  role: text("role").notNull().default("user"),
  isAdmin: integer("isAdmin", { mode: "boolean" }).default(false),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (t) => [uniqueIndex("users_union_idx").on(t.unionId)]);

export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// ─── Saved Areas ───
export const savedAreas = sqliteTable("saved_areas", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  name: text("name").notNull(),
  county: text("county").notNull(),
  state: text("state").notNull(),
  city: text("city"),
  zipCode: text("zipCode"),
  lat: text("lat"),
  lng: text("lng"),
  alertRadius: integer("alertRadius").default(25),
  alertEnabled: integer("alertEnabled", { mode: "boolean" }).default(true),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Notifications ───
export const notifications = sqliteTable("notifications", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: integer("read", { mode: "boolean" }).default(false),
  actionUrl: text("actionUrl"),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Feedback ───
export const feedback = sqliteTable("feedback", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId"),
  type: text("type").notNull(),
  message: text("message").notNull(),
  rating: integer("rating"),
  page: text("page"),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Subscription Events ───
export const subscriptionEvents = sqliteTable("subscription_events", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  event: text("event").notNull(),
  plan: text("plan").notNull(),
  amount: integer("amount"),
  stripeEventId: text("stripeEventId"),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Map Markers ───
export const mapMarkers = sqliteTable("map_markers", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  projectId: text("projectId"),
  county: text("county"),
  state: text("state"),
  city: text("city"),
  lat: real("lat"),
  lng: real("lng"),
  type: text("type"),
  score: integer("score").default(0),
  projectName: text("projectName"),
  description: text("description"),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Kestovar Providers ───
export const signalcoreProviders = sqliteTable("signalcore_providers", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("active"),
  enabled: integer("enabled", { mode: "boolean" }).default(true),
  config: text("config"),
  pollIntervalMinutes: integer("pollIntervalMinutes").default(60),
  circuitState: text("circuitState").default("closed"),
  circuitBreakerState: text("circuitBreakerState").default("closed"),
  circuitFailures: integer("circuitFailures").default(0),
  consecutiveFailures: integer("consecutiveFailures").default(0),
  circuitLastFailure: integer("circuitLastFailure", { mode: "timestamp" }),
  totalPolls: integer("totalPolls").default(0),
  totalSuccesses: integer("totalSuccesses").default(0),
  totalFailures: integer("totalFailures").default(0),
  totalRecordsRetrieved: integer("totalRecordsRetrieved").default(0),
  totalRecordsAccepted: integer("totalRecordsAccepted").default(0),
  totalRecordsRejected: integer("totalRecordsRejected").default(0),
  avgLatencyMs: integer("avgLatencyMs").default(0),
  lastPollAt: integer("lastPollAt", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Kestovar Provider Polls ───
export const signalcoreProviderPolls = sqliteTable("signalcore_provider_polls", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  providerId: integer("providerId").notNull(),
  status: text("status").notNull(),
  startedAt: integer("startedAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  completedAt: integer("completedAt", { mode: "timestamp" }),
  recordsRetrieved: integer("recordsRetrieved").default(0),
  recordsAccepted: integer("recordsAccepted").default(0),
  recordsRejected: integer("recordsRejected").default(0),
  recordsDuplicated: integer("recordsDuplicated").default(0),
  latencyMs: integer("latencyMs").default(0),
  retryCount: integer("retryCount").default(0),
  errorMessage: text("errorMessage"),
});

// ─── Kestovar Events ───
export const signalcoreEvents = sqliteTable("signalcore_events", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  providerId: integer("providerId").notNull(),
  externalId: text("externalId"),
  eventType: text("eventType").notNull(),
  title: text("title"),
  description: text("description"),
  county: text("county"),
  state: text("state"),
  city: text("city"),
  zipCode: text("zipCode"),
  lat: text("lat"),
  lng: text("lng"),
  address: text("address"),
  sourceUrl: text("sourceUrl"),
  sourceSystem: text("sourceSystem"),
  publishedAt: integer("publishedAt", { mode: "timestamp" }),
  ingestedAt: integer("ingestedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  confidence: integer("confidence").default(50).notNull(),
  status: text("status").notNull().default("ingested"),
  validationErrors: text("validationErrors"),
  contentHash: text("contentHash"),
  rawData: text("rawData"),
  normalizedData: text("normalizedData"),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
export type KestovarEvent = typeof signalcoreEvents.$inferSelect;

// ─── Kestovar Patterns ───
export const signalcorePatterns = sqliteTable("signalcore_patterns", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  patternType: text("patternType").notNull(),
  description: text("description"),
  county: text("county"),
  state: text("state"),
  lat: text("lat"),
  lng: text("lng"),
  confidence: integer("confidence").default(0).notNull(),
  evidenceCount: integer("evidenceCount").default(0).notNull(),
  status: text("status").notNull().default("active"),
  firstDetectedAt: integer("firstDetectedAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  lastDetectedAt: integer("lastDetectedAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  summary: text("summary"),
  recommendedAction: text("recommendedAction"),
  impactScore: integer("impactScore"),
  geographicReach: text("geographicReach"),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
export type KestovarPattern = typeof signalcorePatterns.$inferSelect;

// ─── Kestovar Pattern Evidence ───
export const signalcorePatternEvidence = sqliteTable("signalcore_pattern_evidence", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  patternId: integer("patternId").notNull(),
  eventId: integer("eventId").notNull(),
  evidenceType: text("evidenceType").default("supporting"),
  weight: integer("weight").default(1),
  notes: text("notes"),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Kestovar Recommendations ───
export const signalcoreRecommendations = sqliteTable("signalcore_recommendations", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  patternId: integer("patternId").notNull(),
  status: text("status").notNull().default("pending"),
  priority: integer("priority").default(50),
  confidenceScore: integer("confidenceScore").notNull(),
  trustScore: integer("trustScore").notNull(),
  targetProduct: text("targetProduct").notNull(),
  jurisdiction: text("jurisdiction"),
  summary: text("summary").notNull(),
  rationale: text("rationale"),
  suggestedActions: text("suggestedActions"),
  marketSizeEstimate: integer("marketSizeEstimate"),
  competitiveLandscape: text("competitiveLandscape"),
  timelineEstimate: text("timelineEstimate"),
  generatedAt: integer("generatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  deliveredAt: integer("deliveredAt", { mode: "timestamp" }),
  deliveryResult: text("deliveryResult"),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
export type KestovarRecommendation = typeof signalcoreRecommendations.$inferSelect;

// ─── Kestovar Recommendation Evidence ───
export const signalcoreRecommendationEvidence = sqliteTable("signalcore_recommendation_evidence", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  recommendationId: integer("recommendationId").notNull(),
  evidenceType: text("evidenceType").notNull(),
  source: text("source").notNull(),
  detail: text("detail"),
  weight: integer("weight").default(1),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Kestovar Deliveries ───
export const signalcoreDeliveries = sqliteTable("signalcore_deliveries", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  recommendationId: integer("recommendationId").notNull(),
  product: text("product").notNull(),
  status: text("status").notNull().default("queued"),
  deliveryMethod: text("deliveryMethod").default("api"),
  payload: text("payload"),
  response: text("response"),
  deliveredAt: integer("deliveredAt", { mode: "timestamp" }),
  confirmedAt: integer("confirmedAt", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Kestovar Telemetry ───
export const signalcoreTelemetry = sqliteTable("signalcore_telemetry", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  component: text("component").notNull(),
  stage: text("stage").default("unknown"),
  metricName: text("metricName").notNull(),
  metricValue: integer("metricValue").notNull(),
  unit: text("unit").default("count"),
  recordedAt: integer("recordedAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Kestovar Feedback ───
export const signalcoreFeedback = sqliteTable("signalcore_feedback", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  recommendationId: integer("recommendationId").notNull(),
  feedbackType: text("feedbackType").notNull(),
  comment: text("comment"),
  userId: integer("userId"),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Beta Feedback Events ───
export const betaFeedbackEvents = sqliteTable("beta_feedback_events", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId"),
  eventType: text("eventType").notNull(),
  entityId: text("entityId"),
  entityType: text("entityType"),
  metadata: text("metadata"),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Watchlists ───
export const watchlists = sqliteTable("watchlists", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  counties: text("counties").notNull(), // JSON array of {county, state}
  alertEnabled: integer("alertEnabled", { mode: "boolean" }).default(true),
  alertFrequency: text("alertFrequency").default("daily"), // daily, weekly, instant
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ═══════════════════════════════════════════════════════════════
// SPRINT 4 — Notifications, Webhooks, Exports, Advanced Search
// ═══════════════════════════════════════════════════════════════

// ─── Email Preferences ───
export const emailPreferences = sqliteTable("email_preferences", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  email: text("email").notNull(),
  verified: integer("verified", { mode: "boolean" }).default(false),
  dailyDigest: integer("dailyDigest", { mode: "boolean" }).default(true),
  weeklyReport: integer("weeklyReport", { mode: "boolean" }).default(true),
  newOpportunities: integer("newOpportunities", { mode: "boolean" }).default(true),
  alertMatches: integer("alertMatches", { mode: "boolean" }).default(true),
  systemUpdates: integer("systemUpdates", { mode: "boolean" }).default(false),
  marketing: integer("marketing", { mode: "boolean" }).default(false),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Email Queue (for async delivery) ───
export const emailQueue = sqliteTable("email_queue", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  toEmail: text("toEmail").notNull(),
  subject: text("subject").notNull(),
  bodyHtml: text("bodyHtml"),
  bodyText: text("bodyText"),
  template: text("template"), // opportunity_alert, daily_digest, weekly_report, system_update
  status: text("status").notNull().default("pending"), // pending, sent, failed, retrying
  retryCount: integer("retryCount").default(0),
  lastError: text("lastError"),
  sentAt: integer("sentAt", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Webhook Subscriptions ───
export const webhookSubscriptions = sqliteTable("webhook_subscriptions", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  orgId: integer("orgId").notNull(),
  userId: integer("userId").notNull(),
  url: text("url").notNull(),
  secret: text("secret"), // HMAC signing secret
  events: text("events").notNull(), // JSON array: ["opportunity.created", "alert.triggered", "report.generated"]
  active: integer("active", { mode: "boolean" }).default(true),
  description: text("description"),
  lastDeliveredAt: integer("lastDeliveredAt", { mode: "timestamp" }),
  lastStatus: text("lastStatus"), // 200, 404, timeout, etc.
  failureCount: integer("failureCount").default(0),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Webhook Delivery Logs ───
export const webhookDeliveries = sqliteTable("webhook_deliveries", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  subscriptionId: integer("subscriptionId").notNull(),
  eventType: text("eventType").notNull(),
  payload: text("payload").notNull(), // JSON payload sent
  responseStatus: integer("responseStatus"),
  responseBody: text("responseBody"),
  headers: text("headers"), // JSON response headers
  signature: text("signature"),
  durationMs: integer("durationMs"),
  success: integer("success", { mode: "boolean" }).default(false),
  retryCount: integer("retryCount").default(0),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Export Jobs ───
export const exportJobs = sqliteTable("export_jobs", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  orgId: integer("orgId"),
  name: text("name").notNull(),
  format: text("format").notNull(), // csv, json, xlsx
  entityType: text("entityType").notNull(), // opportunities, counties, providers, recommendations, watchlists
  filters: text("filters"), // JSON serialized filters
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  rowCount: integer("rowCount"),
  fileUrl: text("fileUrl"), // R2 URL or signed URL
  fileSize: integer("fileSize"),
  error: text("error"),
  expiresAt: integer("expiresAt", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  completedAt: integer("completedAt", { mode: "timestamp" }),
});

// ─── Search Index (for advanced full-text search) ───
export const searchIndex = sqliteTable("search_index", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  entityType: text("entityType").notNull(), // opportunity, county, provider, pattern, recommendation
  entityId: text("entityId").notNull(),
  title: text("title"),
  content: text("content").notNull(), // searchable text
  tags: text("tags"), // JSON array of tags
  metadata: text("metadata"), // JSON extra fields
  score: integer("score").default(0), // relevance/boost score
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Intelligence Alerts (user-configurable alert rules) ───
export const intelligenceAlerts = sqliteTable("intelligence_alerts", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  organizationId: integer("organizationId"),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull().default("system"), // system, watchlist, provider, custom
  conditions: text("conditions").notNull(), // JSON: {field, operator, value}
  severity: text("severity").default("medium"), // low, medium, high, critical
  active: integer("active", { mode: "boolean" }).default(true),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Customer Feedback (structured) ───
export const customerFeedback = sqliteTable("customer_feedback", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  organizationId: integer("organizationId"),
  category: text("category").notNull(), // feature, bug, ux, billing, other
  rating: integer("rating"), // 1-5
  title: text("title").notNull(),
  body: text("body").notNull(),
  url: text("url"), // page URL where feedback was submitted
  metadata: text("metadata"), // JSON extra context
  status: text("status").notNull().default("open"), // open, acknowledged, resolved, closed
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Recommendations (v2) ───
export const recommendations = sqliteTable("recommendations", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  recommendationId: text("recommendationId").notNull(), // external ID from engine
  userId: integer("userId").notNull(),
  organizationId: integer("organizationId"),
  type: text("type").notNull(), // product, strategy, action
  title: text("title").notNull(),
  description: text("description").notNull(),
  confidence: integer("confidence").default(0),
  priority: integer("priority").default(50),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected, implemented
  metadata: text("metadata"), // JSON
  expiresAt: integer("expiresAt", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── SAML Providers (for SSO) ───
export const samlProviders = sqliteTable("saml_providers", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  orgId: integer("orgId").notNull(),
  name: text("name").notNull(),
  entityId: text("entityId").notNull(),
  ssoUrl: text("ssoUrl").notNull(),
  certificate: text("certificate").notNull(),
  active: integer("active", { mode: "boolean" }).default(true),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── SSO Sessions ───
export const ssoSessions = sqliteTable("sso_sessions", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  providerId: integer("providerId").notNull(),
  sessionId: text("sessionId").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── SSO Users (linked to SAML) ───
export const ssoUsers = sqliteTable("sso_users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  providerId: integer("providerId").notNull(),
  externalId: text("externalId").notNull(),
  email: text("email").notNull(),
  name: text("name"),
  active: integer("active", { mode: "boolean" }).default(true),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
