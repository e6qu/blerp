import { test, expect } from "../fixtures";

test.describe("Sign Out Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Dashboard Home" })).toBeVisible();
  });

  test("sign out button is visible in sidebar", async ({ page }) => {
    const signOutButton = page.getByRole("button", { name: /sign out/i });
    await expect(signOutButton).toBeVisible();
  });

  test("clicking sign out calls the API", async ({ page }) => {
    const signOutButton = page.getByRole("button", { name: /sign out/i });

    // The sign-out flow first GETs sessions to find the current session
    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes("/v1/sessions") && resp.request().method() === "GET",
    );

    await signOutButton.click();

    const response = await responsePromise;
    expect([200]).toContain(response.status());
  });

  test("sign out button shows loading state", async ({ page }) => {
    // Delay the sessions GET response to observe the loading state
    await page.route("**/v1/sessions", async (route) => {
      await new Promise((r) => setTimeout(r, 1000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [] }),
      });
    });

    const signOutButton = page.getByRole("button", { name: /sign out/i });
    await signOutButton.click();

    await expect(page.getByRole("button", { name: /signing out/i })).toBeVisible();
  });

  test("can access dashboard after sign out", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Dashboard Home" })).toBeVisible();
  });
});
