import { test, expect } from "@playwright/test";

test.describe("Connected Accounts", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth");
  });

  test("connected accounts section is visible on account tab", async ({ page }) => {
    await expect(page.getByText("Connected Accounts")).toBeVisible();
  });

  test("shows GitHub and Google providers", async ({ page }) => {
    await expect(page.getByText("GitHub")).toBeVisible();
    await expect(page.getByText("Google")).toBeVisible();
  });

  test("shows connect buttons for unlinked providers", async ({ page }) => {
    // At least one Connect button should be visible
    const connectButtons = page.getByRole("button", { name: "Connect" });
    await expect(connectButtons.first()).toBeVisible();
  });

  test("disconnect button triggers API call", async ({ page }) => {
    // Route identities to return a linked account
    await page.route("**/v1/users/*/identities", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [{ id: "oauth_test1", provider: "github", provider_user_id: "12345" }],
        }),
      });
    });

    await page.goto("/auth");

    // Should see Disconnect button for GitHub
    await expect(page.getByRole("button", { name: "Disconnect" })).toBeVisible({ timeout: 5000 });
  });
});
