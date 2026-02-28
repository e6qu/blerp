import { test, expect } from "@playwright/test";

test.describe("Protected Routes", () => {
  test("home page is accessible", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Dashboard Home" })).toBeVisible();
  });

  test("settings page is accessible", async ({ page }) => {
    await page.goto("/settings");

    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  });

  test("auth page is accessible", async ({ page }) => {
    await page.goto("/auth");

    await expect(page.getByRole("heading", { name: "Security" })).toBeVisible();
  });

  test("users page is accessible", async ({ page }) => {
    await page.goto("/users");

    await expect(page.getByRole("heading", { name: "Organizations" })).toBeVisible();
  });
});
