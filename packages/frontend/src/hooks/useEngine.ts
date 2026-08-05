import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";

interface EngineState {
  isOnline: boolean;
  isDegraded: boolean;
  lastCheck: Date | null;
  latency: number | null;
}

export function useEngine() {
  const [state, setState] = useState<EngineState>({
    isOnline: true,
    isDegraded: false,
    lastCheck: null,
    latency: null,
  });

  const { data, isError } = trpc.monitoring.kestovar.useQuery(undefined, {
    refetchInterval: 30000,
    retry: 2,
  });

  useEffect(() => {
    if (data) {
      setState({
        isOnline: data.status === "online" || data.status === "degraded",
        isDegraded: data.status === "degraded",
        lastCheck: new Date(),
        latency: data.latency || null,
      });
    } else if (isError) {
      setState((prev) => ({
        ...prev,
        isOnline: false,
        isDegraded: true,
        lastCheck: new Date(),
      }));
    }
  }, [data, isError]);

  return state;
}
