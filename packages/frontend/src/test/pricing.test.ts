import { expect, test } from "vitest";
import { PRICING_TIERS, getTierById, formatPrice, isPlanUpgrade, PLAN_HIERARCHY, getMonthlyPrice, getYearlyPrice } from "@/lib/pricing";

test("canonical pricing tiers have correct monthly prices", () => {
  expect(PRICING_TIERS.length).toBe(4);

  const scout = getTierById("scout");
  expect(scout).toBeDefined();
  expect(scout?.monthlyPrice).toBe(99);
  expect(scout?.yearlyPrice).toBe(990);
  expect(scout?.name).toBe("Scout");

  const professional = getTierById("professional");
  expect(professional).toBeDefined();
  expect(professional?.monthlyPrice).toBe(249);
  expect(professional?.yearlyPrice).toBe(2490);
  expect(professional?.name).toBe("Professional");

  const business = getTierById("business");
  expect(business).toBeDefined();
  expect(business?.monthlyPrice).toBe(599);
  expect(business?.yearlyPrice).toBe(5990);
  expect(business?.name).toBe("Business");

  const enterprise = getTierById("enterprise");
  expect(enterprise).toBeDefined();
  expect(enterprise?.monthlyPrice).toBe(0);
  expect(enterprise?.yearlyPrice).toBe(0);
  expect(enterprise?.name).toBe("Enterprise");
});

test("monthly pricing tiers are ordered by ascending price", () => {
  const prices = PRICING_TIERS.filter((t) => t.monthlyPrice > 0).map((t) => t.monthlyPrice);
  for (let i = 1; i < prices.length; i++) {
    expect(prices[i]).toBeGreaterThan(prices[i - 1]);
  }
});

test("all tier prices are non-negative", () => {
  for (const tier of PRICING_TIERS) {
    expect(tier.monthlyPrice).toBeGreaterThanOrEqual(0);
    expect(tier.yearlyPrice).toBeGreaterThanOrEqual(0);
  }
});

test("formatPrice formats correctly", () => {
  expect(formatPrice(99, "month")).toBe("$99/mo");
  expect(formatPrice(249, "year")).toBe("$249/yr");
  expect(formatPrice(0, "month")).toBe("Custom");
});

test("getMonthlyPrice and getYearlyPrice helpers work", () => {
  expect(getMonthlyPrice("scout")).toBe(99);
  expect(getYearlyPrice("scout")).toBe(990);
  expect(getMonthlyPrice("enterprise")).toBe(0);
});

test("plan hierarchy is correct", () => {
  expect(PLAN_HIERARCHY).toEqual(["scout", "professional", "business", "enterprise"]);
});

test("isPlanUpgrade detects upgrades correctly", () => {
  expect(isPlanUpgrade("professional", "scout")).toBe(true);
  expect(isPlanUpgrade("business", "professional")).toBe(true);
  expect(isPlanUpgrade("enterprise", "business")).toBe(true);
  expect(isPlanUpgrade("scout", "scout")).toBe(false);
  expect(isPlanUpgrade("scout", "professional")).toBe(false);
});

test("no legacy plan IDs exist in canonical tiers", () => {
  const legacyIds = ["starter", "pro"];
  for (const tier of PRICING_TIERS) {
    expect(legacyIds).not.toContain(tier.id);
  }
});
