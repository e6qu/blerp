import { test, expect } from "@playwright/test";

test.describe("Organization Domains", () => {
  test("domains page loads", async ({ page }) => {
    await page.goto("/users");
    await expect(page.locator("main")).toBeVisible();
  });
});
