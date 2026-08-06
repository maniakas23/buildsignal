/**
 * BuildSignal API Router — v2.0 (Gateway Architecture)
 *
 * The API is now a THIN GATEWAY, not a fat monolith.
 *
 * What's here (BuildSignal-specific):
 *   - Authentication, user management
 *   - Billing, Stripe integration
 *   - Beta feedback, launch readiness
 *   - Maps, watchlists, notifications
 *   - Organizations, county data
 *   - Audit logs, feedback queue
 *   - Monitoring, operations
 *   - Geographic data, briefs
 *   - Ingestion, completion
 *   - IP register, executive ops
 *   - Daily ops, pipeline metrics
 *
 * What's proxied to Kestovar Engine (shared intelligence):
 *   - pattern, learning, recommendation, confidence, historical
 *   - provider, pipeline, analytics, search, warehouse, enrichment
 *   - governance, validation, quality
 *   - briefing, expansion, live intelligence
 *
 * Architecture: API Gateway → Service Binding → Kestovar Engine
 */

import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDbFromContext } from "./queries/connection";
import { sql } from "drizzle-orm";

// ─── BuildSignal-Specific Routers (OWNED by API) ───
import { authRouter } from "./auth-router";
import { mapRouter } from "./map-router";
import { notificationsRouter } from "./notifications-router";
import { feedbackRouter } from "./feedback-router";
import { billingRouter } from "./billing-router";
import { stripeRouter } from "./stripe-router";
import { monitoringRouter } from "./monitoring-router";
import { operationsRouter } from "./operations-router";
import { betaFeedbackRouter } from "./beta-feedback-router";
import { watchlistRouter } from "./watchlist-router";
import { countyRouter } from "./county-router";
import { briefRouter } from "./brief-router";
import { organizationRouter } from "./organization-router";
import { notificationRouter } from "./notification-router";
import { auditRouter, feedbackQueueRouter } from "./audit-router";
import { geographicRouter } from "./geographic-router";
import { knowledgeGraphRouter } from "./knowledge-graph-router";
import { historicalValidationRouter } from "./historical-validation-router";
import { pipelineMetricsRouter } from "./pipeline-metrics-router";
import { learningLoopRouter } from "./learning-loop-router";
import { dailyOpsRouter } from "./daily-ops-router";
import { aiGovernanceRouter } from "./ai-governance-router";
import { dataGovernanceRouter } from "./data-governance-router";
import { securityRouter } from "./security-router";
import { ipRegisterRouter } from "./ip-register-router";
import { liveIntelligenceRouter } from "./live-intelligence-router";
import { executiveOpsRouter } from "./executive-ops-router";
import { completionRouter } from "./completion-router";
import { ingestionRouter } from "./ingestion-router";

// ─── Sprint 4 Routers ───
import { emailRouter } from "./email-router";
import { exportRouter } from "./export-router";
import { webhookRouter } from "./webhook-router";
import { advancedSearchRouter } from "./advanced-search-router";

// ─── Kestovar Engine Proxy Routers (DELEGATED to Engine) ───
import {
  patternProxyRouter,
  learningProxyRouter,
  recommendationProxyRouter,
  confidenceProxyRouter,
  historicalProxyRouter,
  providerProxyRouter,
  pipelineProxyRouter,
  analyticsProxyRouter,
  warehouseProxyRouter,
  enrichmentProxyRouter,
  governanceProxyRouter,
  validationProxyRouter,
  qualityProxyRouter,
  briefingProxyRouter,
  expansionProxyRouter,
  liveProxyRouter,
  engineHealthRouter,
} from "./proxy-router";

// ─── Local Search Router (queries D1 directly) ───
import { searchRouter } from "./search-router";

// ─── Local Pipeline Router (queries D1 directly) ───
// The pipeline proxy forwards to the Engine which does not expose
// pipeline.opportunities.feed or pipeline.telemetry endpoints.
// The local router queries D1 directly for real data.
import { pipelineRouter } from "./pipeline-router";

