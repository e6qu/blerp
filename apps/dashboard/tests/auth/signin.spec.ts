import { test, expect } from "@playwright/test";

test.describe("Sign In Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("sign in form is accessible from home page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  });

  test("email input accepts valid email", async ({ page }) => {
    const emailInput = page.getByLabel("Email address");
    await emailInput.fill("test@example.com");
    await expect(emailInput).toHaveValue("test@example.com");
  });

  test("OAuth buttons are present", async ({ page }) => {
    await expect(page.getByRole("button", { name: /GitHub/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Google/i })).toBeVisible();
  });

  test("form allows email entry", async ({ page }) => {
    const emailInput = page.getByLabel("Email address");
    await emailInput.fill("different-user@example.com");
    await expect(emailInput).toHaveValue("different-user@example.com");
  });
});
