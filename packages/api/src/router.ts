/**
 * BuildSignal API Router — v2.0 (Gateway Architecture)
 *
 * The API is now a THIN GATEWAY, not a fat monolith.
 *
 * What's here (BuildSignal-specific):
 *   - Authentication, user management
 *   - Billing, Stripe integration
 *   - Product feedback, launch readiness
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
import { samlRouter } from "./saml-router";
import { monitoringRouter } from "./monitoring-router";
import { operationsRouter } from "./operations-router";

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
import { recommendationRouter } from "./recommendation-router";
import { alertRouter } from "./alert-router";
import { customerFeedbackRouter } from "./customer-feedback-router";

// ─── BuildSignal v5.0 — Opportunity Engine ───
import { opportunityEngineRouter } from "./v5/opportunity-engine";

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

// ─── Local Routers (queries D1 directly) — Build 105 ───
import { searchRouter } from "./search-router";
import { providerRouter } from "./provider-router";
import { analyticsRouter } from "./analytics-router";
import { pipelineRouter } from "./pipeline-router";

export const appRouter = createRouter({
  // ─── System ───
  health: publicQuery.query(() => ({ status: "ok", service: "buildsignal", version: "5.4.7" })),
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
  // ─── v5.0 Opportunity Engine ───
  opportunity: opportunityEngineRouter,

  auth: authRouter,
  map: mapRouter,
  notifications: notificationsRouter,
  feedback: feedbackRouter,
  billing: billingRouter,
  stripe: stripeRouter,
  saml: samlRouter,
  recommendation: recommendationRouter,
  alert: alertRouter,
  customerFeedback: customerFeedbackRouter,
  monitoring: monitoringRouter,
  operations: operationsRouter,

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
  // KESTOVAR ENGINE PROXIES (delegated)
  // ═══════════════════════════════════════════

  // Intelligence Layer
  pattern: patternProxyRouter,
  learning: learningProxyRouter,
  recommendationProxy: recommendationProxyRouter,
  confidence: confidenceProxyRouter,
  historical: historicalProxyRouter,

  // Data Layer — Build 105: provider and analytics now local
  provider: providerRouter,
  pipeline: pipelineRouter,
  analytics: analyticsRouter,
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
