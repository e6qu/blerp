import { test, expect } from "../fixtures";

test.describe("Organization Deletion", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/users");
    // Wait for orgs to load
    await expect(page.getByRole("heading", { name: "Organizations" })).toBeVisible();
  });

  test("danger zone is visible when org is selected", async ({ page }) => {
    // Click on an org in the list (use the seeded org)
    await page.getByRole("button", { name: "Demo Organization" }).click();

    await expect(page.getByText("Danger Zone")).toBeVisible();
    await expect(page.getByRole("button", { name: /Delete organization/ })).toBeVisible();
  });

  test("delete modal opens and requires confirmation", async ({ page }) => {
    await page.getByRole("button", { name: "Demo Organization" }).click();

    await page.getByRole("button", { name: /Delete organization/ }).click();

    await expect(page.getByRole("heading", { name: "Delete Organization" })).toBeVisible();
    // Submit button should be disabled until name matches
    const submitButton = page.locator("form button[type='submit']");
    await expect(submitButton).toBeDisabled();
  });

  test("delete modal can be cancelled", async ({ page }) => {
    await page.getByRole("button", { name: "Demo Organization" }).click();

    await page.getByRole("button", { name: /Delete organization/ }).click();
    await expect(page.getByRole("heading", { name: "Delete Organization" })).toBeVisible();

    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("heading", { name: "Delete Organization" })).not.toBeVisible();
  });
});
