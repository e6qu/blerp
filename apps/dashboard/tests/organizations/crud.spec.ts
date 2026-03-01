import { test, expect } from "@playwright/test";

test.describe("Organization CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/v1/organizations**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.goto("/users");
  });

  test("organizations page loads with header", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Organizations" })).toBeVisible();
  });

  test("create organization button is visible", async ({ page }) => {
    const createButton = page.getByRole("button", { name: /create organization/i });
    await expect(createButton).toBeVisible();
  });

  test("clicking create organization opens modal", async ({ page }) => {
    const createButton = page.getByRole("button", { name: /create organization/i });
    await createButton.click();

    await expect(page.getByRole("heading", { name: "Create organization" })).toBeVisible();
  });

  test("modal has name and slug inputs", async ({ page }) => {
    const createButton = page.getByRole("button", { name: /create organization/i });
    await createButton.click();

    await expect(page.getByLabel("Organization name")).toBeVisible();
    await expect(page.getByLabel("Organization slug")).toBeVisible();
  });

  test("cancel button closes modal", async ({ page }) => {
    const createButton = page.getByRole("button", { name: /create organization/i });
    await createButton.click();

    const cancelButton = page.getByRole("button", { name: "Cancel" });
    await cancelButton.click();

    await expect(page.getByRole("heading", { name: "Create organization" })).not.toBeVisible();
  });

  test("slug auto-generates from name", async ({ page }) => {
    const createButton = page.getByRole("button", { name: /create organization/i });
    await createButton.click();

    const nameInput = page.getByLabel("Organization name");
    await nameInput.fill("My Test Org");

    const slugInput = page.getByLabel("Organization slug");
    await expect(slugInput).toHaveValue("my-test-org");
  });

  test("slug can be manually edited", async ({ page }) => {
    const createButton = page.getByRole("button", { name: /create organization/i });
    await createButton.click();

    const nameInput = page.getByLabel("Organization name");
    await nameInput.fill("My Test Org");

    const slugInput = page.getByLabel("Organization slug");
    await slugInput.clear();
    await slugInput.fill("custom-slug");

    await expect(slugInput).toHaveValue("custom-slug");
  });

  test("empty state shown when no org selected", async ({ page }) => {
    await expect(page.getByText("Select an organization")).toBeVisible();
  });
});
