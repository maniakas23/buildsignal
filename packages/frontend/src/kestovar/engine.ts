/**
 * Kestovar Engine Client — Stub (engine package removed in v5.4.7)
 * All data access now uses tRPC. This stub prevents import failures.
 */

export function isDemoMode() {
  // Production: Never in demo mode. Stub gracefully degrades when Kestovar is unavailable.
  return false;
}

export type EngineResponse<T = any> = { data: T; error: null } | { data: null; error: string };
export type EngineListResponse = { items: any[]; data: any[]; total: number; hasMore: boolean };
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type DashboardMetrics = any;
export type Recommendation = any;
export type SavedOpportunity = any;
export type OpportunityStatus = any;
export type PriorityLevel = any;
export class EngineError extends Error {}

const stubList = () => Promise.resolve({ items: [], data: [], total: 0, hasMore: false } as EngineListResponse);

export const fetchDashboard = async () => ({ data: { metrics: [] as any[], timestamp: new Date().toISOString() }, error: null });
export const fetchRecommendations = async () => ({ data: [] as any[], error: null });
export const fetchPatterns = stubList;
export const fetchProjects = stubList;
export const fetchAlerts = async () => ({ data: [] as any[], error: null });
export const fetchPortfolio = stubList;
export const fetchSummary = async () => ({ data: { content: '', generatedAt: new Date().toISOString(), metrics: [] }, error: null });
export const fetchGrowthStories = stubList;
export const formatRelativeTime = (date: string) => date;
export const fetchEngineEvents = async () => ({ data: [] as any[], error: null });

export const useEngine = () => {
  return { data: null, isLoading: false, error: null, refetch: () => {} };
};

export const useEnginePolling = () => {
  return { data: null, isLoading: false, error: null, refetch: () => {} };
};

export const useEngineInsights = () => {
  return { data: [] as any[], isLoading: false, error: null, refetch: () => {} };
};

export const useEngineProviders = () => {
  return { data: [] as any[], isLoading: false, error: null, refetch: () => {} };
};

export const useEngineStatus = () => {
  return { data: { status: 'unavailable', version: 'stub' }, isLoading: false, error: null };
};

export const useEngineHealth = () => {
  return { data: { status: 'unavailable' }, isLoading: false, error: null };
};

export const useEngineMetrics = () => {
  return { data: [] as any[], isLoading: false, error: null };
};

export const useEngineRecommendations = () => {
  return { data: [] as any[], isLoading: false, error: null };
};

export const useEngineLearning = () => {
  return { data: [] as any[], isLoading: false, error: null };
};

export const useEngineDeployments = () => {
  return { data: [] as any[], isLoading: false, error: null };
};

export const useEngineAlerts = () => {
  return { data: [] as any[], isLoading: false, error: null };
};
