import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "https://buildsignal.net";

test.describe("Public Journey", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/BuildSignal/);
  });

  test("pricing page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await expect(page.locator("h1:has-text('Pricing')")).toBeVisible();
  });

  test("login page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator("text=BuildSignal")).toBeVisible();
  });
});
