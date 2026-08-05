import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "https://buildsignal.net";
const API_URL = process.env.API_URL || "https://api.buildsignal.net";

test.describe("Authenticated Journey", () => {
  test("login page renders", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator("text=BuildSignal")).toBeVisible();
    await expect(page.locator("text=Continue with Kimi")).toBeVisible();
  });

  test("SSO discovery UI visible", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator("text=Enterprise SSO")).toBeVisible();
    await expect(page.locator("input[placeholder*='company.com']")).toBeVisible();
  });

  test("no beta language on public pages", async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    const body = await page.locator("body").textContent();
    expect(body).not.toContain("beta");
    expect(body).not.toContain("coming soon");
    expect(body).not.toContain("simulated");
  });

  test("protected routes redirect to login", async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForURL(/.*login.*/, { timeout: 5000 });
  });

  test("onboarding flow accessible", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator("text=Continue with Kimi")).toBeVisible();
  });

  test("pricing page displays plans", async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await expect(page.locator("text=Scout")).toBeVisible();
    await expect(page.locator("text=Professional")).toBeVisible();
    await expect(page.locator("text=Business")).toBeVisible();
    await expect(page.locator("text=Enterprise")).toBeVisible();
  });

  test("footer contains copyright", async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await expect(page.locator("text=BuildSignal")).toBeVisible();
  });

  test("404 page works", async ({ page }) => {
    await page.goto(`${BASE_URL}/nonexistent`);
    await expect(page.locator("text=404")).toBeVisible();
  });
});
