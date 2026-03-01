import { test, expect } from "@playwright/test";

test.describe("Member Management", () => {
  test("members page loads", async ({ page }) => {
    await page.goto("/users");
    await expect(page.locator("main")).toBeVisible();
  });
});
