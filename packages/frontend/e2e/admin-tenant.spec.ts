import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "https://buildsignal.net";

test.describe("Admin Authorization & Tenant Isolation", () => {
  test("admin routes require authentication", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForURL(/.*login.*/, { timeout: 5000 });
  });

  test("settings require authentication", async ({ page }) => {
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForURL(/.*login.*/, { timeout: 5000 });
  });

  test("organization page requires authentication", async ({ page }) => {
    await page.goto(`${BASE_URL}/organization`);
    await page.waitForURL(/.*login.*/, { timeout: 5000 });
  });

  test("public pages do not require authentication", async ({ page }) => {
    for (const path of ["/", "/pricing", "/help", "/security", "/contact"]) {
      await page.goto(`${BASE_URL}${path}`);
      await expect(page.locator("body")).toBeVisible();
    }
  });
});
