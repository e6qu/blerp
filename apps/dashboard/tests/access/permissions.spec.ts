import { test, expect } from "@playwright/test";

test.describe("Permission Checks", () => {
  test("sign up component renders", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  });

  test("navigation menu is visible", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: /home/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /users/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /auth/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /settings/i })).toBeVisible();
  });

  test("main content area is present", async ({ page }) => {
    await page.goto("/");

    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();
  });
});
