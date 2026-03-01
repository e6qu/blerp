import { test, expect } from "@playwright/test";

test.describe("Permission Checks", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("sidebar renders with all navigation", async ({ page }) => {
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();

    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Users" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Auth" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
  });

  test("main content area is present", async ({ page }) => {
    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();
  });

  test("sign up component renders on home page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  });

  test("all pages are accessible without authentication", async ({ page }) => {
    await page.goto("/users");
    await expect(page.locator("main")).toBeVisible();

    await page.goto("/auth");
    await expect(page.locator("main")).toBeVisible();

    await page.goto("/settings");
    await expect(page.locator("main")).toBeVisible();
  });
});
