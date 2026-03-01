import { test, expect } from "@playwright/test";

test.describe("Security Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/v1/auth/webauthn/passkeys**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.goto("/auth");

    const securityTab = page.getByRole("button", { name: "Security" });
    await securityTab.click();
  });

  test("password section is visible", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Password" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Change password" })).toBeVisible();
  });

  test("passkeys section is visible", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Passkeys" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add Passkey" })).toBeVisible();
  });

  test("2FA section is visible", async ({ page }) => {
    await expect(page.getByText("Two-Factor Authentication")).toBeVisible();
    await expect(page.getByText("Not enabled")).toBeVisible();
  });
});
