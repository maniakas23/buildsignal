-- Migration: v5.3 — Tenant security foundations
-- Created: 2026-05-08

-- Add tenant_id to existing tables for multi-tenancy
ALTER TABLE users ADD COLUMN tenant_id INTEGER;
ALTER TABLE saved_areas ADD COLUMN tenant_id INTEGER;
ALTER TABLE feedback ADD COLUMN tenant_id INTEGER;

-- Create tenant isolation index
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_saved_areas_tenant ON saved_areas(tenant_id);
CREATE INDEX idx_feedback_tenant ON feedback(tenant_id);

-- Add org_id foreign key references
ALTER TABLE users ADD COLUMN org_id INTEGER REFERENCES organizations(id);

-- Update existing rows to have a default tenant (legacy migration)
UPDATE users SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE saved_areas SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE feedback SET tenant_id = 1 WHERE tenant_id IS NULL;
