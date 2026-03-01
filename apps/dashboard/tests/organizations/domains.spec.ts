import { test, expect } from "@playwright/test";

test.describe("Organization Domains", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/v1/organizations**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [{ id: "org-1", name: "Test Organization" }],
        }),
      });
    });

    await page.goto("/users");
    await page.getByRole("button", { name: "Test Organization" }).click();
  });

  test("organization tabs are visible", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Members" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Invitations" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Webhooks" })).toBeVisible();
  });
});
