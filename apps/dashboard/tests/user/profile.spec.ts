import { test, expect } from "@playwright/test";

test.describe("Profile Management", () => {
  test("profile section is accessible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main")).toBeVisible();
  });
});
