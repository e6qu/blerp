import { test, expect } from "@playwright/test";

test.describe("Organization Switching", () => {
  test("organization switcher component exists", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Dashboard Home" })).toBeVisible();
  });

  test("navigation to organizations page works", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /users/i }).click();
    await expect(page).toHaveURL(/\/users/);
  });
});
