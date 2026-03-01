import { test, expect } from "@playwright/test";

test.describe("Protected Routes", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Dashboard Home" })).toBeVisible();
  });

  test("users page loads", async ({ page }) => {
    await page.goto("/users");
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Organizations" })).toBeVisible();
  });

  test("auth page loads", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Account Settings" })).toBeVisible();
  });

  test("settings page loads", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  });
});

test.describe("Route Content Verification", () => {
  test("home page shows sign up form", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeVisible();
  });

  test("users page shows organization management UI", async ({ page }) => {
    await page.goto("/users");

    await expect(page.getByRole("button", { name: /create organization/i })).toBeVisible();
  });

  test("auth page shows user profile tabs", async ({ page }) => {
    await page.goto("/auth");

    await expect(page.getByRole("button", { name: "Account" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Security" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sessions" })).toBeVisible();
  });

  test("settings page shows settings tabs", async ({ page }) => {
    await page.goto("/settings");

    await expect(page.getByRole("button", { name: "General" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Audit Logs" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Usage" })).toBeVisible();
  });
});