export const appRouter = createRouter({
  // ─── System ───
  health: publicQuery.query(() => ({ status: "ok", service: "buildsignal", version: "1.0.0" })),
  engineHealth: engineHealthRouter,

  debug: adminQuery.query(async ({ ctx }) => {
    const env = ctx.env || {};
    const hasD1 = !!env.DB;
    const hasEngineBinding = !!(env.KESTOVAR as any);
    let queryResult = "not attempted";
    if (hasD1) {
      try {
        const db = getDbFromContext(env);
        await db.select({ one: sql`1` });
        queryResult = "success";
      } catch (e: any) {
        queryResult = `error: ${e.message}`;
      }
    }
    return {
      hasD1Binding: hasD1,
      hasEngineBinding,
      globalD1Binding: !!(globalThis as any).__D1_BINDING__,
      envKeys: Object.keys(env).filter(k => !k.includes('SECRET') && !k.includes('KEY')),
      queryResult,
      timestamp: new Date().toISOString(),
    };
  }),

  // ═══════════════════════════════════════════
  // BUILDSIGNAL-SPECIFIC (owned by API)
  // ═══════════════════════════════════════════
  auth: authRouter,
  map: mapRouter,
  notifications: notificationsRouter,
  feedback: feedbackRouter,
  billing: billingRouter,
  stripe: stripeRouter,
  monitoring: monitoringRouter,
  operations: operationsRouter,
  betaFeedback: betaFeedbackRouter,
  watchlist: watchlistRouter,
  county: countyRouter,
  brief: briefRouter,
  organization: organizationRouter,
  notification: notificationRouter,
  audit: auditRouter,
  feedbackQueue: feedbackQueueRouter,
  geographic: geographicRouter,
  knowledgeGraph: knowledgeGraphRouter,
  historicalValidation: historicalValidationRouter,
  pipelineMetrics: pipelineMetricsRouter,
  learningLoop: learningLoopRouter,
  dailyOps: dailyOpsRouter,
  aiGovernance: aiGovernanceRouter,
  dataGovernance: dataGovernanceRouter,
  security: securityRouter,
  ipRegister: ipRegisterRouter,
  live: liveIntelligenceRouter,
  executive: executiveOpsRouter,
  completion: completionRouter,
  ingestion: ingestionRouter,

  // ═══════════════════════════════════════════
  // SPRINT 4 — Notifications, Exports, Webhooks, Advanced Search
  // ═══════════════════════════════════════════
  email: emailRouter,
  export: exportRouter,
  webhook: webhookRouter,
  advancedSearch: advancedSearchRouter,

  // ═══════════════════════════════════════════
  // KESTOVAR ENGINE PROXIES (delegated)
  // These routes forward to the Kestovar Engine via service binding.
  // The Engine owns all shared business logic.
  // ═══════════════════════════════════════════

  // Intelligence Layer
  pattern: patternProxyRouter,
  learning: learningProxyRouter,
  recommendation: recommendationProxyRouter,
  confidence: confidenceProxyRouter,
  historical: historicalProxyRouter,

  // Data Layer
  provider: providerProxyRouter,
  // pipeline: Uses LOCAL router (queries D1 directly) not proxy
  // The Engine does not yet expose pipeline.opportunities.feed endpoints
  pipeline: pipelineRouter,
  analytics: analyticsProxyRouter,
  // search: Uses LOCAL router (queries D1 directly) not proxy
  // The Engine does not yet expose search.list/search.global endpoints
  search: searchRouter,
  warehouse: warehouseProxyRouter,
  enrichment: enrichmentProxyRouter,

  // Governance Layer
  governance: governanceProxyRouter,
  validation: validationProxyRouter,
  quality: qualityProxyRouter,

  // Operations Layer
  briefing: briefingProxyRouter,
  expansion: expansionProxyRouter,
  liveIntelligence: liveProxyRouter,
});

export type AppRouter = typeof appRouter;
