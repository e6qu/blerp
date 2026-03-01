import { test, expect } from "@playwright/test";

test.describe("Session Management", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main")).toBeVisible();
  });

  test("auth page loads", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.locator("main")).toBeVisible();
  });
});
