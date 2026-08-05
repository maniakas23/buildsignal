/**
 * Kestovar Engine SDK — BuildSignal v5.4.7
 * Typed client for all Kestovar communication.
 *
 * PRODUCTION: Uses Cloudflare Service Binding (env.KESTOVAR.fetch()).
 * DEVELOPMENT: Falls back to KESTOVAR_API_URL for local tooling only.
 *
 * Pattern: BuildSignal → ctx.kestovar → Kestovar Engine → Typed Response
 *
 * All methods: request IDs, correlation IDs, timeouts, retries, circuit breaker.
 * No direct env.KESTOVAR.fetch() calls outside this module.
 */

// ─────────────────────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface KestovarDashboard {
  activeSignals: number;
  projectsTracked: number;
  patternsActive: number;
  alertsUnread: number;
  confidenceScore: number;
  zones: Array<{
    id: string;
    name: string;
    signalCount: number;
    projectCount: number;
    sparklineData: number[];
  }>;
  recentSurges: Array<{
    id: string;
    projectName: string;
    signalType: string;
    location: string;
    timestamp: string;
    scoreChange: number;
  }>;
  summary: {
    id: string;
    content: string;
    timeRange: string;
    sourcesUsed: string[];
    wordCount: number;
    tone: string;
    format: string;
    generatedAt: string;
  } | null;
  patterns: Array<{
    id: string;
    name: string;
    description: string;
    signalTypes: string[];
    industries: string[];
    avgLeadTimeDays: number;
    confidence: number;
    status: string;
    maturity: number;
    formula: string;
    aiWeight: number;
    historicalExamples: string[];
    createdMatches: number;
    isActive: boolean;
  }>;
}

export interface KestovarProvider {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive" | "degraded";
  coverage: string[];
  signalCount: number;
  lastUpdated: string;
  latencyMs: number;
  errorRate: number;
}

export interface KestovarAlert {
  id: string;
  projectId?: string;
  signalId?: string;
  type: string;
  severity: "critical" | "standard" | "low";
  title: string;
  message: string;
  scoreChange: number;
  confidence: number;
  evidenceSource: string;
  isAcknowledged: boolean;
  acknowledgedAt?: string;
  createdAt: string;
}

export interface KestovarRecommendationQuality {
  overallScore: number;
  accuracy: number;
  freshness: number;
  coverage: number;
  diversity: number;
  totalRecommendations: number;
  avgConfidence: number;
  avgRoi: number;
  byCategory: Array<{
    category: string;
    score: number;
    count: number;
  }>;
  trends: Array<{
    period: string;
    score: number;
  }>;
}

export interface KestovarRecommendation {
  recommendationId: string;
  organizationId: number;
  geography: { county: string; state: string };
  opportunityType: string;
  executiveSummary: string;
  confidence: number;
  urgency: string;
  evidence: string[];
  relatedEvents: string[];
  patterns: string[];
  historicalComparisons: Array<{
    period: string;
    similarity: number;
    outcome: string;
  }>;
  riskFactors: string[];
  recommendedActions: string[];
  engineVersion: string;
  apiContractVersion: string;
  generatedAt: string;
  freshnessTimestamp: string;
  provenance: string;
}

export interface KestovarPattern {
  patternId: string;
  patternName: string;
  confidence: number;
  matchCount: number;
  description: string;
}

export interface KestovarCorrelation {
  sourceA: string;
  sourceB: string;
  strength: number;
  confidence: number;
  description: string;
}

export interface KestovarKnowledgeEntry {
  entityId: string;
  entityType: string;
  attributes: Record<string, unknown>;
  relevance: number;
}

export interface KestovarEvent {
  eventId: string;
  status: string;
  processedAt: string;
}

export interface KestovarBatchResult {
  batchId: string;
  accepted: number;
  rejected: number;
  errors: string[];
}

export interface KestovarHealth {
  ok: boolean;
  service: string;
  timestamp: string;
}

export interface KestovarReady {
  ready: boolean;
  checks: Record<string, { status: string; detail?: string; latencyMs?: number }>;
  timestamp: string;
}

export interface KestovarVersion {
  engine: string;
  api: string;
  build: string;
  commit: string;
}

