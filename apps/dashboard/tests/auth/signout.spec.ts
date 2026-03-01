import { test, expect } from "../fixtures";

test.describe("Sign Out Flow", () => {
  test("sign out button is visible in sidebar", async ({ page }) => {
    await page.goto("/");

    const signOutButton = page.getByRole("button", { name: /sign out/i });
    await expect(signOutButton).toBeVisible();
  });

  test("sign out button shows loading state when clicked", async ({ page }) => {
    await page.goto("/");

    await page.route("**/v1/sessions", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [] }),
      });
    });

    const signOutButton = page.getByRole("button", { name: /sign out/i });
    await signOutButton.click();

    await expect(page.getByRole("button", { name: /signing out/i })).toBeVisible();
  });

  test("sign out redirects to home page", async ({ page }) => {
    await page.goto("/");

    await page.route("**/v1/sessions**", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: [] }),
        });
      } else {
        route.continue();
      }
    });

    const signOutButton = page.getByRole("button", { name: /sign out/i });
    await signOutButton.click();

    await page.waitForURL("/", { timeout: 10000 });
    await expect(page).toHaveURL("/");
  });

  test("sign out clears session cookie", async ({ page }) => {
    await page.goto("/");

    await page.route("**/v1/sessions**", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: [{ id: "test-session-id" }] }),
        });
      } else if (route.request().method() === "DELETE") {
        route.fulfill({
          status: 204,
        });
      } else {
        route.continue();
      }
    });

    await page.context().addCookies([
      {
        name: "__blerp_session",
        value: "test-session-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    const signOutButton = page.getByRole("button", { name: /sign out/i });
    await signOutButton.click();

    await page.waitForTimeout(500);

    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "__blerp_session");
    expect(sessionCookie?.value).toBeFalsy();
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
