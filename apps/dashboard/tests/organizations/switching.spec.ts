import { test, expect } from "@playwright/test";

test.describe("Organization Switching", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/v1/organizations**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            { id: "org-1", name: "Organization One" },
            { id: "org-2", name: "Organization Two" },
          ],
        }),
      });
    });

    await page.goto("/");
  });

  test("organization switcher is visible in sidebar", async ({ page }) => {
    const switcher = page
      .locator("button")
      .filter({ hasText: /select organization|organization one/i })
      .first();
    await expect(switcher).toBeVisible();
  });

  test("clicking switcher opens dropdown", async ({ page }) => {
    const switcher = page
      .locator("button")
      .filter({ hasText: /select organization|organization one/i })
      .first();
    await switcher.click();

    await expect(page.getByRole("button", { name: "Organization One" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Organization Two" })).toBeVisible();
  });

  test("dropdown shows create organization button", async ({ page }) => {
    const switcher = page
      .locator("button")
      .filter({ hasText: /select organization|organization one/i })
      .first();
    await switcher.click();

    await expect(page.getByRole("button", { name: /create organization/i })).toBeVisible();
  });

  test("selecting organization updates switcher text", async ({ page }) => {
    const switcher = page
      .locator("button")
      .filter({ hasText: /select organization|organization one/i })
      .first();
    await switcher.click();

    const orgTwo = page.getByRole("button", { name: "Organization Two" });
    await orgTwo.click();

    await expect(page.locator("aside").getByText("Organization Two")).toBeVisible();
  });

  test("create organization in switcher opens modal", async ({ page }) => {
    const switcher = page
      .locator("button")
      .filter({ hasText: /select organization|organization one/i })
      .first();
    await switcher.click();

    const createButton = page.getByRole("button", { name: /create organization/i });
    await createButton.click();

    await expect(page.getByRole("heading", { name: "Create organization" })).toBeVisible();
  });
});