export interface KestovarCapabilities {
  apiVersion: string;
  supportedVersions: string[];
  capabilities: Record<string, boolean>;
  engineVersion: string;
}

export interface KestovarCommand {
  commandId: string;
  commandType: string;
  status: string;
  result: Record<string, unknown>;
  completedAt: string;
}

export interface KestovarProductStatus {
  product: string;
  version: string;
  status: string;
  uptimePercent: number;
  dependencies: Array<{ name: string; status: string }>;
}

export interface KestovarFeedback {
  feedbackId: string;
  status: string;
  processedAt: string;
}

export interface KestovarEnv {
  KESTOVAR?: { fetch: (request: Request) => Promise<Response> };
  KESTOVAR_API_URL?: string;
  KESTOVAR_API_KEY?: string;
  INTERNAL_API_SECRET?: string;
  APP_NAME?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CIRCUIT BREAKER
// ─────────────────────────────────────────────────────────────────────────────

class CircuitBreaker {
  private failures = 0;
  private successes = 0;
  private state: "closed" | "open" | "half-open" = "closed";
  private lastFailureTime = 0;
  private readonly threshold = 5;
  private readonly resetTimeout = 30000;

  call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = "half-open";
      } else {
        return Promise.reject(new Error("Circuit breaker open"));
      }
    }
    return fn().then(
      (result) => {
        this.successes++;
        this.failures = 0;
        this.state = "closed";
        return result;
      },
      (error) => {
        this.failures++;
        this.lastFailureTime = Date.now();
        if (this.failures >= this.threshold) {
          this.state = "open";
        }
        throw error;
      }
    );
  }

  reset(): void {
    this.failures = 0;
    this.successes = 0;
    this.state = "closed";
    this.lastFailureTime = 0;
  }

  getState(): string {
    return this.state;
  }
}

let globalBreaker: CircuitBreaker | null = null;
function getBreaker(): CircuitBreaker {
  if (!globalBreaker) {
    globalBreaker = new CircuitBreaker();
  }
  return globalBreaker;
}

