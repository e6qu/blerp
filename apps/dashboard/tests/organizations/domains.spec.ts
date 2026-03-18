import { test, expect } from "@playwright/test";

test.describe("Organization Domains", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/users");
    await page.getByRole("button", { name: "Demo Organization", exact: true }).click();
    // Wait for tabs to appear
    await expect(page.getByRole("button", { name: "Members" })).toBeVisible({
      timeout: 5000,
    });
  });

  test("organization tabs are visible after selecting org", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Members" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Invitations" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Domains" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Webhooks" })).toBeVisible();
  });

  test("can switch to domains tab", async ({ page }) => {
    const domainsTab = page.getByRole("button", { name: "Domains" });
    await domainsTab.click();
    await expect(domainsTab).toHaveClass(/border-blue-500/);
  });

  test("domains tab shows empty state for Demo Organization", async ({ page }) => {
    await page.getByRole("button", { name: "Domains" }).click();

    await expect(page.getByText("No domains configured.")).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Organization Domains — Monite Org (seeded data)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/users");
    await page.getByRole("button", { name: "Demo Monite Organization" }).click();
    await expect(page.getByRole("button", { name: "Domains" })).toBeVisible({
      timeout: 5000,
    });
    await page.getByRole("button", { name: "Domains" }).click();
  });

  test("seeded domain appears in list", async ({ page }) => {
    await expect(page.getByText("demo-monite.example.com")).toBeVisible({ timeout: 5000 });
  });

  test("domain shows verified status", async ({ page }) => {
    await expect(page.getByText("Verified")).toBeVisible({ timeout: 5000 });
  });

  test("verified domain does not show verify button", async ({ page }) => {
    // Wait for domain to render
    await expect(page.getByText("demo-monite.example.com")).toBeVisible({ timeout: 5000 });

    const domainRow = page.locator("tr", { hasText: "demo-monite.example.com" });
    await expect(domainRow.getByText("Verify")).not.toBeVisible();
  });
});
