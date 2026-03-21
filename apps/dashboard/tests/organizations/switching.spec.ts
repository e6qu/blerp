import { test, expect } from "../fixtures";

// The organization switcher was removed from the dashboard sidebar
// because it was non-functional (only set local React state without
// updating any API context). Organization management is done via the
// Organizations page (/users) instead.
//
// These tests verify the Organizations page works as the replacement.

test.describe("Organization Selection", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/users");
  });

  test("organizations page lists seeded organizations", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Demo Organization", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Demo Monite Organization" })).toBeVisible();
  });

  test("clicking organization shows its members", async ({ page }) => {
    await page.getByRole("button", { name: "Demo Organization", exact: true }).click();
    await expect(page.getByRole("button", { name: "Members" })).toBeVisible();
  });

  test("create organization button opens modal", async ({ page }) => {
    await page.getByRole("button", { name: /create organization/i }).click();
    await expect(page.getByRole("heading", { name: /create organization/i })).toBeVisible();
  });
});
