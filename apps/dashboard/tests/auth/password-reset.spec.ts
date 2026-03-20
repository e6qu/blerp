import { test, expect } from "../fixtures";

test.describe("Password Change Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth");
  });

  test("change password link is accessible from security tab", async ({ page }) => {
    await page.getByRole("button", { name: "Security" }).click();
    await expect(page.getByRole("button", { name: "Change password" })).toBeVisible();
  });

  test("clicking change password opens modal", async ({ page }) => {
    await page.getByRole("button", { name: "Security" }).click();
    await page.getByRole("button", { name: "Change password" }).click();

    await expect(page.getByRole("heading", { name: "Change password" })).toBeVisible();
  });

  test("password strength indicator shows for weak password", async ({ page }) => {
    await page.getByRole("button", { name: "Security" }).click();
    await page.getByRole("button", { name: "Change password" }).click();

    await page.locator("#newPassword").fill("abc");

    await expect(page.getByText("Weak")).toBeVisible();
  });

  test("password strength indicator shows Strong for good password", async ({ page }) => {
    await page.getByRole("button", { name: "Security" }).click();
    await page.getByRole("button", { name: "Change password" }).click();

    await page.locator("#newPassword").fill("StrongP@ss1");

    await expect(page.getByText("Strong")).toBeVisible();
  });

  test("submit is disabled when passwords don't match", async ({ page }) => {
    await page.getByRole("button", { name: "Security" }).click();
    await page.getByRole("button", { name: "Change password" }).click();

    await page.locator("#newPassword").fill("StrongP@ss1");
    await page.locator("#confirmPassword").fill("DifferentP@ss1");

    const submitButton = page.getByRole("button", { name: "Change password" }).last();
    await expect(submitButton).toBeDisabled();
  });

  test("password change calls the real API", async ({ page }) => {
    await page.getByRole("button", { name: "Security" }).click();
    await page.getByRole("button", { name: "Change password" }).click();

    await page.locator("#newPassword").fill("StrongP@ss1");
    await page.locator("#confirmPassword").fill("StrongP@ss1");

    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes("/v1/users/demo_user") && resp.request().method() === "PATCH",
    );

    const submitButton = page.getByRole("button", { name: "Change password" }).last();
    await submitButton.click();

    const response = await responsePromise;
    expect(response.status()).toBe(200);
  });

  test("shows success state after password change", async ({ page }) => {
    await page.getByRole("button", { name: "Security" }).click();
    await page.getByRole("button", { name: "Change password" }).click();

    await page.locator("#newPassword").fill("StrongP@ss1");
    await page.locator("#confirmPassword").fill("StrongP@ss1");

    const submitButton = page.getByRole("button", { name: "Change password" }).last();
    await submitButton.click();

    await expect(page.getByText("Password Changed")).toBeVisible({ timeout: 10000 });
  });
});
