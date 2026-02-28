import { test, expect } from "@playwright/test";

test.describe("Sign In Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("sign in form is accessible from home page", async ({ page }) => {
    const signUpHeading = page.getByRole("heading", { name: "Create your account" });
    await expect(signUpHeading).toBeVisible();
  });

  test("email input accepts valid email", async ({ page }) => {
    const emailInput = page.getByLabel("Email address");
    await emailInput.fill("test@example.com");
    await expect(emailInput).toHaveValue("test@example.com");
  });

  test("OAuth buttons are present", async ({ page }) => {
    const githubButton = page.getByRole("button", { name: "GitHub" });
    const googleButton = page.getByRole("button", { name: "Google" });

    await expect(githubButton).toBeVisible();
    await expect(googleButton).toBeVisible();
  });
});
