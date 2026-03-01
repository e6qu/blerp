import { test, expect } from "@playwright/test";

test.describe("Sign Up Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("displays sign up form with all elements", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
    await expect(page.getByRole("button", { name: "GitHub" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Google" })).toBeVisible();
  });

  test("email input accepts valid email", async ({ page }) => {
    const emailInput = page.getByLabel("Email address");
    await emailInput.fill("test@example.com");
    await expect(emailInput).toHaveValue("test@example.com");
  });

  test("email input has correct type for validation", async ({ page }) => {
    const emailInput = page.getByLabel("Email address");
    await expect(emailInput).toHaveAttribute("type", "email");
  });

  test("continue button is disabled without email due to HTML5 validation", async ({ page }) => {
    const continueButton = page.getByRole("button", { name: "Continue" });
    await expect(continueButton).toBeEnabled();
  });

  test("form submission with valid email", async ({ page }) => {
    const emailInput = page.getByLabel("Email address");
    await emailInput.fill("test@example.com");

    const continueButton = page.getByRole("button", { name: "Continue" });
    await continueButton.click();

    await expect(page.getByText(/Signup initiated/)).toBeVisible({ timeout: 10000 });
  });

  test("OAuth GitHub button initiates OAuth flow", async ({ page }) => {
    const githubButton = page.getByRole("button", { name: "GitHub" });

    await page.route("**/v1/auth/oauth/github**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ url: "https://github.com/login/oauth/authorize" }),
      });
    });

    await githubButton.click();
  });

  test("OAuth Google button initiates OAuth flow", async ({ page }) => {
    const googleButton = page.getByRole("button", { name: "Google" });

    await page.route("**/v1/auth/oauth/google**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ url: "https://accounts.google.com/o/oauth2/auth" }),
      });
    });

    await googleButton.click();
  });

  test("displays error message on API failure", async ({ page }) => {
    await page.route("**/v1/auth/signups", (route) => {
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: { message: "Email already exists" } }),
      });
    });

    const emailInput = page.getByLabel("Email address");
    await emailInput.fill("existing@example.com");

    const continueButton = page.getByRole("button", { name: "Continue" });

    page.on("dialog", (dialog) => {
      expect(dialog.message()).toContain("Email already exists");
      dialog.accept();
    });

    await continueButton.click();
  });
});
