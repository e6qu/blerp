import { test, expect } from "../fixtures";

test.describe("Member Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/users");
    await page.getByRole("button", { name: "Demo Organization", exact: true }).click();
    // Wait for members to load
    await expect(page.locator("table").getByText("Admin User").first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("members list loads for seeded organization", async ({ page }) => {
    await expect(page.locator("table").getByText("Admin User").first()).toBeVisible();
  });

  test("member role badge is displayed", async ({ page }) => {
    const memberRow = page.locator("tr", { hasText: "Admin User" });
    // Role may be owner or admin depending on test execution order
    const roleBadge = memberRow.locator("span.inline-flex");
    await expect(roleBadge).toBeVisible();
  });

  test("edit button is visible", async ({ page }) => {
    const memberRow = page.locator("tr", { hasText: "Admin User" });
    const editButton = memberRow.locator("button").filter({
      has: page.locator("svg.lucide-pencil"),
    });
    await expect(editButton).toBeVisible();
  });

  test("clicking edit shows role dropdown", async ({ page }) => {
    const memberRow = page.locator("tr", { hasText: "Admin User" });
    const editButton = memberRow.locator("button").filter({
      has: page.locator("svg.lucide-pencil"),
    });
    await editButton.click();

    await expect(memberRow.locator("select")).toBeVisible();
  });

  test("cancel edit returns to view mode", async ({ page }) => {
    const memberRow = page.locator("tr", { hasText: "Admin User" });
    const editButton = memberRow.locator("button").filter({
      has: page.locator("svg.lucide-pencil"),
    });
    await editButton.click();
    await expect(memberRow.locator("select")).toBeVisible();

    // Click the cancel (X) button
    const cancelButton = memberRow.locator("button").filter({
      has: page.locator("svg.lucide-x"),
    });
    await cancelButton.click();

    await expect(memberRow.locator("select")).not.toBeVisible();
  });

  test("save role change calls real API", async ({ page }) => {
    const memberRow = page.locator("tr", { hasText: "Admin User" });
    const editButton = memberRow.locator("button").filter({
      has: page.locator("svg.lucide-pencil"),
    });
    await editButton.click();

    // Change role to admin
    await memberRow.locator("select").selectOption("admin");

    const responsePromise = page.waitForResponse(
      (res) => res.url().includes("/memberships/") && res.request().method() === "PATCH",
    );

    // Click the save (check) button
    const saveButton = memberRow.locator("button").filter({
      has: page.locator("svg.lucide-check"),
    });
    await saveButton.click();

    const response = await responsePromise;
    expect([200, 204]).toContain(response.status());
  });
});

test.describe("Member Management — Monite Org (multi-member)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/users");
    await page.getByRole("button", { name: "Demo Monite Organization" }).click();
    // Wait for members to load
    await expect(page.locator("table").getByText("Admin User").first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("multiple members are listed", async ({ page }) => {
    await expect(page.locator("table").getByText("Admin User").first()).toBeVisible();
    await expect(page.locator("table").getByText("Monite Demo")).toBeVisible();
  });

  test("different roles are displayed", async ({ page }) => {
    const ownerRow = page.locator("tr", { hasText: "Admin User" });
    await expect(ownerRow.locator("span", { hasText: "owner" })).toBeVisible();

    const memberRow = page.locator("tr", { hasText: "Monite Demo" });
    await expect(memberRow.locator("span", { hasText: "member" })).toBeVisible();
  });
});
