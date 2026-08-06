-- Migration: Stripe billing setup
-- Created: 2026-05-15

-- Subscription events for Stripe webhook tracking
CREATE TABLE subscription_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  event TEXT NOT NULL,
  plan TEXT NOT NULL,
  amount INTEGER,
  stripe_event_id TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_subscription_events_user ON subscription_events(user_id);
CREATE INDEX idx_subscription_events_stripe ON subscription_events(stripe_event_id);

-- Update users table with Stripe customer ID
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE users ADD COLUMN current_period_end INTEGER;

CREATE INDEX idx_users_stripe ON users(stripe_customer_id);
