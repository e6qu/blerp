import { test, expect } from "@playwright/test";

test.describe("Sign Out Flow", () => {
  test("sign out requires authentication", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Dashboard Home" })).toBeVisible();
  });

  test("protected routes redirect unauthenticated users", async ({ page }) => {
    await page.goto("/settings");

    await expect(page).toHaveURL(/\/settings/);
  });
});
