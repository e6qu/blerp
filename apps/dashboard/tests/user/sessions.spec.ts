import { test, expect } from "@playwright/test";

test.describe("Session Management", () => {
  test("sessions page is accessible", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Dashboard Home" })).toBeVisible();
  });

  test("auth page shows security settings", async ({ page }) => {
    await page.goto("/auth");

    await expect(page.getByRole("heading", { name: "Security" })).toBeVisible();
  });
});
