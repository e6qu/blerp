import { test, expect } from "@playwright/test";

test.describe("User Management Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/users");
  });

  test("page renders with heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "User Management" })).toBeVisible();
  });

  test("search input is present", async ({ page }) => {
    await expect(page.getByPlaceholder("Search by name or email")).toBeVisible();
  });

  test("status filter is present", async ({ page }) => {
    await expect(page.getByRole("combobox")).toBeVisible();
  });

  test("users table renders with columns", async ({ page }) => {
    await expect(page.getByText("User", { exact: true })).toBeVisible();
    await expect(page.getByText("Email", { exact: true })).toBeVisible();
    await expect(page.getByText("Status", { exact: true })).toBeVisible();
  });

  test("navigation link exists in sidebar", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "User Management" })).toBeVisible();
  });

  test("search filters users", async ({ page }) => {
    // Type in search
    await page.getByPlaceholder("Search by name or email").fill("nonexistent-user-xyz");

    // Should show no users message
    await expect(page.getByText("No users found")).toBeVisible({ timeout: 5000 });
  });
});
