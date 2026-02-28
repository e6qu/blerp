import { test, expect } from "@playwright/test";

test.describe("Security Settings", () => {
  test("security page loads", async ({ page }) => {
    await page.goto("/auth");

    await expect(page.getByRole("heading", { name: "Security" })).toBeVisible();
  });

  test("passkey section is visible", async ({ page }) => {
    await page.goto("/auth");

    await expect(page.getByRole("heading", { name: "Passkeys" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add Passkey" })).toBeVisible();
  });
});
