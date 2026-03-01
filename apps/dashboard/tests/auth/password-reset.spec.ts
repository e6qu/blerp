import { test, expect } from "@playwright/test";

test.describe("Password Reset Flow", () => {
  test("password reset is not yet implemented - shows signup form", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  });
});
