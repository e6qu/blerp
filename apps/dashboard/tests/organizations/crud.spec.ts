import { test, expect } from "@playwright/test";

test.describe("Organization CRUD", () => {
  test("organizations page is accessible", async ({ page }) => {
    await page.goto("/users");

    await expect(page.getByRole("heading", { name: "Organizations" })).toBeVisible();
  });

  test("create organization button is visible", async ({ page }) => {
    await page.goto("/users");

    await expect(page.getByRole("button", { name: "Create Organization" })).toBeVisible();
  });

  test("organization list shows placeholder when no org selected", async ({ page }) => {
    await page.goto("/users");

    await expect(page.getByText("Select an organization")).toBeVisible();
  });
});
