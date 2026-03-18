import { test, expect } from "@playwright/test";

test.describe("Settings General Tab", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings");
  });

  test("settings page loads with General tab active", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Settings", exact: true })).toBeVisible();
    const generalTab = page.getByRole("button", { name: "General" });
    await expect(generalTab).toHaveClass(/border-blue-600/);
  });

  test("project settings show seeded project name", async ({ page }) => {
    await expect(page.getByText("Project demo-tenant")).toBeVisible();
  });

  test("project settings show project ID", async ({ page }) => {
    const projectId = page.locator(".font-mono", { hasText: "demo-project" });
    await expect(projectId).toBeVisible();
  });

  test("edit settings button enters edit mode", async ({ page }) => {
    await page.getByRole("button", { name: "Edit settings" }).click();
    await expect(page.locator("#name")).toBeVisible();
  });

  test("edit settings pre-fills project name", async ({ page }) => {
    await page.getByRole("button", { name: "Edit settings" }).click();
    // Name may have been updated by a parallel test; just verify it's pre-filled
    await expect(page.locator("#name")).not.toHaveValue("");
  });

  test("cancel edit returns to view mode", async ({ page }) => {
    await page.getByRole("button", { name: "Edit settings" }).click();
    await expect(page.locator("#name")).toBeVisible();

    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.locator("#name")).not.toBeVisible();
  });

  test("save project settings calls real API", async ({ page }) => {
    await page.getByRole("button", { name: "Edit settings" }).click();

    const nameInput = page.locator("#name");
    await nameInput.clear();
    await nameInput.fill("Project demo-tenant updated");

    const responsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes("/v1/projects/demo-project") && resp.request().method() === "PUT",
    );

    await page.getByRole("button", { name: "Save" }).click();

    const response = await responsePromise;
    expect(response.status()).toBe(200);
  });

  test("API keys section shows create button", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Create key" })).toBeVisible();
  });

  test("seeded API key appears in list", async ({ page }) => {
    // The seeded key has prefix "pk_dev..." which gets displayed as "pk_dev..."
    await expect(page.getByText("pk_dev")).toBeVisible({ timeout: 5000 });
  });

  test("seeded API key shows correct type and environment", async ({ page }) => {
    // Multiple API keys may exist from parallel test runs, so use .first()
    await expect(page.getByText("publishable", { exact: true }).first()).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator("td").getByText("development", { exact: true }).first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("clicking create key opens modal", async ({ page }) => {
    await page.getByRole("button", { name: "Create key" }).click();
    await expect(page.getByRole("heading", { name: "Create API Key" })).toBeVisible();
  });

  test("create key modal has environment and type selects", async ({ page }) => {
    await page.getByRole("button", { name: "Create key" }).click();
    await expect(page.getByLabel("Environment")).toBeVisible();
    await expect(page.getByLabel("Type")).toBeVisible();
  });

  test("creating API key calls real API", async ({ page }) => {
    await page.getByRole("button", { name: "Create key" }).first().click();

    await page.getByLabel("Environment").selectOption("development");
    await page.getByLabel("Type").selectOption("publishable");

    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes("/keys") && resp.request().method() === "POST",
    );

    await page.locator("form").getByRole("button", { name: "Create key" }).click();

    const response = await responsePromise;
    expect([200, 201]).toContain(response.status());
  });

  test("shows created key secret after creation", async ({ page }) => {
    await page.getByRole("button", { name: "Create key" }).first().click();

    await page.getByLabel("Environment").selectOption("development");
    await page.getByLabel("Type").selectOption("publishable");

    await page.locator("form").getByRole("button", { name: "Create key" }).click();

    await expect(page.getByRole("heading", { name: "API Key Created" })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator("code")).toBeVisible();
  });

  test("danger zone is visible", async ({ page }) => {
    await expect(page.getByText("Danger Zone")).toBeVisible();
    await expect(page.getByText("Delete project")).toBeVisible();
  });

  test("delete project modal requires confirmation", async ({ page }) => {
    await page.getByRole("button", { name: "Delete project" }).first().click();

    await expect(page.getByRole("heading", { name: "Delete Project" })).toBeVisible();

    const confirmInput = page.locator("#confirmation");
    await confirmInput.fill("wrong-name");

    const submitButton = page.locator("form").getByRole("button", { name: "Delete project" });
    await expect(submitButton).toBeDisabled();
  });
});
