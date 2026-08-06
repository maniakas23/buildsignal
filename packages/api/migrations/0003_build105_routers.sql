-- Migration: Build 105 — Router expansion
-- Created: 2026-06-01

-- Add engine proxy tables for Kestovar integration
CREATE TABLE engine_proxy_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route TEXT NOT NULL,
  method TEXT NOT NULL,
  status INTEGER,
  latency_ms INTEGER,
  error TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_engine_proxy_route ON engine_proxy_logs(route);
CREATE INDEX idx_engine_proxy_created ON engine_proxy_logs(created_at);

-- Add notification preferences
ALTER TABLE users ADD COLUMN email_notifications INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN push_notifications INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN sms_notifications INTEGER DEFAULT 0;

-- Add watchlist sharing
ALTER TABLE watchlists ADD COLUMN shared_with TEXT;
ALTER TABLE watchlists ADD COLUMN public_access INTEGER DEFAULT 0;
