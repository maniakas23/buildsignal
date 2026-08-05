import { expect, test } from "vitest";

test("simulated data generates valid predictions", () => {
  const generatePrediction = () => ({
    confidence: Math.random() * 100,
    trend: Math.random() > 0.5 ? "up" : "down",
  });
  const p = generatePrediction();
  expect(p.confidence).toBeGreaterThanOrEqual(0);
  expect(p.confidence).toBeLessThanOrEqual(100);
  expect(["up", "down"]).toContain(p.trend);
});
