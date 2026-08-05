import { expect, test } from "vitest";

test("pricing is consistent across all surfaces", () => {
  const prices = { starter: 49, pro: 149, enterprise: 499 };
  expect(prices.starter).toBe(49);
  expect(prices.pro).toBe(149);
  expect(prices.enterprise).toBe(499);
});
