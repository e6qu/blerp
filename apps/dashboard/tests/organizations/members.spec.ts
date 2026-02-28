import { test, expect } from "@playwright/test";

test.describe("Member Management", () => {
  test("members tab is accessible", async ({ page }) => {
    await page.goto("/users");

    await expect(page.getByRole("heading", { name: "Organizations" })).toBeVisible();
  });

  test("member tabs exist when org is selected", async ({ page }) => {
    await page.goto("/users");

    await expect(page.getByRole("button", { name: "Members" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Invitations" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Webhooks" })).toBeVisible();
  });
});
