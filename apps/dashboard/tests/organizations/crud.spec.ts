import { test, expect } from "@playwright/test";

test.describe("Organization CRUD", () => {
  test("organizations page loads", async ({ page }) => {
    await page.goto("/users");
    await expect(page.locator("main")).toBeVisible();
  });
});
