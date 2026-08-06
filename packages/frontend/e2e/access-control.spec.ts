import { test, expect } from "@playwright/test";

test("access control redirects unauthenticated users", async ({ page }) => {
  // Attempt to access protected page without auth
  await page.goto("https://app.buildsignal.com/dashboard");
  
  // Should redirect to login or show access denied
  await expect(page).toHaveURL(/.*login|.*signin|.*auth/);
});

test("access control allows authenticated users", async ({ page }) => {
  // This test would require authentication setup
  // Placeholder for authenticated access test
  await page.goto("https://app.buildsignal.com");
  await expect(page).toHaveTitle(/BuildSignal/);
});
