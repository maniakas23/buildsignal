/**
 * BuildSignal v5.4.7 — Shared Type Definitions
 */

export type PlanId = "scout" | "professional" | "business" | "enterprise";

export interface BillingConfig {
  publishableKey: string;
  prices: Record<PlanId, string>;
  currency: string;
  plans: PlanConfig[];
}

export interface PlanConfig {
  id: PlanId;
  name: string;
  price: number;
  interval: "month" | "year";
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

export interface KestovarHealth {
  ok: boolean;
  latency: number;
  version: string;
  contractVersion: string;
  checks: Record<string, { status: string; latency: number }>;
}

export interface KestovarCapability {
  name: string;
  available: boolean;
  version?: string;
}

export interface KestovarCapabilitiesResponse {
  capabilities: Record<string, KestovarCapability>;
  contractVersion: string;
  apiVersion: string;
  timestamp: string;
}

export interface KestovarMetrics {
  requests: number;
  failures: number;
  timeouts: number;
  latency: number;
  circuitBreaker: {
    state: "closed" | "open" | "half-open";
    failures: number;
    lastFailure?: number;
  };
}

export interface SubscriptionStatus {
  status: "active" | "canceled" | "past_due" | "trialing" | "inactive";
  planId: PlanId | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  portalUrl: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  plan: PlanId | null;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: PlanId | null;
  createdAt: string;
  updatedAt: string;
}

export interface CountyData {
  id: string;
  name: string;
  state: string;
  fips: string;
  population: number;
  growthRate: number;
  permitCount: number;
  permitValue: number;
  signalScore: number;
  lat: number;
  lng: number;
  createdAt: string;
  updatedAt: string;
}

export interface Recommendation {
  id: string;
  countyId: string;
  countyName: string;
  state: string;
  confidence: number;
  type: string;
  summary: string;
  details: string;
  status: "new" | "saved" | "dismissed" | "acted";
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  severity: "critical" | "warning" | "info";
  category: string;
  title: string;
  message: string;
  countyId: string | null;
  status: "active" | "acknowledged" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface Pattern {
  id: string;
  name: string;
  description: string;
  confidence: number;
  type: string;
  counties: string[];
  createdAt: string;
}

export interface Correlation {
  id: string;
  name: string;
  description: string;
  strength: number;
  type: string;
  factors: string[];
  createdAt: string;
}

export interface KnowledgeNode {
  id: string;
  label: string;
  type: string;
  properties: Record<string, unknown>;
  createdAt: string;
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  properties: Record<string, unknown>;
  createdAt: string;
}

export type SAMLProvider = {
  id: string;
  name: string;
  domain: string;
  entityId: string;
  acsUrl: string;
  metadataUrl: string | null;
  certificate: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuditLog = {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
};

export type AnalyticsEvent = {
  id: string;
  userId: string | null;
  event: string;
  properties: string;
  timestamp: string;
};
