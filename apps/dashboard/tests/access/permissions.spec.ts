import { test, expect } from "@playwright/test";

test.describe("Permission Checks", () => {
  test("sidebar renders with all navigation", async ({ page }) => {
    await page.goto("/");

    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();

    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Organizations" })).toBeVisible();
    await expect(page.getByRole("link", { name: "User Management" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Auth" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
  });

  test("main content area is present", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main")).toBeVisible();
  });

  test("all pages are accessible", async ({ page }) => {
    await page.goto("/users");
    await expect(page.locator("main")).toBeVisible();

    await page.goto("/auth");
    await expect(page.locator("main")).toBeVisible();

    await page.goto("/settings");
    await expect(page.locator("main")).toBeVisible();
  });
});
