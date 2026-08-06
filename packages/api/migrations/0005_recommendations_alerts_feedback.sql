-- Migration: Recommendations, Alerts, and Feedback tables
-- Created: 2026-07-30

-- Intelligence alerts (user-configurable rules)
CREATE TABLE intelligence_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  organization_id INTEGER,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'system',
  conditions TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  active INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_intelligence_alerts_user ON intelligence_alerts(user_id);

-- Customer feedback (structured)
CREATE TABLE customer_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  organization_id INTEGER,
  category TEXT NOT NULL,
  rating INTEGER,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT,
  metadata TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_customer_feedback_user ON customer_feedback(user_id);
CREATE INDEX idx_customer_feedback_status ON customer_feedback(status);

-- Recommendations v2
CREATE TABLE recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recommendation_id TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  organization_id INTEGER,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata TEXT,
  expires_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_recommendations_user ON recommendations(user_id);
CREATE INDEX idx_recommendations_status ON recommendations(status);
