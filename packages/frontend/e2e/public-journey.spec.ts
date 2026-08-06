import { test, expect } from "@playwright/test";

test.describe("Public User Journey", () => {
  test("homepage loads correctly", async ({ page }) => {
    await page.goto("https://app.buildsignal.com");
    await expect(page).toHaveTitle(/BuildSignal/);
  });

  test("pricing page loads correctly", async ({ page }) => {
    await page.goto("https://app.buildsignal.com/pricing");
    await expect(page).toHaveTitle(/Pricing/);
  });

  test("security page loads correctly", async ({ page }) => {
    await page.goto("https://app.buildsignal.com/security");
    await expect(page).toHaveTitle(/Security/);
  });
});
