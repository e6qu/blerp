import { test, expect } from "@playwright/test";

test.describe("Password Reset Flow", () => {
  test("password reset page is accessible", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  });
});
