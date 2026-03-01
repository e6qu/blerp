import { test, expect } from "@playwright/test";

test.describe("Organization CRUD", () => {
  test.beforeEach(async ({ page }) => {
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

  test("modal has cancel and create buttons", async ({ page }) => {
    const createButton = page.getByRole("button", { name: /create organization/i });
    await createButton.click();

    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Create" })).toBeVisible();
  });

  test("cancel button closes modal", async ({ page }) => {
    const createButton = page.getByRole("button", { name: /create organization/i });
    await createButton.click();

    const cancelButton = page.getByRole("button", { name: "Cancel" });
    await cancelButton.click();

    await expect(page.getByRole("heading", { name: "Create organization" })).not.toBeVisible();
  });

  test("X button closes modal", async ({ page }) => {
    const createButton = page.getByRole("button", { name: /create organization/i });
    await createButton.click();

    const closeButton = page.locator("button").filter({ hasText: /^$/ }).first();
    await closeButton.click();

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

  test("create button is disabled while submitting", async ({ page }) => {
    await page.route("**/v1/organizations", (route) => {
      route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ id: "test-org-id", name: "Test Org" }),
      });
    });

    const createButton = page.getByRole("button", { name: /create organization/i });
    await createButton.click();

    const nameInput = page.getByLabel("Organization name");
    await nameInput.fill("Test Org");

    const modalCreateButton = page.getByRole("button", { name: "Create" });
    await modalCreateButton.click();

    await expect(page.getByRole("button", { name: /creating/i })).toBeVisible();
  });

  test("create organization success closes modal and shows org", async ({ page }) => {
    await page.route("**/v1/organizations", (route) => {
      route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ id: "test-org-id", name: "Test Org" }),
      });
    });

    await page.route("**/v1/organizations**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [{ id: "test-org-id", name: "Test Org" }] }),
      });
    });

    const createButton = page.getByRole("button", { name: /create organization/i });
    await createButton.click();

    const nameInput = page.getByLabel("Organization name");
    await nameInput.fill("Test Org");

    const modalCreateButton = page.getByRole("button", { name: "Create" });
    await modalCreateButton.click();

    await expect(page.getByRole("heading", { name: "Create organization" })).not.toBeVisible({
      timeout: 5000,
    });
  });

  test("empty state shown when no org selected", async ({ page }) => {
    await page.route("**/v1/organizations**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.goto("/users");

    await expect(page.getByText("Select an organization")).toBeVisible();
  });
});
