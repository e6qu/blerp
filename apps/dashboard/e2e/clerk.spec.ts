import { test, expect } from "@playwright/test";

test("Dashboard should load without crashing", async ({ page }) => {
  await page.goto("http://localhost:3001");
  await expect(page).toHaveTitle(/Blerp Dashboard/);
});
