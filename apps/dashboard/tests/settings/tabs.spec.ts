import { test, expect } from "../fixtures";

test.describe("Settings Page Tabs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings");
  });

  test("settings page has all three tabs", async ({ page }) => {
    await expect(page.getByRole("button", { name: "General" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Audit Logs" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Usage" })).toBeVisible();
  });

  test("can switch to Audit Logs tab", async ({ page }) => {
    await page.getByRole("button", { name: "Audit Logs" }).click();

    const auditTab = page.getByRole("button", { name: "Audit Logs" });
    await expect(auditTab).toHaveClass(/border-blue-600/);
  });

  test("can switch to Usage tab", async ({ page }) => {
    await page.getByRole("button", { name: "Usage" }).click();

    const usageTab = page.getByRole("button", { name: "Usage" });
    await expect(usageTab).toHaveClass(/border-blue-600/);
  });

  test("can switch back to General tab", async ({ page }) => {
    await page.getByRole("button", { name: "Usage" }).click();
    await page.getByRole("button", { name: "General" }).click();

    const generalTab = page.getByRole("button", { name: "General" });
    await expect(generalTab).toHaveClass(/border-blue-600/);
  });
});
