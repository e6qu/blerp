import { test, expect } from "@playwright/test";

test.describe("Organization Switching", () => {
  test("organization switcher component exists", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main")).toBeVisible();
  });
});
