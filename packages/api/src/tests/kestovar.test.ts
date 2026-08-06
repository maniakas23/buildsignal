/**
 * Kestovar Test — Build 110 / v1.1.0
 * Stub tests for zero-data state
 */

import { describe, it, expect } from "vitest";
import {
  getDashboard,
  getProviders,
  getAlerts,
  getRecommendationQuality,
  getProductsStatus,
  checkEngineHealth,
  isDemoMode,
} from "../src/lib/kestovar";

describe("kestovar", () => {
  it("getDashboard returns zero-initialized dashboard", async () => {
    const dashboard = await getDashboard();
    expect(dashboard.activeSignals).toBe(0);
    expect(dashboard.projectsTracked).toBe(0);
    expect(dashboard.patternsActive).toBe(0);
    expect(dashboard.zones).toEqual([]);
    expect(dashboard.recommendations).toEqual([]);
  });

  it("getProviders returns empty array", async () => {
    const providers = await getProviders();
    expect(providers).toEqual([]);
  });

  it("getAlerts returns empty array", async () => {
    const alerts = await getAlerts();
    expect(alerts).toEqual([]);
  });

  it("getRecommendationQuality returns zero metrics", async () => {
    const quality = await getRecommendationQuality();
    expect(quality.overallAccuracy).toBe(0);
    expect(quality.samples).toBe(0);
    expect(quality.metrics).toEqual([]);
  });

  it("getProductsStatus returns empty array", async () => {
    const products = await getProductsStatus();
    expect(products).toEqual([]);
  });

  it("checkEngineHealth returns failed status", async () => {
    const health = await checkEngineHealth();
    expect(health.status).toBe("failed");
  });

  it("isDemoMode returns true", () => {
    expect(isDemoMode()).toBe(true);
  });
});
