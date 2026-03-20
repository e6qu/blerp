import { test, expect } from "../fixtures";

test.describe("Security Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth");
    await page.getByRole("button", { name: "Security" }).click();
  });

  test("can navigate to security tab", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Security" })).toHaveClass(/border-blue-600/);
  });

  test("password section is visible", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Password" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Change password" })).toBeVisible();
  });

  test("passkeys section is visible", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Passkeys" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add Passkey" })).toBeVisible();
  });

  test("2FA section shows not enabled", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Two-Factor Authentication" })).toBeVisible();
    await expect(page.getByText("Not enabled")).toBeVisible();
  });

  test("enable 2FA link is visible", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Enable 2FA" })).toBeVisible();
  });
});
