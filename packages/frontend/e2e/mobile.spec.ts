import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "https://buildsignal.net";

test.describe("Mobile", () => {
  test("responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await expect(page.locator("body")).toBeVisible();
  });
});
