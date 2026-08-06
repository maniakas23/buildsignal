import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "https://buildsignal.net";

test.describe("Dashboard & Opportunity Flows", () => {
  test("dashboard requires authentication", async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForURL(/.*login.*/, { timeout: 5000 });
  });

  test("opportunity page requires authentication", async ({ page }) => {
    await page.goto(`${BASE_URL}/opportunities`);
    await page.waitForURL(/.*login.*/, { timeout: 5000 });
  });

  test("watchlist page requires authentication", async ({ page }) => {
    await page.goto(`${BASE_URL}/watchlist`);
    await page.waitForURL(/.*login.*/, { timeout: 5000 });
  });

  test("alerts page requires authentication", async ({ page }) => {
    await page.goto(`${BASE_URL}/alerts`);
    await page.waitForURL(/.*login.*/, { timeout: 5000 });
  });

  test("reports page requires authentication", async ({ page }) => {
    await page.goto(`${BASE_URL}/reports`);
    await page.waitForURL(/.*login.*/, { timeout: 5000 });
  });

  test("billing page requires authentication", async ({ page }) => {
    await page.goto(`${BASE_URL}/billing`);
    await page.waitForURL(/.*login.*/, { timeout: 5000 });
  });
});
