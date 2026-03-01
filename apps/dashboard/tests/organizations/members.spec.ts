import { test, expect } from "@playwright/test";

test.describe("Member Management", () => {
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

    await page.route("**/v1/organizations/org-1/memberships**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            { id: "member-1", user_id: "user-1", role: "owner" },
            { id: "member-2", user_id: "user-2", role: "admin" },
            { id: "member-3", user_id: "user-3", role: "member" },
          ],
        }),
      });
    });

    await page.goto("/users");

    await page.getByRole("button", { name: "Test Organization" }).click();
  });

  test("members list loads for selected organization", async ({ page }) => {
    await expect(page.getByText("User ID: user-1")).toBeVisible();
    await expect(page.getByText("User ID: user-2")).toBeVisible();
    await expect(page.getByText("User ID: user-3")).toBeVisible();
  });

  test("member roles are displayed", async ({ page }) => {
    await expect(page.locator("text=owner").first()).toBeVisible();
    await expect(page.locator("text=admin").first()).toBeVisible();
    await expect(page.locator("text=member").first()).toBeVisible();
  });

  test("edit button is visible for each member", async ({ page }) => {
    const editButtons = page.locator("button").filter({ has: page.locator("svg") });
    await expect(editButtons.first()).toBeVisible();
  });

  test("clicking edit shows role dropdown", async ({ page }) => {
    const editButton = page.locator("tr").filter({ hasText: "user-2" }).locator("button").first();
    await editButton.click();

    await expect(page.getByRole("combobox")).toBeVisible();
  });

  test("cancel edit returns to view mode", async ({ page }) => {
    const editButton = page.locator("tr").filter({ hasText: "user-2" }).locator("button").first();
    await editButton.click();

    const cancelButton = page
      .locator("tr")
      .filter({ hasText: "user-2" })
      .getByRole("button")
      .filter({ hasText: "" })
      .last();
    await cancelButton.click();

    await expect(page.getByRole("combobox")).not.toBeVisible();
  });

  test("delete member shows confirmation dialog", async ({ page }) => {
    page.on("dialog", (dialog) => {
      expect(dialog.message()).toContain("Are you sure");
      dialog.dismiss();
    });

    const deleteButton = page.locator("tr").filter({ hasText: "user-3" }).locator("button").last();
    await deleteButton.click();
  });
});

test.describe("Member Management - Empty State", () => {
  test("empty state shown when no members", async ({ page }) => {
    await page.route("**/v1/organizations**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [{ id: "org-1", name: "Test Organization" }],
        }),
      });
    });

    await page.route("**/v1/organizations/org-1/memberships**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.goto("/users");
    await page.getByRole("button", { name: "Test Organization" }).click();

    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(0);
  });
});
