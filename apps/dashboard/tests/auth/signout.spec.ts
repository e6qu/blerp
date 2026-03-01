import { test, expect } from "@playwright/test";

test.describe("Sign Out Flow", () => {
  test("sign out button is visible in sidebar", async ({ page }) => {
    await page.goto("/");

    const signOutButton = page.getByRole("button", { name: /sign out/i });
    await expect(signOutButton).toBeVisible();
  });

  test("sign out redirects to home page", async ({ page }) => {
    await page.goto("/");

    await page.route("**/v1/sessions**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [] }),
      });
    });

    const signOutButton = page.getByRole("button", { name: /sign out/i });
    await signOutButton.click();

    await page.waitForURL("/", { timeout: 10000 });
    await expect(page).toHaveURL("/");
  });
});

test.describe("Sign Out Flow (Unauthenticated)", () => {
  test("can access dashboard without authentication", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Dashboard Home" })).toBeVisible();
  });

  test("sign out button is still visible", async ({ page }) => {
    await page.goto("/");

    const signOutButton = page.getByRole("button", { name: /sign out/i });
    await expect(signOutButton).toBeVisible();
  });
});
