import { mysqlTable, serial, varchar, text, timestamp, json, int, mysqlEnum, bigint } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  avatar: varchar("avatar", { length: 500 }),
  role: mysqlEnum("role", ["user", "admin", "superadmin"]).default("user").notNull(),
  plan: mysqlEnum("plan", ["scout", "professional", "business", "enterprise"]).default("scout").notNull(),
  emailVerified: timestamp("emailVerified"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;

export const signals = mysqlTable("signals", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  county: varchar("county", { length: 255 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  signalType: mysqlEnum("signalType", ["permit", "zoning", "utility", "budget", "contract", "meeting", "news", "social"]).notNull(),
  confidence: int("confidence").notNull(),
  evidence: json("evidence"),
  status: mysqlEnum("status", ["active", "archived", "invalidated"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Signal = typeof signals.$inferSelect;

export const signalEvents = mysqlTable("signal_events", {
  id: serial("id").primaryKey(),
  signalId: bigint("signalId", { mode: "number", unsigned: true }).notNull(),
  event: mysqlEnum("event", ["created", "viewed", "exported", "shared", "followed", "alerted", "invalidated", "confirmed"]).notNull(),
  userId: bigint("userId", { mode: "number", unsigned: true }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SignalEvent = typeof signalEvents.$inferSelect;

export const feedback = mysqlTable("feedback", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  type: mysqlEnum("type", ["thumbs_up", "thumbs_down", "report_inaccurate", "feature_request", "bug_report", "general"]).notNull(),
  message: text("message"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Feedback = typeof feedback.$inferSelect;

export const subscriptionEvents = mysqlTable("subscription_events", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  event: mysqlEnum("event", ["trial_started", "trial_expired", "subscribed", "upgraded", "downgraded", "cancelled", "payment_failed", "payment_succeeded"]).notNull(),
  plan: mysqlEnum("plan", ["scout", "professional", "business", "enterprise"]).notNull(),
  amount: int("amount"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SubscriptionEvent = typeof subscriptionEvents.$inferSelect;

export const mapMarkers = mysqlTable("map_markers", {
  id: serial("id").primaryKey(),
  type: mysqlEnum("type", ["project", "permit", "zoning", "utility", "hotspot"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  county: varchar("county", { length: 255 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  lat: varchar("lat", { length: 20 }).notNull(),
  lng: varchar("lng", { length: 20 }).notNull(),
  confidence: int("confidence").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type MapMarker = typeof mapMarkers.$inferSelect;
