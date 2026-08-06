/**
 * Kestovar Engine Client — Stub (engine package removed in v5.4.7)
 * All data access now uses tRPC. This stub prevents import failures.
 *
 * Production: isDemoMode() returns false. The frontend gracefully degrades
 * when Kestovar is unavailable, showing empty states rather than fabricated data.
 */

export function isDemoMode() {
  // Production: Never in demo mode. Stub gracefully degrades when Kestovar is unavailable.
  return false;
}

export type EngineResponse = { data: any; error: null } | { data: null; error: string };
export type EngineListResponse = { items: any[]; total: number; hasMore: boolean };
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type DashboardMetrics = any;
export type Recommendation = any;
export type SavedOpportunity = any;
export type OpportunityStatus = any;
export type PriorityLevel = any;
export class EngineError extends Error {}

const stub = () => Promise.resolve({ items: [], total: 0, hasMore: false } as EngineListResponse);

export const fetchDashboard = async () => ({});
export const fetchRecommendations = async () => [];
export const fetchPatterns = stub;
export const fetchProjects = stub;
export const fetchAlerts = async () => [];
export const fetchPortfolio = stub;
export const fetchSummary = async () => ({ metrics: [], timestamp: new Date().toISOString() });
export const fetchGrowthStories = stub;
export const formatRelativeTime = (date: string) => date;
export const fetchEngineEvents = async () => [];

export const useEngine = () => {
  return {
    data: null,
    isLoading: false,
    error: null,
    refetch: () => {},
  };
};

export const useEnginePolling = () => {
  return {
    data: null,
    isLoading: false,
    error: null,
    refetch: () => {},
  };
};

export const useEngineInsights = () => {
  return {
    data: [],
    isLoading: false,
    error: null,
  };
};

export const useEngineProviders = () => {
  return {
    data: [],
    isLoading: false,
    error: null,
  };
};

export const useEngineStatus = () => {
  return {
    data: { status: 'unavailable', version: 'stub' },
    isLoading: false,
    error: null,
  };
};

export const useEngineHealth = () => {
  return {
    data: { status: 'unavailable' },
    isLoading: false,
    error: null,
  };
};

export const useEngineMetrics = () => {
  return {
    data: [],
    isLoading: false,
    error: null,
  };
};

export const useEngineRecommendations = () => {
  return {
    data: [],
    isLoading: false,
    error: null,
  };
};

export const useEngineLearning = () => {
  return {
    data: [],
    isLoading: false,
    error: null,
  };
};

export const useEngineDeployments = () => {
  return {
    data: [],
    isLoading: false,
    error: null,
  };
};

export const useEngineAlerts = () => {
  return {
    data: [],
    isLoading: false,
    error: null,
  };
};
