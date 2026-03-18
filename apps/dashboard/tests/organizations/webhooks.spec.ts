import { test, expect } from "@playwright/test";

test.describe("Organization Webhooks", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/users");
    await page.getByRole("button", { name: "Demo Organization", exact: true }).click();
    await expect(page.getByRole("button", { name: "Webhooks" })).toBeVisible({
      timeout: 5000,
    });
    await page.getByRole("button", { name: "Webhooks" }).click();
  });

  test("webhooks tab shows add button", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Add webhook" })).toBeVisible({ timeout: 5000 });
  });

  test("seeded webhook appears in list", async ({ page }) => {
    await expect(page.getByText("https://example.com/webhooks/monite")).toBeVisible({
      timeout: 5000,
    });
  });

  test("webhook events are displayed", async ({ page }) => {
    // Multiple webhooks may exist from parallel test runs, so use .first()
    await expect(page.getByText("organization.created").first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("user.created").first()).toBeVisible({ timeout: 5000 });
  });

  test("clicking add opens modal", async ({ page }) => {
    await page.getByRole("button", { name: "Add webhook" }).click();
    await expect(page.getByRole("heading", { name: "Add webhook" })).toBeVisible();
  });

  test("modal has URL input and event checkboxes", async ({ page }) => {
    await page.getByRole("button", { name: "Add webhook" }).click();
    await expect(page.getByLabel("Endpoint URL")).toBeVisible();
    await expect(page.getByText("User created")).toBeVisible();
  });

  test("select all button checks all events", async ({ page }) => {
    await page.getByRole("button", { name: "Add webhook" }).click();
    await page.getByRole("button", { name: "Select all", exact: true }).click();

    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    expect(count).toBe(8);

    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).toBeChecked();
    }
  });

  test("creating webhook calls real API", async ({ page }) => {
    const webhookUrl = `https://e2e-${Date.now()}.example.com/hook`;

    await page.getByRole("button", { name: "Add webhook" }).click();
    await page.getByLabel("Endpoint URL").fill(webhookUrl);
    await page.getByRole("button", { name: "Select all", exact: true }).click();

    const responsePromise = page.waitForResponse(
      (res) => res.url().includes("/v1/webhooks/endpoints") && res.request().method() === "POST",
    );

    await page.getByRole("button", { name: "Create webhook" }).click();

    const response = await responsePromise;
    expect([200, 201]).toContain(response.status());
  });

  test("shows signing secret after creation", async ({ page }) => {
    const webhookUrl = `https://e2e-secret-${Date.now()}.example.com/hook`;

    await page.getByRole("button", { name: "Add webhook" }).click();
    await page.getByLabel("Endpoint URL").fill(webhookUrl);
    await page.getByRole("button", { name: "Select all", exact: true }).click();

    const responsePromise = page.waitForResponse(
      (res) => res.url().includes("/v1/webhooks/endpoints") && res.request().method() === "POST",
    );

    await page.getByRole("button", { name: "Create webhook" }).click();
    await responsePromise;

    await expect(page.getByRole("heading", { name: "Webhook created" })).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("Signing Secret", { exact: true })).toBeVisible();
  });
});
