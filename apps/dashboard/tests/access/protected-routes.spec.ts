import { test, expect } from "../fixtures";

test.describe("Protected Routes", () => {
  test("home page loads with main content", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Dashboard Home" })).toBeVisible();
  });

  test("users page loads organization list", async ({ page }) => {
    await page.goto("/users");
    await expect(page.getByRole("heading", { name: "Organizations" })).toBeVisible();
    await expect(page.getByText("Demo Organization")).toBeVisible();
  });

  test("auth page loads user profile", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.getByRole("button", { name: "Account", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Security", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sessions", exact: true })).toBeVisible();
  });

  test("settings page loads project settings", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("button", { name: "General" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Audit Logs" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Usage" })).toBeVisible();
    await expect(page.locator(".font-mono", { hasText: "demo-project" })).toBeVisible();
  });
});
