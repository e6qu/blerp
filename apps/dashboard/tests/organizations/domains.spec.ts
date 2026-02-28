import { test, expect } from "@playwright/test";

test.describe("Organization Domains", () => {
  test("domains page is accessible through organizations", async ({ page }) => {
    await page.goto("/users");

    await expect(page.getByRole("heading", { name: "Organizations" })).toBeVisible();
  });
});
