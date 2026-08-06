import { test, expect } from "@playwright/test";

test.describe("Authenticated User Journey", () => {
  test("user can navigate from home to pricing", async ({ page }) => {
    await page.goto("https://app.buildsignal.com");
    await page.click("text=Pricing");
    await expect(page).toHaveURL(/.*pricing/);
  });

  test("user can view security page", async ({ page }) => {
    await page.goto("https://app.buildsignal.com/security");
    await expect(page).toHaveTitle(/Security/);
  });

  test("user can view signup page", async ({ page }) => {
    await page.goto("https://app.buildsignal.com/signup");
    await expect(page).toHaveTitle(/Sign Up|Get Started/);
  });
});
