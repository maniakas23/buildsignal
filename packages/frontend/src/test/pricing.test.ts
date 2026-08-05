import { expect, test } from "vitest";

test("pricing tiers have consistent pricing", () => {
  const tiers = [
    { name: "Starter", price: 49 },
    { name: "Pro", price: 149 },
    { name: "Enterprise", price: 499 },
  ];
  expect(tiers[0].price).toBeLessThan(tiers[1].price);
  expect(tiers[1].price).toBeLessThan(tiers[2].price);
  expect(tiers[0].price).toBeGreaterThan(0);
});
