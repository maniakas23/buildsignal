import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getKestovarMetrics, getCircuitBreakerState, checkEngineHealth, checkEngineReady } from "./lib/kestovar";
import type { KestovarEnv } from "./lib/kestovar";

// ─── Alert Thresholds ───
// Defined as per Sprint 24 requirements
const THRESHOLDS = {
  readiness: { warning: 2, critical: 5 },
  api5xx: { warning: 0.01, critical: 0.05 },
  engineLatencyP95: { warning: 500, critical: 1000 },
  reportFailure: { warning: 0.02, critical: 0.05 },
  authFailure: { warningMultiplier: 2, criticalMultiplier: 4 },
  billingWebhook: { warning: 1, critical: 3 },
  frontendError: { warning: 0.01, critical: 0.03 },
};

// ─── In-memory metrics store (per-process; upgrade to Redis for multi-instance) ───
interface MetricEntry {
  timestamp: number;
  value: number;
  labels: string;
}

const metrics: Record<string, MetricEntry[]> = {};
const maxMetricsPerKey = 10000;

function recordMetric(name: string, value: number, labelStr = "") {
  if (!metrics[name]) metrics[name] = [];
  metrics[name].push({ timestamp: Date.now(), value, labels: labelStr });
  if (metrics[name].length > maxMetricsPerKey) {
    metrics[name] = metrics[name].slice(-maxMetricsPerKey);
  }
}

// ─── Router ───

export const monitoringRouter = createRouter({
  // Record a metric from frontend or backend
  record: authedQuery
    .input(z.object({
      name: z.string(),
      value: z.number(),
      labels: z.record(z.string(), z.string()).optional(),
    }))
    .mutation(({ input }) => {
      const labelStr = input.labels ? JSON.stringify(input.labels) : "";
      recordMetric(input.name, input.value, labelStr);
      return { recorded: true };
    }),

  // Get current metrics summary
  summary: authedQuery.query(() => {
    const summary: Record<string, { count: number; last: number | null; avg: number | null }> = {};
    for (const [name, entries] of Object.entries(metrics)) {
      if (entries.length === 0) continue;
      const values = entries.map((e) => e.value);
      summary[name] = {
        count: entries.length,
        last: entries[entries.length - 1]?.value ?? null,
        avg: values.reduce((a, b) => a + b, 0) / values.length,
      };
    }
    return summary;
  }),

  // Get alert thresholds
  thresholds: authedQuery.query(() => THRESHOLDS),

  // Check current alert status
  alerts: authedQuery.query(() => {
    const alerts: Array<{ metric: string; level: "warning" | "critical"; current: number; threshold: number }> = [];

    // Check readiness failures
    const readinessFails = metrics["readiness_failure"]?.length ?? 0;
    if (readinessFails >= THRESHOLDS.readiness.critical) {
      alerts.push({ metric: "readiness", level: "critical", current: readinessFails, threshold: THRESHOLDS.readiness.critical });
    } else if (readinessFails >= THRESHOLDS.readiness.warning) {
      alerts.push({ metric: "readiness", level: "warning", current: readinessFails, threshold: THRESHOLDS.readiness.warning });
    }

    // Check API 5xx rate
    const totalRequests = (metrics["api_request"]?.length ?? 0);
    const errorRequests = (metrics["api_5xx"]?.length ?? 0);
    if (totalRequests > 0) {
      const errorRate = errorRequests / totalRequests;
      if (errorRate >= THRESHOLDS.api5xx.critical) {
        alerts.push({ metric: "api_5xx_rate", level: "critical", current: errorRate, threshold: THRESHOLDS.api5xx.critical });
      } else if (errorRate >= THRESHOLDS.api5xx.warning) {
        alerts.push({ metric: "api_5xx_rate", level: "warning", current: errorRate, threshold: THRESHOLDS.api5xx.warning });
      }
    }

    // Check engine latency
    const latencies = metrics["engine_latency_ms"] ?? [];
    if (latencies.length > 0) {
      const sorted = [...latencies].sort((a, b) => a.value - b.value);
      const p95 = sorted[Math.floor(sorted.length * 0.95)]?.value ?? 0;
      if (p95 >= THRESHOLDS.engineLatencyP95.critical) {
        alerts.push({ metric: "engine_p95_latency", level: "critical", current: p95, threshold: THRESHOLDS.engineLatencyP95.critical });
      } else if (p95 >= THRESHOLDS.engineLatencyP95.warning) {
        alerts.push({ metric: "engine_p95_latency", level: "warning", current: p95, threshold: THRESHOLDS.engineLatencyP95.warning });
      }
    }

    return { alerts, thresholdConfig: THRESHOLDS };
  }),

  // ─── Kestovar Engine Metrics ───
  // Exposes circuit breaker state, latency, retries, timeouts from the typed client
  kestovar: adminQuery.query(async ({ ctx }) => {
    const cfEnv = ctx.env as Record<string, unknown>;
    const kEnv: KestovarEnv = {
      KESTOVAR: cfEnv.KESTOVAR as { fetch: (req: Request) => Promise<Response> } | undefined,
      KESTOVAR_API_URL: cfEnv.KESTOVAR_API_URL as string | undefined,
      KESTOVAR_API_KEY: cfEnv.KESTOVAR_API_KEY as string | undefined,
      INTERNAL_API_SECRET: cfEnv.INTERNAL_API_SECRET as string | undefined,
      APP_NAME: cfEnv.APP_NAME as string | undefined,
    };

    const [health, ready, metrics, circuit] = await Promise.all([
      checkEngineHealth(kEnv).catch(() => ({ status: "failed" as const, latencyMs: 0, detail: "Error" })),
      checkEngineReady(kEnv).catch(() => ({ ready: false, detail: "Error" })),
      getKestovarMetrics(),
      getCircuitBreakerState(),
    ]);

    return {
      health,
      ready,
      metrics,
      circuitBreaker: circuit,
    };
  }),
});

// ─── Export record function for use by other routers ───
export { recordMetric, THRESHOLDS };
