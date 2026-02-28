import { test, expect } from "@playwright/test";

test.describe("Profile Management", () => {
  test("profile section is accessible", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Dashboard Home" })).toBeVisible();
  });

  test("navigation shows user-related links", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: /users/i })).toBeVisible();
  });
});
