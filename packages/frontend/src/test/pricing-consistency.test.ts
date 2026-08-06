import { expect, test } from "vitest";
import { PRICING_TIERS, getTierById, PLAN_HIERARCHY } from "@/lib/pricing";
import { canonicalizePlan, LEGACY_TO_CANONICAL } from "@/lib/pricing-compat";

test("canonical pricing is consistent across all surfaces", () => {
  expect(PRICING_TIERS.length).toBe(4);

  const scout = getTierById("scout");
  const professional = getTierById("professional");
  const business = getTierById("business");
  const enterprise = getTierById("enterprise");

  expect(scout).toBeDefined();
  expect(professional).toBeDefined();
  expect(business).toBeDefined();
  expect(enterprise).toBeDefined();

  expect(scout!.monthlyPrice).toBe(99);
  expect(professional!.monthlyPrice).toBe(249);
  expect(business!.monthlyPrice).toBe(599);
  expect(enterprise!.monthlyPrice).toBe(0);
});

test("legacy plans map correctly to canonical", () => {
  expect(canonicalizePlan("starter")).toBe("scout");
  expect(canonicalizePlan("pro")).toBe("professional");
  expect(canonicalizePlan("enterprise")).toBe("enterprise");
  expect(canonicalizePlan("scout")).toBe("scout");
  expect(canonicalizePlan("professional")).toBe("professional");
  expect(canonicalizePlan("business")).toBe("business");
});

test("canonical plan names never contain legacy terms", () => {
  const legacyTerms = ["Starter", "Pro"];
  for (const tier of PRICING_TIERS) {
    for (const term of legacyTerms) {
      expect(tier.name).not.toContain(term);
    }
  }
});

test("canonical plan hierarchy is strictly ordered", () => {
  expect(PLAN_HIERARCHY).toEqual(["scout", "professional", "business", "enterprise"]);
});

test("compatibility layer maps all legacy values", () => {
  expect(Object.keys(LEGACY_TO_CANONICAL)).toEqual(["starter", "pro", "enterprise"]);
});
