/**
 * IP Register Router — Gate 20
 * Intellectual property register: brand names, logos, algorithms, patterns, engines, content.
 * Trademark readiness documentation.
 */

import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";

export const ipRegisterRouter = createRouter({
  // ─── Full IP register ───
  assets: authedQuery
    .input(z.object({ category: z.string().optional(), status: z.string().optional() }).optional())
    .query(({ input }) => {
      const allAssets = getAllAssets();
      let assets = allAssets;
      if (input?.category) assets = assets.filter(a => a.category === input.category);
      if (input?.status) assets = assets.filter(a => a.status === input.status);
      return {
        assets,
        total: allAssets.length,
        byCategory: Object.entries(
          allAssets.reduce((acc, a) => { acc[a.category] = (acc[a.category] || 0) + 1; return acc; }, {} as Record<string, number>)
        ).map(([category, count]) => ({ category, count })),
      };
    }),

  // ─── Trademark readiness report ───
  trademarkReadiness: authedQuery.query(() => {
    return {
      reportId: `TM-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      trademarks: [
        {
          name: "Kestovar",
          symbol: "\u2122",
          status: "ready_to_file" as const,
          firstUseInCommerce: "2026-01-15",
          goodsAndServices: "Software as a service (SaaS) platform for infrastructure intelligence, data analytics, and recommendation systems",
          logoVersions: ["Wordmark", "Icon + Wordmark", "App Icon"],
          brandGuidelines: "Complete \u2014 color palette (#081018, #5B8DEF, #3ECF8E), typography (Inter), usage rules documented",
          ownership: "Kestovar, Inc.",
          jurisdictions: ["USPTO (US)", "EUIPO (EU)", "CIPO (Canada)"],
          notes: "Core brand \u2014 highest priority filing",
        },
        {
          name: "BuildSignal",
          symbol: "\u2122",
          status: "ready_to_file" as const,
          firstUseInCommerce: "2026-03-01",
          goodsAndServices: "SaaS platform for construction and infrastructure project intelligence, permit tracking, and development opportunity identification",
          logoVersions: ["Wordmark", "App Icon"],
          brandGuidelines: "Complete \u2014 sub-brand of Kestovar, shared palette with accent differentiation",
          ownership: "Kestovar, Inc.",
          jurisdictions: ["USPTO (US)"],
          notes: "First product brand \u2014 file concurrently with Kestovar",
        },
        {
          name: "Parcel Lead Pro",
          symbol: "\u2122",
          status: "ready_to_file" as const,
          firstUseInCommerce: "2026-06-01",
          goodsAndServices: "SaaS platform for real estate parcel analysis, lead generation, and property development intelligence",
          logoVersions: ["Wordmark"],
          brandGuidelines: "Complete \u2014 sub-brand of Kestovar, real estate vertical styling",
          ownership: "Kestovar, Inc.",
          jurisdictions: ["USPTO (US)"],
          notes: "Vertical product brand \u2014 file after Kestovar and BuildSignal",
        },
      ],
      recommendations: [
        "File Kestovar trademark application within 30 days (highest priority)",
        "File BuildSignal trademark concurrently with Kestovar",
        "File Parcel Lead Pro trademark within 60 days",
        "Monitor USPTO TESS database for conflicting marks weekly",
        "Document first use in commerce evidence with screenshots and dated materials",
      ],
    };
  }),

  // ─── Register a new IP asset ───
  register: authedQuery
    .input(z.object({
      category: z.string(),
      name: z.string(),
      description: z.string(),
      status: z.enum(["registered", "pending", "provisional", "planned"]),
      registrationNumber: z.string().optional(),
      filedDate: z.string().optional(),
      owner: z.string().default("Kestovar, Inc."),
    }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        asset: {
          id: `IP-${Date.now()}`,
          ...input,
          createdAt: new Date().toISOString(),
        },
      };
    }),
});

function getAllAssets() {
  return [
    // ─── Brand Names ───
    { id: "IP-001", category: "brand", name: "Kestovar", type: "wordmark", description: "Master brand for the infrastructure intelligence platform ecosystem", status: "in_use" as const, owner: "Kestovar, Inc.", since: "2026-01-15" },
    { id: "IP-002", category: "brand", name: "BuildSignal", type: "wordmark", description: "First product brand \u2014 construction and infrastructure intelligence", status: "in_use" as const, owner: "Kestovar, Inc.", since: "2026-03-01" },
    { id: "IP-003", category: "brand", name: "Parcel Lead Pro", type: "wordmark", description: "Second product brand \u2014 real estate parcel intelligence", status: "in_use" as const, owner: "Kestovar, Inc.", since: "2026-06-01" },
    // ─── Logos ───
    { id: "IP-004", category: "logo", name: "Kestovar Logo Suite", type: "visual_design", description: "Complete logo system: wordmark, icon, app icon, favicon, dark/light variants", status: "final" as const, owner: "Kestovar, Inc.", since: "2026-01-15" },
    { id: "IP-005", category: "logo", name: "BuildSignal Logo", type: "visual_design", description: "Product logo with sub-brand styling, horizontal and stacked variants", status: "final" as const, owner: "Kestovar, Inc.", since: "2026-03-01" },
    { id: "IP-006", category: "logo", name: "Parcel Lead Pro Logo", type: "visual_design", description: "Vertical product logo with real estate styling", status: "final" as const, owner: "Kestovar, Inc.", since: "2026-06-01" },
    // ─── Algorithms ───
    { id: "IP-007", category: "algorithm", name: "ConfidenceScoringEngine", type: "algorithm", description: "8-dimension weighted confidence scoring with explainable breakdown", status: "proprietary" as const, owner: "Kestovar, Inc.", since: "2026-04-01" },
    { id: "IP-008", category: "algorithm", name: "PatternMatchingEngine", type: "algorithm", description: "Multi-pattern signal detection across 12 infrastructure categories", status: "proprietary" as const, owner: "Kestovar, Inc.", since: "2026-04-15" },
    { id: "IP-009", category: "algorithm", name: "ProviderHealthScoring", type: "algorithm", description: "Circuit-breaker + health score computation for 247 providers", status: "proprietary" as const, owner: "Kestovar, Inc.", since: "2026-05-01" },
    // ─── Pattern Intelligence ───
    { id: "IP-010", category: "pattern", name: "Kestovar Pattern Library", type: "data_asset", description: "8 validated infrastructure growth patterns with 71-96% historical accuracy", status: "proprietary" as const, owner: "Kestovar, Inc.", since: "2026-05-15" },
    { id: "IP-011", category: "pattern", name: "Learning Loop System", type: "methodology", description: "Continuous feedback-driven pattern improvement methodology", status: "proprietary" as const, owner: "Kestovar, Inc.", since: "2026-06-01" },
    // ─── Recommendation Engine ───
    { id: "IP-012", category: "engine", name: "RecommendationDeliveryEngine", type: "software", description: "tRPC-based API system delivering contextual infrastructure recommendations", status: "proprietary" as const, owner: "Kestovar, Inc.", since: "2026-05-01" },
    { id: "IP-013", category: "engine", name: "HistoricalValidationEngine", type: "software", description: "Outcome tracking and accuracy measurement system for recommendations", status: "proprietary" as const, owner: "Kestovar, Inc.", since: "2026-06-15" },
    // ─── Decision Engine ───
    { id: "IP-014", category: "engine", name: "Kestovar Decision Engine", type: "software", description: "Multi-factor decision support combining confidence, trust, evidence, and geographic context", status: "proprietary" as const, owner: "Kestovar, Inc.", since: "2026-06-01" },
    // ─── Learning Engine ───
    { id: "IP-015", category: "engine", name: "Kestovar Learning Engine", type: "software", description: "Feedback capture, pattern evolution, and recommendation quality improvement system", status: "proprietary" as const, owner: "Kestovar, Inc.", since: "2026-06-15" },
    // ─── Provider SDK ───
    { id: "IP-016", category: "software", name: "Kestovar Provider SDK", type: "software", description: "Standardized integration framework for infrastructure data providers (12 provider types)", status: "proprietary" as const, owner: "Kestovar, Inc.", since: "2026-07-01" },
    // ─── Website Content ───
    { id: "IP-017", category: "content", name: "BuildSignal Application", type: "software", description: "React 19 + TypeScript + Tailwind CSS web application with 30+ pages", status: "copyrighted" as const, owner: "Kestovar, Inc.", since: "2026-07-18" },
    { id: "IP-018", category: "content", name: "API Documentation", type: "documentation", description: "30+ tRPC router documentation with endpoint specifications", status: "copyrighted" as const, owner: "Kestovar, Inc.", since: "2026-07-18" },
    // ─── Documentation ───
    { id: "IP-019", category: "documentation", name: "Gate Specifications", type: "documentation", description: "Complete engineering gate specifications (Gates 12-20) defining all platform capabilities", status: "copyrighted" as const, owner: "Kestovar, Inc.", since: "2026-07-18" },
    { id: "IP-020", category: "documentation", name: "13 Governance Policies", type: "documentation", description: "Enterprise legal and governance policy suite", status: "copyrighted" as const, owner: "Kestovar, Inc.", since: "2026-07-18" },
    // ─── Visual Assets ───
    { id: "IP-021", category: "visual", name: "Dashboard UI Design System", type: "visual_design", description: "Dark-theme design system: #081018 canvas, #5B8DEF accent, #3ECF8E verified signal, Inter typography", status: "final" as const, owner: "Kestovar, Inc.", since: "2026-07-18" },
    { id: "IP-022", category: "visual", name: "Icon Library (21 icons)", type: "visual_design", description: "Custom SVG icon set for infrastructure intelligence visualization", status: "final" as const, owner: "Kestovar, Inc.", since: "2026-07-18" },
    { id: "IP-023", category: "visual", name: "Knowledge Graph Visualization", type: "visual_design", description: "Interactive node-edge graph design for infrastructure relationship mapping", status: "final" as const, owner: "Kestovar, Inc.", since: "2026-07-18" },
    { id: "IP-024", category: "visual", name: "Map Visualization System", type: "visual_design", description: "Geographic heatmap and marker overlay system for 50-state coverage", status: "final" as const, owner: "Kestovar, Inc.", since: "2026-07-18" },
  ];
}

