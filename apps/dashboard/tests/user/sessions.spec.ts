import { test, expect } from "@playwright/test";

test.describe("Session Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth");

    const sessionsTab = page.getByRole("button", { name: "Sessions" });
    await sessionsTab.click();
  });

  test("sessions tab shows management message", async ({ page }) => {
    await expect(page.getByText(/manage your active sessions/i)).toBeVisible();
  });

  test("sessions list or empty state is shown", async ({ page }) => {
    const sessionsViewer = page
      .locator("main")
      .locator("div")
      .filter({ hasText: /session/i })
      .first();
    await expect(sessionsViewer.or(page.getByText(/no.*session/i))).toBeVisible();
  });
});
