import { test, expect } from "@playwright/test";

test.describe("Account Deletion", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth");
  });

  test("danger zone is visible on account tab", async ({ page }) => {
    await expect(page.getByText("Danger Zone")).toBeVisible();
    await expect(page.getByRole("button", { name: "Delete account", exact: true })).toBeVisible();
  });

  test("delete account modal opens", async ({ page }) => {
    await page.getByRole("button", { name: "Delete account", exact: true }).click();

    await expect(page.getByRole("heading", { name: "Delete Account" })).toBeVisible();
    await expect(page.getByText("DELETE MY ACCOUNT")).toBeVisible();
  });

  test("delete account modal requires exact confirmation text", async ({ page }) => {
    await page.getByRole("button", { name: "Delete account", exact: true }).click();

    const submitButton = page.locator("form button[type='submit']");
    await expect(submitButton).toBeDisabled();

    await page.locator("#account-delete-confirm").fill("wrong text");
    await expect(submitButton).toBeDisabled();
  });

  test("delete account modal can be cancelled", async ({ page }) => {
    await page.getByRole("button", { name: "Delete account", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Delete Account" })).toBeVisible();

    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("heading", { name: "Delete Account" })).not.toBeVisible();
  });
});
