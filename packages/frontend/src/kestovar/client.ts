import { trpc } from "@/providers/trpc";

export interface KestovarClientOptions {
  enabled?: boolean;
  retryCount?: number;
  timeout?: number;
}

export function useKestovarClient(options: KestovarClientOptions = {}) {
  const { enabled = true, retryCount = 3 } = options;

  const health = trpc.monitoring.kestovar.useQuery(undefined, {
    enabled,
    refetchInterval: 30000,
    retry: retryCount,
  });

  const summary = trpc.monitoring.summary.useQuery(undefined, {
    enabled: enabled && health.data?.status === "online",
  });

  return {
    health: health.data,
    summary: summary.data,
    isLoading: health.isLoading || summary.isLoading,
    isError: health.isError || summary.isError,
    refetch: () => { health.refetch(); summary.refetch(); },
  };
}
