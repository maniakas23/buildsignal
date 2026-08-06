/**
 * BuildSignal Legacy Pricing Compatibility Layer
 * ============================================================================
 * Purpose: Support historical data, database migrations, and legacy imports.
 *
 * RULES:
 *   - This module is ONLY for migration scripts, legacy importers, and
 *     upgrade/downgrade mapping.
 *   - NO customer-facing page may import this module.
 *   - All production UI must import from `@/lib/pricing` (canonical module).
 *
 * Legacy -> Canonical mappings:
 *   starter     -> scout
 *   pro         -> professional
 *   enterprise  -> enterprise
 * ============================================================================
 */

import type { PlanId } from "./pricing";

/** Legacy plan IDs that may appear in old databases or imports. */
export type LegacyPlanId = "starter" | "pro" | "enterprise";

/** Mapping from legacy plan IDs to canonical plan IDs. */
export const LEGACY_TO_CANONICAL: Record<LegacyPlanId, PlanId> = {
  starter: "scout",
  pro: "professional",
  enterprise: "enterprise",
};

/** Reverse mapping for migration scripts that need to write legacy values. */
export const CANONICAL_TO_LEGACY: Record<PlanId, LegacyPlanId | null> = {
  scout: "starter",
  professional: "pro",
  business: null,
  enterprise: "enterprise",
};

/** Convert a legacy plan ID to its canonical equivalent. */
export function canonicalizePlan(plan: string): PlanId {
  if (plan in LEGACY_TO_CANONICAL) {
    return LEGACY_TO_CANONICAL[plan as LegacyPlanId];
  }
  const valid: PlanId[] = ["scout", "professional", "business", "enterprise"];
  return valid.includes(plan as PlanId) ? (plan as PlanId) : "scout";
}

/** Convert a canonical plan ID to its legacy equivalent (for down-migration). */
export function legacyPlan(plan: PlanId): string {
  return CANONICAL_TO_LEGACY[plan] ?? plan;
}

/** Legacy pricing that existed prior to Build 113.1.
 *  Used ONLY for historical revenue calculations and migration audit reports.
 */
export const LEGACY_PRICING: Record<LegacyPlanId, number> = {
  starter: 49,
  pro: 149,
  enterprise: 499,
};
