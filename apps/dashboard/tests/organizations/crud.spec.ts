import { test, expect } from "@playwright/test";

test.describe("Organization CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/users");
  });

  test("organizations page loads with header", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Organizations" })).toBeVisible();
  });

  test("seeded organizations appear in list", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Demo Organization", exact: true })).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByRole("button", { name: "Demo Monite Organization" })).toBeVisible({
      timeout: 5000,
    });
  });

  test("create organization button is visible", async ({ page }) => {
    await expect(page.getByRole("button", { name: /create organization/i })).toBeVisible();
  });

  test("clicking create organization opens modal", async ({ page }) => {
    await page.getByRole("button", { name: /create organization/i }).click();
    await expect(page.getByRole("heading", { name: "Create organization" })).toBeVisible();
  });

  test("modal has name and slug inputs", async ({ page }) => {
    await page.getByRole("button", { name: /create organization/i }).click();
    await expect(page.getByLabel("Organization name")).toBeVisible();
    await expect(page.getByLabel("Organization slug")).toBeVisible();
  });

  test("slug auto-generates from name", async ({ page }) => {
    await page.getByRole("button", { name: /create organization/i }).click();
    await page.getByLabel("Organization name").fill("My Test Org");
    await expect(page.getByLabel("Organization slug")).toHaveValue("my-test-org");
  });

  test("slug can be manually edited", async ({ page }) => {
    await page.getByRole("button", { name: /create organization/i }).click();
    await page.getByLabel("Organization name").fill("My Test Org");
    const slugInput = page.getByLabel("Organization slug");
    await slugInput.clear();
    await slugInput.fill("custom-slug");
    await expect(slugInput).toHaveValue("custom-slug");
  });

  test("cancel button closes modal", async ({ page }) => {
    await page.getByRole("button", { name: /create organization/i }).click();
    await expect(page.getByRole("heading", { name: "Create organization" })).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("heading", { name: "Create organization" })).not.toBeVisible();
  });

  test("creating organization hits real API", async ({ page }) => {
    const orgName = `E2E Org ${Date.now()}`;
    await page.getByRole("button", { name: /create organization/i }).click();
    await page.getByLabel("Organization name").fill(orgName);

    const responsePromise = page.waitForResponse(
      (res) => res.url().includes("/v1/organizations") && res.request().method() === "POST",
    );

    await page.locator("form").getByRole("button", { name: "Create" }).click();

    const response = await responsePromise;
    expect([200, 201]).toContain(response.status());
  });

  test("shows inline error on failure", async ({ page }) => {
    await page.getByRole("button", { name: /create organization/i }).click();

    // Fill name so the form is submittable, then use a slug that will conflict
    // with the seeded org to trigger a server-side error
    await page.getByLabel("Organization name").fill("Demo Organization");
    const slugInput = page.getByLabel("Organization slug");
    await slugInput.clear();
    await slugInput.fill("demo-org");

    await page.locator("form").getByRole("button", { name: "Create" }).click();

    await expect(page.locator(".bg-red-50")).toBeVisible({ timeout: 5000 });
  });

  test("selecting an organization shows its details", async ({ page }) => {
    await page.getByRole("button", { name: "Demo Organization", exact: true }).click();
    await expect(page.getByRole("button", { name: "Members" })).toBeVisible();
  });
});
