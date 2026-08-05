/**
 * Kestovar Engine integration for the frontend
 * Provides typed access to the Kestovar engine via tRPC
 */

import { trpc } from "@/providers/trpc";

export function useKestovarEngine() {
  const { data, isLoading, isError, refetch } = trpc.monitoring.kestovar.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const sendEvent = trpc.monitoring.sendEvent.useMutation();

  return {
    status: data,
    isLoading,
    isError,
    refetch,
    sendEvent: (event: { type: string; payload: Record<string, unknown> }) =>
      sendEvent.mutate(event),
  };
}
