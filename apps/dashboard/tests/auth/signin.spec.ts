import { test as base, expect } from "@playwright/test";

// Sign-in tests need unauthenticated state — don't use session fixtures
const test = base;

test.describe("Sign In Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Ensure we see the auth form (not redirected to /users)
    await page.waitForTimeout(500);
  });

  test("sign in form is accessible from home page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Sign in to your account" })).toBeVisible();
  });

  test("sign in page is accessible via /sign-in route", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("heading", { name: "Sign in to your account" })).toBeVisible();
  });

  test("email input accepts valid email", async ({ page }) => {
    const emailInput = page.locator("#signin-email");
    await emailInput.fill("test@example.com");
    await expect(emailInput).toHaveValue("test@example.com");
  });

  test("OAuth buttons are present on sign in", async ({ page }) => {
    // Navigate to dedicated sign-in page where there's only one set of OAuth buttons
    await page.goto("/sign-in");
    await expect(page.getByRole("button", { name: /GitHub/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Google/i })).toBeVisible();
  });

  test("email submission calls the signin API", async ({ page }) => {
    const emailInput = page.locator("#signin-email");
    await emailInput.fill("alice@blerp.io");

    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes("/v1/auth/signins") && resp.request().method() === "POST",
    );

    const signinForm = page.locator("form").filter({ has: page.locator("#signin-email") });
    await signinForm.getByRole("button", { name: "Continue" }).click();

    const response = await responsePromise;
    expect([200, 201, 400]).toContain(response.status());
  });

  test("shows password step after valid email", async ({ page }) => {
    await page.route("**/v1/auth/signins", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            id: "sin_test123",
            identifier: "test@example.com",
            status: "needs_first_factor",
            strategy: "password",
            mfa_required: false,
            available_strategies: ["password"],
          }),
        });
      } else {
        await route.continue();
      }
    });

    const emailInput = page.locator("#signin-email");
    await emailInput.fill("test@example.com");

    const signinForm = page.locator("form").filter({ has: page.locator("#signin-email") });
    await signinForm.getByRole("button", { name: "Continue" }).click();

    await expect(page.locator("#signin-password")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Signing in as")).toBeVisible();
  });

  test("shows error on invalid email", async ({ page }) => {
    await page.route("**/v1/auth/signins", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: { message: "No account found with that email address" } }),
      });
    });

    const emailInput = page.locator("#signin-email");
    await emailInput.fill("nonexistent@example.com");

    const signinForm = page.locator("form").filter({ has: page.locator("#signin-email") });
    await signinForm.getByRole("button", { name: "Continue" }).click();

    await expect(page.locator("div.bg-red-50").first()).toBeVisible({ timeout: 5000 });
  });

  test("back button returns to email step", async ({ page }) => {
    await page.route("**/v1/auth/signins", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            id: "sin_test123",
            status: "needs_first_factor",
            strategy: "password",
          }),
        });
      } else {
        await route.continue();
      }
    });

    const emailInput = page.locator("#signin-email");
    await emailInput.fill("test@example.com");

    const signinForm = page.locator("form").filter({ has: page.locator("#signin-email") });
    await signinForm.getByRole("button", { name: "Continue" }).click();

    await expect(page.locator("#signin-password")).toBeVisible({ timeout: 5000 });

    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.locator("#signin-email")).toBeVisible();
  });

  test("has link to sign up page", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Sign up" })).toBeVisible();
  });
});
