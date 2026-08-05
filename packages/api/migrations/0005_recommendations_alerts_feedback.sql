-- Migration 0005: Recommendations, Alerts, and Feedback tables
-- Build 108 / v5.4.7

-- Recommendations table (AI-generated opportunities)
CREATE TABLE IF NOT EXISTS recommendations (
  id TEXT PRIMARY KEY,
  county_id TEXT NOT NULL REFERENCES counties(id),
  county_name TEXT NOT NULL,
  state TEXT NOT NULL,
  confidence REAL NOT NULL,
  type TEXT NOT NULL,
  summary TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at INTEGER,
  updated_at INTEGER
);

CREATE INDEX IF NOT EXISTS recommendations_county_idx ON recommendations(county_id);
CREATE INDEX IF NOT EXISTS recommendations_status_idx ON recommendations(status);

-- Intelligence Alerts table (anomaly detection alerts)
CREATE TABLE IF NOT EXISTS intelligence_alerts (
  id TEXT PRIMARY KEY,
  severity TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  county_id TEXT REFERENCES counties(id),
  status TEXT NOT NULL DEFAULT 'active',
  created_at INTEGER,
  updated_at INTEGER
);

CREATE INDEX IF NOT EXISTS alerts_severity_idx ON intelligence_alerts(severity);
CREATE INDEX IF NOT EXISTS alerts_status_idx ON intelligence_alerts(status);

-- Customer Feedback table (user feedback on recommendations)
CREATE TABLE IF NOT EXISTS customer_feedback (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  recommendation_id TEXT REFERENCES recommendations(id),
  rating INTEGER,
  comment TEXT,
  created_at INTEGER,
  updated_at INTEGER
);

-- County Intelligence Reports table
CREATE TABLE IF NOT EXISTS intelligence_reports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  counties TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at INTEGER,
  updated_at INTEGER
);
