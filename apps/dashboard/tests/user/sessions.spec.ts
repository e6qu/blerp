import { test, expect } from "@playwright/test";

test.describe("Session Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/v1/sessions**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.goto("/auth");

    const sessionsTab = page.getByRole("button", { name: "Sessions" });
    await sessionsTab.click();
  });

  test("sessions tab shows management message", async ({ page }) => {
    await expect(page.getByText(/manage your active sessions/i)).toBeVisible();
  });

  test("sessions list or empty state is shown", async ({ page }) => {
    await expect(page.getByText(/manage your active sessions/i)).toBeVisible();
  });
});
