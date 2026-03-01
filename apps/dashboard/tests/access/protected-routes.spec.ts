import { test, expect } from "@playwright/test";

test.describe("Protected Routes", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main")).toBeVisible();
  });

  test("settings page loads", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("main")).toBeVisible();
  });

  test("auth page loads", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.locator("main")).toBeVisible();
  });

  test("users page loads", async ({ page }) => {
    await page.goto("/users");
    await expect(page.locator("main")).toBeVisible();
  });
});
