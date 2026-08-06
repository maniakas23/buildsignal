import { mysqlTable, mysqlEnum, int, varchar, timestamp, boolean, json, text, index, primaryKey, uniqueIndex, check } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  plan: mysqlEnum("plan", ["scout", "professional", "business", "enterprise"]).notNull().default("scout"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  plan: mysqlEnum("plan", ["scout", "professional", "business", "enterprise"]).notNull().default("scout"),
  maxMembers: int("max_members").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const subscriptionEvents = mysqlTable("subscription_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  event: varchar("event", { length: 50 }).notNull(),
  plan: mysqlEnum("plan", ["scout", "professional", "business", "enterprise"]).notNull(),
  amount: int("amount"),
  stripeEventId: varchar("stripe_event_id", { length: 255 }),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Organization = typeof organizations.$inferSelect;
export type SubscriptionEvent = typeof subscriptionEvents.$inferSelect;
