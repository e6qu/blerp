import { test, expect } from "@playwright/test";

async function resetProfileName(page: import("@playwright/test").Page) {
  await page.goto("/auth");
  await page.getByRole("button", { name: "Edit profile" }).click();
  const firstNameInput = page.locator("#firstName");
  await firstNameInput.clear();
  await firstNameInput.fill("Admin");
  const responsePromise = page.waitForResponse(
    (resp) => resp.url().includes("/v1/users/demo_user") && resp.request().method() === "PATCH",
  );
  await page.getByRole("button", { name: "Save" }).click();
  await responsePromise;
}

test.describe("Toast Notifications", () => {
  test("toast appears after profile update", async ({ page }) => {
    await page.goto("/auth");

    // Click Edit profile button
    await page.getByRole("button", { name: "Edit profile" }).click();

    // Fill in a name change
    const firstNameInput = page.locator("#firstName");
    await firstNameInput.clear();
    await firstNameInput.fill("Toast Test");

    // Submit the form
    await page.getByRole("button", { name: "Save" }).click();

    // Toast should appear
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Profile updated successfully")).toBeVisible();

    // Reset name back to Admin
    await resetProfileName(page);
  });

  test("toast auto-dismisses after timeout", async ({ page }) => {
    await page.goto("/auth");

    await page.getByRole("button", { name: "Edit profile" }).click();
    const firstNameInput = page.locator("#firstName");
    await firstNameInput.clear();
    await firstNameInput.fill("Toast Dismiss");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByRole("alert")).toBeVisible({ timeout: 5000 });
    // Toast should dismiss after ~4 seconds
    await expect(page.getByRole("alert")).not.toBeVisible({ timeout: 6000 });

    // Reset name back to Admin
    await resetProfileName(page);
  });
});
