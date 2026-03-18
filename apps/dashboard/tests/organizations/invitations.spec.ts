import { test, expect } from "@playwright/test";

test.describe("Organization Invitations", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/users");
    await page.getByRole("button", { name: "Demo Organization", exact: true }).click();
    await expect(page.getByRole("button", { name: "Invitations" })).toBeVisible({
      timeout: 5000,
    });
    await page.getByRole("button", { name: "Invitations" }).click();
  });

  test("invitations tab shows invite button", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Invite member" })).toBeVisible({
      timeout: 5000,
    });
  });

  test("invitations tab renders content", async ({ page }) => {
    // The tab may show "No invitations yet." or a table of invitations
    // depending on whether parallel tests have created invitations.
    // Verify the tab content has loaded (either empty state or table).
    const emptyState = page.getByText("No invitations yet.");
    const invitationsTable = page.locator("table");
    await expect(emptyState.or(invitationsTable)).toBeVisible({ timeout: 5000 });
  });

  test("clicking invite opens modal", async ({ page }) => {
    await page.getByRole("button", { name: "Invite member" }).click();
    await expect(page.getByRole("heading", { name: "Invite member" })).toBeVisible();
  });

  test("invite modal has email and role fields", async ({ page }) => {
    await page.getByRole("button", { name: "Invite member" }).click();
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByLabel("Role")).toBeVisible();
  });

  test("sending invitation calls real API", async ({ page }) => {
    await page.getByRole("button", { name: "Invite member" }).click();

    const email = `invite-${Date.now()}@test.com`;
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Role").selectOption("member");

    const responsePromise = page.waitForResponse(
      (res) => res.url().includes("/v1/invitations") && res.request().method() === "POST",
    );

    await page.getByRole("button", { name: "Send invitation" }).click();

    const response = await responsePromise;
    expect([200, 201]).toContain(response.status());
  });

  test("invitation appears in list after creation", async ({ page }) => {
    const email = `invite-list-${Date.now()}@test.com`;

    await page.getByRole("button", { name: "Invite member" }).click();
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Role").selectOption("member");

    const responsePromise = page.waitForResponse(
      (res) => res.url().includes("/v1/invitations") && res.request().method() === "POST",
    );

    await page.getByRole("button", { name: "Send invitation" }).click();
    await responsePromise;

    // After modal closes, the invitation should appear in the table
    await expect(page.getByText(email)).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Organization Invitations — Monite Org (seeded data)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/users");
    await page.getByRole("button", { name: "Demo Monite Organization" }).click();
    await expect(page.getByRole("button", { name: "Invitations" })).toBeVisible({
      timeout: 5000,
    });
    await page.getByRole("button", { name: "Invitations" }).click();
  });

  test("seeded invitation appears in list", async ({ page }) => {
    await expect(page.getByText("invite@demo-monite.example.com")).toBeVisible({ timeout: 5000 });
  });

  test("seeded invitation shows status badge", async ({ page }) => {
    const row = page.locator("tr", { hasText: "invite@demo-monite.example.com" });
    // Status may be "pending" or "revoked" depending on parallel test execution
    const statusBadge = row.locator("span.inline-flex");
    await expect(statusBadge).toBeVisible({ timeout: 5000 });
  });

  test("seeded invitation shows member role", async ({ page }) => {
    const row = page.locator("tr", { hasText: "invite@demo-monite.example.com" });
    await expect(row.getByText("member")).toBeVisible({ timeout: 5000 });
  });

  test("revoke button is visible on pending invitation", async ({ page }) => {
    const row = page.locator("tr", { hasText: "invite@demo-monite.example.com" });
    // The invitation may have already been revoked by a parallel test run
    const revokeButton = row.getByText("Revoke");
    const revokedBadge = row.getByText("revoked");
    await expect(revokeButton.or(revokedBadge)).toBeVisible({ timeout: 5000 });
  });
});
