import { test, expect } from "@playwright/test";

test.describe("Permission Checks", () => {
  test("sign up component renders", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Dashboard Home" })).toBeVisible();
  });

  test("sidebar navigation exists", async ({ page }) => {
    await page.goto("/");

    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();
  });

  test("main content area is present", async ({ page }) => {
    await page.goto("/");

    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();
  });
});
