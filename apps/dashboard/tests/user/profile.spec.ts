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

  test("profile page shows Account tab", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Account" })).toBeVisible();
  });

  test("profile page shows Security tab", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Security" })).toBeVisible();
  });

  test("profile page shows Sessions tab", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Sessions" })).toBeVisible();
  });

  test("Security tab shows passkeys section when clicked", async ({ page }) => {
    const securityTab = page.getByRole("button", { name: "Security" });
    await securityTab.click();

    await expect(page.getByRole("heading", { name: "Password" })).toBeVisible();
  });
});
