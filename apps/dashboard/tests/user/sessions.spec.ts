import { test, expect } from "@playwright/test";

test.describe("Session Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth");
    await page.getByRole("button", { name: "Sessions" }).click();
  });

  test("can navigate to sessions tab", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Sessions" })).toHaveClass(/border-blue-600/);
  });

  test("sessions tab shows description", async ({ page }) => {
    await expect(page.getByText(/manage your active sessions/i)).toBeVisible();
  });

  test("sessions table headers are visible", async ({ page }) => {
    await expect(page.locator("th").getByText("Device")).toBeVisible();
    await expect(page.locator("th").getByText("Last Active")).toBeVisible();
    await expect(page.locator("th").getByText("Actions")).toBeVisible();
  });
});
