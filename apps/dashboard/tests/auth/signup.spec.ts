import { test, expect } from "@playwright/test";

test.describe("Sign Up Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("displays sign up form", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
  });

  test("shows OAuth provider buttons", async ({ page }) => {
    await expect(page.getByRole("button", { name: "GitHub" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Google" })).toBeVisible();
  });

  test("validates email format", async ({ page }) => {
    const emailInput = page.getByLabel("Email address");
    await emailInput.fill("invalid-email");
    await emailInput.blur();

    await expect(emailInput).toHaveAttribute("type", "email");
  });

  test("requires email to submit", async ({ page }) => {
    const continueButton = page.getByRole("button", { name: "Continue" });
    await continueButton.click();

    const emailInput = page.getByLabel("Email address");
    await expect(emailInput).toHaveValue("");
  });
});
