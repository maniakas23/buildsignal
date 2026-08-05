import { useState, useEffect, useCallback } from "react";

interface HealthCheckResult {
  isHealthy: boolean;
  latency: number;
  lastCheck: Date | null;
  error: string | null;
}

export function useHealthCheck(url: string, interval = 30000) {
  const [result, setResult] = useState<HealthCheckResult>({
    isHealthy: true,
    latency: 0,
    lastCheck: null,
    error: null,
  });

  const check = useCallback(async () => {
    const start = Date.now();
    try {
      const response = await fetch(url, { method: "HEAD", cache: "no-store" });
      const latency = Date.now() - start;
      setResult({
        isHealthy: response.ok,
        latency,
        lastCheck: new Date(),
        error: null,
      });
    } catch (err) {
      setResult({
        isHealthy: false,
        latency: Date.now() - start,
        lastCheck: new Date(),
        error: err instanceof Error ? err.message : "Health check failed",
      });
    }
  }, [url]);

  useEffect(() => {
    check();
    const id = setInterval(check, interval);
    return () => clearInterval(id);
  }, [check, interval]);

  return { ...result, check };
}
