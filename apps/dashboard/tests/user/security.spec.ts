import { test, expect } from "@playwright/test";

test.describe("Security Settings", () => {
  test("security page loads", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.locator("main")).toBeVisible();
  });
});
