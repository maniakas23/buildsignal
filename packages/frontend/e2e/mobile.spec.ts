import { test, expect } from "@playwright/test";

test("mobile navigation works", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("https://app.buildsignal.com");
  await expect(page).toHaveTitle(/BuildSignal/);
});
