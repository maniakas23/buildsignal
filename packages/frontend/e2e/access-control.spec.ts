import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "https://buildsignal.net";

test.describe("Access Control", () => {
  test("dashboard requires auth", async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForURL(/.*login.*/, { timeout: 5000 });
  });

  test("billing requires auth", async ({ page }) => {
    await page.goto(`${BASE_URL}/billing`);
    await page.waitForURL(/.*login.*/, { timeout: 5000 });
  });
});
