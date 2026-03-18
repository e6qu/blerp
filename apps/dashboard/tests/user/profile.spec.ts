import { test, expect } from "@playwright/test";

test.describe("User Profile", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth");
  });

  test("profile page shows all three tabs", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Account" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Security" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sessions" })).toBeVisible();
  });

  test("Account tab is active by default", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Account" })).toHaveClass(/border-blue-600/);
  });

  test("profile displays seeded user data", async ({ page }) => {
    // The seeded user has firstName "Admin" and lastName "User"
    // In view mode these appear as text inside <p> elements
    const profileSection = page.locator("text=Profile Information").locator("..");
    await expect(profileSection.getByText("Admin")).toBeVisible();
    await expect(profileSection.getByText("User", { exact: true })).toBeVisible();
  });

  test("edit profile button enters edit mode", async ({ page }) => {
    await page.getByRole("button", { name: "Edit profile" }).click();
    const firstNameInput = page.locator("#firstName");
    await expect(firstNameInput).toBeVisible();
    await expect(firstNameInput).toHaveValue("Admin");
  });

  test("edit profile pre-fills all fields", async ({ page }) => {
    await page.getByRole("button", { name: "Edit profile" }).click();
    await expect(page.locator("#firstName")).toHaveValue("Admin");
    await expect(page.locator("#lastName")).toHaveValue("User");
  });

  test("cancel edit returns to view mode", async ({ page }) => {
    await page.getByRole("button", { name: "Edit profile" }).click();
    await expect(page.locator("#firstName")).toBeVisible();

    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page.locator("#firstName")).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Edit profile" })).toBeVisible();
  });

  test("save profile calls the real API", async ({ page }) => {
    await page.getByRole("button", { name: "Edit profile" }).click();

    const firstNameInput = page.locator("#firstName");
    await firstNameInput.clear();
    await firstNameInput.fill("Updated");

    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes("/v1/users/demo_user") && resp.request().method() === "PATCH",
    );

    await page.getByRole("button", { name: "Save" }).click();

    const response = await responsePromise;
    expect(response.status()).toBe(200);

    // Reset the name back to Admin for other tests
    await page.getByRole("button", { name: "Edit profile" }).click();
    const resetInput = page.locator("#firstName");
    await resetInput.clear();
    await resetInput.fill("Admin");

    const resetResponse = page.waitForResponse(
      (resp) => resp.url().includes("/v1/users/demo_user") && resp.request().method() === "PATCH",
    );
    await page.getByRole("button", { name: "Save" }).click();
    await resetResponse;
  });

  test("saved profile data persists after reload", async ({ page }) => {
    const uniqueName = `Admin-${Date.now()}`;

    await page.getByRole("button", { name: "Edit profile" }).click();
    const firstNameInput = page.locator("#firstName");
    await firstNameInput.clear();
    await firstNameInput.fill(uniqueName);

    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes("/v1/users/demo_user") && resp.request().method() === "PATCH",
    );
    await page.getByRole("button", { name: "Save" }).click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);

    await page.reload();

    // After reload, click edit and verify the saved name is in the input
    await page.getByRole("button", { name: "Edit profile" }).click();
    await expect(page.locator("#firstName")).toHaveValue(uniqueName);

    // Reset to original
    const resetInput = page.locator("#firstName");
    await resetInput.clear();
    await resetInput.fill("Admin");
    const resetResponse = page.waitForResponse(
      (resp) => resp.url().includes("/v1/users/demo_user") && resp.request().method() === "PATCH",
    );
    await page.getByRole("button", { name: "Save" }).click();
    await resetResponse;
  });

  test("email list shows seeded email", async ({ page }) => {
    await expect(page.getByText("admin@demo-tenant.blerp.dev")).toBeVisible();
  });

  test("email shows verified status", async ({ page }) => {
    await expect(page.getByText("Verified")).toBeVisible();
  });
});
