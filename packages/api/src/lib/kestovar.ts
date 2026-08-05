import { KestovarError } from "../contracts/errors";
import { KESTOVAR_CONTRACT_VERSION, KESTOVAR_DEFAULT_TIMEOUT, KESTOVAR_RETRY_ATTEMPTS, KESTOVAR_RETRY_BACKOFF_MS, KESTOVAR_CIRCUIT_BREAKER_THRESHOLD, KESTOVAR_CIRCUIT_BREAKER_RECOVERY_MS } from "../contracts/constants";
import type { KestovarHealth, KestovarCapabilitiesResponse, KestovarMetrics } from "../contracts/types";

export interface KestovarEnv {
  health(): Promise<KestovarHealth>;
  ready(): Promise<{ ok: boolean; checks: Record<string, any> }>;
  version(): Promise<{ version: string; contract: string }>;
  capabilities(): Promise<KestovarCapabilitiesResponse>;
  dashboard(): Promise<any>;
  providers(): Promise<any>;
  alerts(): Promise<any>;
  recommendations(): Promise<any>;
  events(body: any): Promise<any>;
  batchEvents(body: any): Promise<any>;
  generateRecommendation(body: any): Promise<any>;
  analyzePatterns(body: any): Promise<any>;
  analyzeCorrelations(body: any): Promise<any>;
  knowledge(body: any): Promise<any>;
  commands(body: any): Promise<any>;
  feedback(body: any): Promise<any>;
  getMetrics(): KestovarMetrics;
  resetCircuitBreaker(): void;
  resetMetrics(): void;
}

class CircuitBreaker {
  state: "closed" | "open" | "half-open" = "closed";
  failures = 0;
  lastFailure?: number;

  recordSuccess() {
    this.failures = 0;
    this.state = "closed";
  }

  recordFailure() {
    this.failures++;
    this.lastFailure = Date.now();
    if (this.failures >= KESTOVAR_CIRCUIT_BREAKER_THRESHOLD) {
      this.state = "open";
    }
  }

  canAttempt(): boolean {
    if (this.state === "closed") return true;
    if (this.state === "open") {
      const elapsed = Date.now() - (this.lastFailure || 0);
      if (elapsed > KESTOVAR_CIRCUIT_BREAKER_RECOVERY_MS) {
        this.state = "half-open";
        return true;
      }
      return false;
    }
    return true; // half-open
  }

  reset() {
    this.state = "closed";
    this.failures = 0;
    this.lastFailure = undefined;
  }
}

let metrics: KestovarMetrics = {
  requests: 0,
  failures: 0,
  timeouts: 0,
  latency: 0,
  circuitBreaker: {
    state: "closed",
    failures: 0,
  },
};

const circuitBreaker = new CircuitBreaker();

async function kestovarFetch(env: any, path: string, init?: RequestInit): Promise<any> {
  if (!circuitBreaker.canAttempt()) {
    throw new KestovarError("Kestovar circuit breaker is open", "CIRCUIT_OPEN");
  }

  metrics.requests++;
  const start = Date.now();
  const requestId = crypto.randomUUID();
  const correlationId = crypto.randomUUID();

  const headers = {
    "X-API-Key": env.KESTOVAR_API_KEY,
    "X-BuildSignal-Internal": "true",
    "X-Request-ID": requestId,
    "X-Correlation-ID": correlationId,
    "X-Product-Name": env.APP_NAME,
    "X-API-Contract-Version": KESTOVAR_CONTRACT_VERSION,
    ...(init?.headers || {}),
  };

  const url = env.KESTOVAR_API_URL ? `${env.KESTOVAR_API_URL}${path}` : `https://api.kestovar.buildsignal.net${path}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), KESTOVAR_DEFAULT_TIMEOUT);

    const response = await fetch(url, {
      ...init,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const latency = Date.now() - start;
    metrics.latency = (metrics.latency * (metrics.requests - 1) + latency) / metrics.requests;

    if (!response.ok) {
      circuitBreaker.recordFailure();
      metrics.failures++;
      throw new KestovarError(`Kestovar returned ${response.status}: ${response.statusText}`, `HTTP_${response.status}`);
    }

    circuitBreaker.recordSuccess();
    return response.json();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      metrics.timeouts++;
      circuitBreaker.recordFailure();
      throw new KestovarError("Kestovar request timed out", "TIMEOUT");
    }
    metrics.failures++;
    circuitBreaker.recordFailure();
    throw error;
  }
}

async function retryFetch(env: any, path: string, init?: RequestInit): Promise<any> {
  let lastError: Error | undefined;

  for (let i = 0; i < KESTOVAR_RETRY_ATTEMPTS; i++) {
    try {
      return await kestovarFetch(env, path, init);
    } catch (error) {
      lastError = error as Error;
      if (i < KESTOVAR_RETRY_ATTEMPTS - 1) {
        const delay = KESTOVAR_RETRY_BACKOFF_MS * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export function createKestovarEnv(env: any): KestovarEnv {
  return {
    async health() {
      return retryFetch(env, "/health");
    },
    async ready() {
      return retryFetch(env, "/ready");
    },
    async version() {
      return retryFetch(env, "/version");
    },
    async capabilities() {
      return retryFetch(env, "/capabilities");
    },
    async dashboard() {
      return retryFetch(env, "/dashboard");
    },
    async providers() {
      return retryFetch(env, "/providers");
    },
    async alerts() {
      return retryFetch(env, "/alerts");
    },
    async recommendations() {
      return retryFetch(env, "/recommendations/quality");
    },
    async events(body) {
      return retryFetch(env, "/events", { method: "POST", body: JSON.stringify(body) });
    },
    async batchEvents(body) {
      return retryFetch(env, "/events/batch", { method: "POST", body: JSON.stringify(body) });
    },
    async generateRecommendation(body) {
      return retryFetch(env, "/recommendations/generate", { method: "POST", body: JSON.stringify(body) });
    },
    async analyzePatterns(body) {
      return retryFetch(env, "/patterns/analyze", { method: "POST", body: JSON.stringify(body) });
    },
    async analyzeCorrelations(body) {
      return retryFetch(env, "/correlations/analyze", { method: "POST", body: JSON.stringify(body) });
    },
    async knowledge(body) {
      return retryFetch(env, "/knowledge", { method: "POST", body: JSON.stringify(body) });
    },
    async commands(body) {
      return retryFetch(env, "/commands", { method: "POST", body: JSON.stringify(body) });
    },
    async feedback(body) {
      return retryFetch(env, "/feedback", { method: "POST", body: JSON.stringify(body) });
    },
    getMetrics() {
      return {
        ...metrics,
        circuitBreaker: {
          state: circuitBreaker.state,
          failures: circuitBreaker.failures,
          lastFailure: circuitBreaker.lastFailure,
        },
      };
    },
    resetCircuitBreaker() {
      circuitBreaker.reset();
    },
    resetMetrics() {
      metrics = { requests: 0, failures: 0, timeouts: 0, latency: 0, circuitBreaker: { state: "closed", failures: 0 } };
    },
  };
}

export function resetKestovarMetrics() {
  metrics = { requests: 0, failures: 0, timeouts: 0, latency: 0, circuitBreaker: { state: "closed", failures: 0 } };
}

export function resetCircuitBreaker() {
  circuitBreaker.reset();
}