export function resetCircuitBreaker(): void {
  if (globalBreaker) {
    globalBreaker.reset();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  METRICS
// ─────────────────────────────────────────────────────────────────────────────

interface KestovarMetrics {
  requests: number;
  errors: number;
  latencyMs: number[];
  lastReset: string;
}

const metrics: KestovarMetrics = {
  requests: 0,
  errors: 0,
  latencyMs: [],
  lastReset: new Date().toISOString(),
};

export function getKestovarMetrics(): KestovarMetrics {
  return { ...metrics };
}

export function resetKestovarMetrics(): void {
  metrics.requests = 0;
  metrics.errors = 0;
  metrics.latencyMs = [];
  metrics.lastReset = new Date().toISOString();
}

// ─────────────────────────────────────────────────────────────────────────────
//  CORE HTTP CLIENT
// ─────────────────────────────────────────────────────────────────────────────

async function kestovarRequest<T>(
  env: KestovarEnv,
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  const correlationId = `bs-${Date.now()}`;

  // Build request
  const url = env.KESTOVAR_API_URL
    ? `${env.KESTOVAR_API_URL}${endpoint}`
    : `https://api.kestovar.buildsignal.net${endpoint}`;

  const headers = new Headers(options.headers || {});
  headers.set("X-Request-ID", requestId);
  headers.set("X-Correlation-ID", correlationId);
  headers.set("X-Product-Name", env.APP_NAME || "buildsignal");
  headers.set("X-API-Contract-Version", "1");

  if (env.INTERNAL_API_SECRET) {
    headers.set("Authorization", `Bearer ${env.INTERNAL_API_SECRET}`);
  }
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const request = new Request(url, {
    ...options,
    headers,
  });

  // Service binding (production) or HTTP fallback (development)
  let response: Response;
  const hasBinding = !!env.KESTOVAR;

  try {
    if (hasBinding) {
      response = await env.KESTOVAR!.fetch(request);
    } else {
      // Fallback: direct HTTP (only in development)
      response = await fetch(request, { signal: AbortSignal.timeout(30000) });
    }
  } catch (error) {
    metrics.requests++;
    metrics.errors++;
    throw new Error(`Kestovar request failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Retry once on 5xx
  if (!response.ok && response.status >= 500 && response.status < 600) {
    try {
      if (hasBinding) {
        response = await env.KESTOVAR!.fetch(request);
      } else {
        response = await fetch(request, { signal: AbortSignal.timeout(30000) });
      }
    } catch (error) {
      metrics.requests++;
      metrics.errors++;
      throw new Error(`Kestovar retry failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  metrics.requests++;
  metrics.latencyMs.push(Date.now() - startTime);
  if (metrics.latencyMs.length > 100) {
    metrics.latencyMs.shift();
  }

  if (!response.ok) {
    metrics.errors++;
    const text = await response.text().catch(() => "Unknown error");
    throw new Error(`Kestovar HTTP ${response.status}: ${text}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json") || response.status === 200) {
    try {
      return await response.json() as T;
    } catch {
      // Non-JSON 200 response (e.g. metadata XML)
      return textToUnknown(await response.text()) as T;
    }
  }
  return textToUnknown(await response.text()) as T;
}

function textToUnknown(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  API METHODS (13+ typed endpoints)
// ─────────────────────────────────────────────────────────────────────────────

export async function checkEngineHealth(env: KestovarEnv): Promise<{
  status: "passed" | "failed";
  latencyMs?: number;
  detail?: string;
}> {
  const start = Date.now();
  try {
    const result = await getBreaker().call(() =>
      kestovarRequest<KestovarHealth>(env, "/health", { method: "GET" })
    );
    return { status: "passed", latencyMs: Date.now() - start };
  } catch (error) {
    return {
      status: "failed",
      latencyMs: Date.now() - start,
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function checkEngineReady(env: KestovarEnv): Promise<{
  ready: boolean;
  detail?: string;
}> {
  try {
    const result = await getBreaker().call(() =>
      kestovarRequest<KestovarReady>(env, "/ready", { method: "GET" })
    );
    return { ready: result.ready, detail: JSON.stringify(result.checks) };
  } catch (error) {
    return {
      ready: false,
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getEngineVersion(env: KestovarEnv): Promise<KestovarVersion | null> {
  try {
    return await getBreaker().call(() =>
      kestovarRequest<KestovarVersion>(env, "/version", { method: "GET" })
    );
  } catch {
    return null;
  }
}

export async function getCapabilities(env: KestovarEnv): Promise<KestovarCapabilities | null> {
  try {
    return await getBreaker().call(() =>
      kestovarRequest<KestovarCapabilities>(env, "/capabilities", { method: "GET" })
    );
  } catch {
    return null;
  }
}

export async function getDashboard(env: KestovarEnv): Promise<KestovarDashboard | null> {
  try {
    return await getBreaker().call(() =>
      kestovarRequest<KestovarDashboard>(env, "/dashboard", { method: "GET" })
    );
  } catch {
    return null;
  }
}

export async function getProviders(env: KestovarEnv): Promise<KestovarProvider[] | null> {
  try {
    return await getBreaker().call(() =>
      kestovarRequest<KestovarProvider[]>(env, "/providers", { method: "GET" })
    );
  } catch {
    return null;
  }
}

export async function getAlerts(env: KestovarEnv): Promise<KestovarAlert[] | null> {
  try {
    return await getBreaker().call(() =>
      kestovarRequest<KestovarAlert[]>(env, "/alerts", { method: "GET" })
    );
  } catch {
    return null;
  }
}

export async function getRecommendationQuality(env: KestovarEnv): Promise<KestovarRecommendationQuality | null> {
  try {
    return await getBreaker().call(() =>
      kestovarRequest<KestovarRecommendationQuality>(env, "/recommendations/quality", { method: "GET" })
    );
  } catch {
    return null;
  }
}

export async function getProductStatus(env: KestovarEnv): Promise<KestovarProductStatus[] | null> {
  try {
    return await getBreaker().call(() =>
      kestovarRequest<KestovarProductStatus[]>(env, "/products/status", { method: "GET" })
    );
  } catch {
    return null;
  }
}

export async function sendEvent(env: KestovarEnv, event: Record<string, unknown>): Promise<KestovarEvent | null> {
  try {
    return await getBreaker().call(() =>
      kestovarRequest<KestovarEvent>(env, "/events", {
        method: "POST",
        body: JSON.stringify(event),
      })
    );
  } catch {
    return null;
  }
}

export async function sendEventBatch(env: KestovarEnv, events: Record<string, unknown>[]): Promise<KestovarBatchResult | null> {
  try {
    return await getBreaker().call(() =>
      kestovarRequest<KestovarBatchResult>(env, "/events/batch", {
        method: "POST",
        body: JSON.stringify(events),
      })
    );
  } catch {
    return null;
  }
}

export async function generateRecommendation(env: KestovarEnv, params: Record<string, unknown>): Promise<KestovarRecommendation | null> {
  try {
    return await getBreaker().call(() =>
      kestovarRequest<KestovarRecommendation>(env, "/recommendations/generate", {
        method: "POST",
        body: JSON.stringify(params),
      })
    );
  } catch {
    return null;
  }
}

export async function analyzePatterns(env: KestovarEnv, params: Record<string, unknown>): Promise<{ patterns: KestovarPattern[]; summary: string } | null> {
  try {
    return await getBreaker().call(() =>
      kestovarRequest<{ patterns: KestovarPattern[]; summary: string }>(env, "/patterns/analyze", {
        method: "POST",
        body: JSON.stringify(params),
      })
    );
  } catch {
    return null;
  }
}

export async function analyzeCorrelations(env: KestovarEnv, params: Record<string, unknown>): Promise<{ correlations: KestovarCorrelation[]; summary: string } | null> {
  try {
    return await getBreaker().call(() =>
      kestovarRequest<{ correlations: KestovarCorrelation[]; summary: string }>(env, "/correlations/analyze", {
        method: "POST",
        body: JSON.stringify(params),
      })
    );
  } catch {
    return null;
  }
}

export async function upsertKnowledge(env: KestovarEnv, entry: Record<string, unknown>): Promise<{ entryId: string; status: string; indexedAt: string } | null> {
  try {
    return await getBreaker().call(() =>
      kestovarRequest<{ entryId: string; status: string; indexedAt: string }>(env, "/knowledge", {
        method: "POST",
        body: JSON.stringify(entry),
      })
    );
  } catch {
    return null;
  }
}

export async function queryKnowledge(env: KestovarEnv, query: Record<string, unknown>): Promise<{ results: KestovarKnowledgeEntry[]; total: number } | null> {
  try {
    return await getBreaker().call(() =>
      kestovarRequest<{ results: KestovarKnowledgeEntry[]; total: number }>(env, "/knowledge", {
        method: "GET",
      })
    );
  } catch {
    return null;
  }
}

export async function sendAlert(env: KestovarEnv, alert: Record<string, unknown>): Promise<{ alertId: string; status: string; deliveredAt: string } | null> {
  try {
    return await getBreaker().call(() =>
      kestovarRequest<{ alertId: string; status: string; deliveredAt: string }>(env, "/api/v1/alerts", {
        method: "POST",
        body: JSON.stringify(alert),
      })
    );
  } catch {
    return null;
  }
}

export async function executeCommand(env: KestovarEnv, command: Record<string, unknown>): Promise<KestovarCommand | null> {
  try {
    return await getBreaker().call(() =>
      kestovarRequest<KestovarCommand>(env, "/commands", {
        method: "POST",
        body: JSON.stringify(command),
      })
    );
  } catch {
    return null;
  }
}

export async function sendFeedback(env: KestovarEnv, feedback: Record<string, unknown>): Promise<KestovarFeedback | null> {
  try {
    return await getBreaker().call(() =>
      kestovarRequest<KestovarFeedback>(env, "/feedback", {
        method: "POST",
        body: JSON.stringify(feedback),
      })
    );
  } catch {
    return null;
  }
}

export async function getEngineStatus(env: KestovarEnv): Promise<{
  healthy: boolean;
  version: string;
  latencyMs: number;
  capabilities: string[];
}> {
  const start = Date.now();
  const health = await checkEngineHealth(env);
  const version = await getEngineVersion(env);
  const caps = await getCapabilities(env);
  return {
    healthy: health.status === "passed",
    version: version?.engine || "unknown",
    latencyMs: Date.now() - start,
    capabilities: caps ? Object.keys(caps.capabilities).filter((k) => caps.capabilities[k]) : [],
  };
}
