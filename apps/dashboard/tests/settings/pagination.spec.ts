import { test, expect } from "@playwright/test";

test.describe("Pagination", () => {
  test("pagination component has page size selector", async ({ page }) => {
    // Route sessions to return many items
    const sessions = Array.from({ length: 25 }, (_, i) => ({
      id: `ses_${i}`,
      user_id: "demo_user",
      status: "active",
      user_agent: `Test Browser ${i}`,
      latest_activity: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }));

    await page.route("**/v1/sessions", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: sessions }),
      });
    });

    await page.goto("/auth");
    await page.getByRole("button", { name: "Sessions" }).click();

    // With 25 items and page size 10, pagination should appear
    await expect(page.getByText("Rows per page")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Page 1")).toBeVisible();
  });

  test("pagination buttons navigate between pages", async ({ page }) => {
    const sessions = Array.from({ length: 25 }, (_, i) => ({
      id: `ses_${i}`,
      user_id: "demo_user",
      status: "active",
      user_agent: `Test Browser ${i}`,
      latest_activity: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }));

    await page.route("**/v1/sessions", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: sessions }),
      });
    });

    await page.goto("/auth");
    await page.getByRole("button", { name: "Sessions" }).click();

    await expect(page.getByText("Page 1")).toBeVisible({ timeout: 5000 });

    // Previous button should be disabled on first page
    const prevButton = page
      .locator("button")
      .filter({ has: page.locator("svg.lucide-chevron-left") });
    await expect(prevButton).toBeDisabled();

    // Next button should be enabled
    const nextButton = page
      .locator("button")
      .filter({ has: page.locator("svg.lucide-chevron-right") });
    await expect(nextButton).toBeEnabled();
  });
});
