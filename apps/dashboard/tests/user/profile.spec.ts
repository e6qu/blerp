import { test, expect } from "@playwright/test";

test.describe("User Profile", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/v1/auth/webauthn/passkeys**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.route("**/v1/sessions**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.goto("/auth");
  });

  test("profile page shows Account tab content", async ({ page }) => {
    const accountTab = page.getByRole("button", { name: "Account" });
    await accountTab.click();

    await expect(page.getByText("Profile Information")).toBeVisible();
    await expect(page.getByText("Email Addresses")).toBeVisible();
  });

  test("profile page shows Security tab content", async ({ page }) => {
    const securityTab = page.getByRole("button", { name: "Security" });
    await securityTab.click();

    await expect(page.getByRole("heading", { name: "Password" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Passkeys" })).toBeVisible();
    await expect(page.getByText("Two-Factor Authentication")).toBeVisible();
  });

  test("profile page shows Sessions tab content", async ({ page }) => {
    const sessionsTab = page.getByRole("button", { name: "Sessions" });
    await sessionsTab.click();

    await expect(page.getByText(/manage your active sessions/i)).toBeVisible();
  });

  test("Add Passkey button is visible", async ({ page }) => {
    const securityTab = page.getByRole("button", { name: "Security" });
    await securityTab.click();

    await expect(page.getByRole("button", { name: "Add Passkey" })).toBeVisible();
  });
});
