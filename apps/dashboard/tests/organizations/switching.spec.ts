import { test, expect } from "../fixtures";

test.describe("Organization Switching", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("organization switcher is visible in sidebar", async ({ page }) => {
    const switcher = page
      .locator("aside")
      .locator("button")
      .filter({ hasText: /select organization|demo organization/i })
      .first();
    await expect(switcher).toBeVisible();
  });

  test("clicking switcher opens dropdown", async ({ page }) => {
    const switcher = page
      .locator("button")
      .filter({ hasText: /select organization|demo organization/i })
      .first();
    await switcher.click();

    await expect(
      page.getByRole("button", { name: "Demo Organization", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Demo Monite Organization" })).toBeVisible();
  });

  test("dropdown shows create organization button", async ({ page }) => {
    const switcher = page
      .locator("button")
      .filter({ hasText: /select organization|demo organization/i })
      .first();
    await switcher.click();

    await expect(page.getByRole("button", { name: /create organization/i })).toBeVisible();
  });

  test("selecting organization updates switcher text", async ({ page }) => {
    const switcher = page
      .locator("button")
      .filter({ hasText: /select organization/i })
      .first();
    await switcher.click();

    await page.getByRole("button", { name: "Demo Organization", exact: true }).click();

    await expect(page.locator("aside").getByText("Demo Organization")).toBeVisible();
  });

  test("create organization from switcher opens modal", async ({ page }) => {
    const switcher = page
      .locator("button")
      .filter({ hasText: /select organization|demo organization/i })
      .first();
    await switcher.click();

    await page.getByRole("button", { name: /create organization/i }).click();

    await expect(page.getByRole("heading", { name: "Create organization" })).toBeVisible();
  });
});
