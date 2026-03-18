import { test, expect } from "@playwright/test";

test.describe("Sign Up Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Dashboard Home" })).toBeVisible();
  });

  test("displays sign up form with all elements", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
    await expect(page.getByRole("button", { name: /GitHub/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Google/i })).toBeVisible();
  });

  test("email input accepts valid email and has correct type", async ({ page }) => {
    const emailInput = page.getByLabel("Email address");
    await emailInput.fill("test@example.com");
    await expect(emailInput).toHaveValue("test@example.com");
    await expect(emailInput).toHaveAttribute("type", "email");
  });

  test("form submission calls the real API", async ({ page }) => {
    const uniqueEmail = `e2e-signup-${Date.now()}@blerp.test`;
    await page.getByLabel("Email address").fill(uniqueEmail);

    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes("/v1/auth/signups") && resp.request().method() === "POST",
    );

    await page.getByRole("button", { name: "Continue" }).click();

    const response = await responsePromise;
    expect([200, 201, 400]).toContain(response.status());
  });

  test("submit button shows loading state during submission", async ({ page }) => {
    // Delay the API response to observe the loading state
    await page.route("**/v1/auth/signups", async (route) => {
      await new Promise((r) => setTimeout(r, 1000));
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ id: "test" }),
      });
    });

    const uniqueEmail = `e2e-loading-${Date.now()}@blerp.test`;
    await page.getByLabel("Email address").fill(uniqueEmail);

    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByRole("button", { name: "Submitting..." })).toBeVisible();
  });

  test("shows inline error on API failure", async ({ page }) => {
    // Route the API to return an error so we can verify error rendering
    await page.route("**/v1/auth/signups", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: { message: "Invalid email format" } }),
      });
    });

    await page.getByLabel("Email address").fill("bad-email@test.com");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.locator("div.bg-red-50")).toBeVisible({ timeout: 10000 });
  });

  test("shows success message on successful signup", async ({ page }) => {
    const uniqueEmail = `e2e-success-${Date.now()}@blerp.test`;
    await page.getByLabel("Email address").fill(uniqueEmail);

    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.locator("p.text-green-600")).toBeVisible({ timeout: 10000 });
  });

  test("OAuth buttons are clickable", async ({ page }) => {
    await expect(page.getByRole("button", { name: /GitHub/i })).toBeEnabled();
    await expect(page.getByRole("button", { name: /Google/i })).toBeEnabled();
  });
});
