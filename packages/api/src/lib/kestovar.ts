/**
 * Kestovar Engine HTTP SDK — Stub (engine package removed in v5.4.7)
 * All data access now uses tRPC + D1. This stub prevents build failures.
 */

export interface KestovarDashboard {
  activeSignals: number;
  projectsTracked: number;
  patternsActive: number;
  alertsUnread: number;
  confidenceScore: number;
  zones: any[];
  recommendations: any[];
}

export interface KestovarProvider {
  id: string;
  name: string;
  type: string;
  status: string;
  healthScore: number;
  lastUpdated: string;
  description: string;
  state: string;
  county: string;
  projects: number;
  confidence: number;
  contact: any;
  data: any[];
}

export interface KestovarAlert {
  id: string;
  title: string;
  description: string;
  severity: string;
  type: string;
  status: string;
  location: string;
  timestamp: string;
  metrics: any;
  recommendations: any[];
}

export interface KestovarRecommendationQuality {
  overallAccuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  avgLatencyMs: number;
  samples: number;
  metrics: any[];
  details: any[];
  recentFeedback: any[];
  accuracyTrend: any[];
  learningMetrics: any[];
}

export interface KestovarProductStatus {
  id: string;
  name: string;
  status: string;
  confidence: number;
  lastUpdated: string;
  version: string;
  metrics: any[];
}

export class KestovarError extends Error {}

export async function getDashboard(): Promise<KestovarDashboard> {
  return getDemoDashboard();
}

export async function getProviders(): Promise<KestovarProvider[]> {
  return getDemoProviders();
}

export async function getAlerts(): Promise<KestovarAlert[]> {
  return getDemoAlerts();
}

export async function getRecommendationQuality(): Promise<KestovarRecommendationQuality> {
  return getDemoRecommendationQuality();
}

export async function getProductsStatus(): Promise<KestovarProductStatus[]> {
  return getDemoProductsStatus();
}

export async function checkEngineHealth(): Promise<{ status: "passed" | "degraded" | "failed"; latencyMs: number; detail?: string }> {
  return { status: "failed", latencyMs: 0, detail: "Engine package removed in v5.4.7" };
}

export async function sendFeedback(_input: any): Promise<{ success: boolean }> {
  return { success: true };
}

export function createKestovarEnv(): Record<string, unknown> {
  return {};
}

export function resetKestovarMetrics(): void {}

export function resetCircuitBreaker(): void {}

export function isDemoMode(): boolean {
  return true;
}

export function getDemoDashboard(): KestovarDashboard {
  return {
    activeSignals: 0,
    projectsTracked: 0,
    patternsActive: 0,
    alertsUnread: 0,
    confidenceScore: 0,
    zones: [],
    recommendations: [],
  };
}

export function getDemoProviders(): KestovarProvider[] {
  return [];
}

export function getDemoAlerts(): KestovarAlert[] {
  return [];
}

export function getDemoRecommendationQuality(): KestovarRecommendationQuality {
  return {
    overallAccuracy: 0,
    precision: 0,
    recall: 0,
    f1Score: 0,
    avgLatencyMs: 0,
    samples: 0,
    metrics: [],
    details: [],
    recentFeedback: [],
    accuracyTrend: [],
    learningMetrics: [],
  };
}

export function getDemoProductsStatus(): KestovarProductStatus[] {
  return [];
}
