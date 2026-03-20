import { test, expect } from "../fixtures";

test.describe("Sidebar Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("sidebar renders all navigation items", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Organizations" })).toBeVisible();
    await expect(page.getByRole("link", { name: "User Management" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Auth" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
  });

  test("dashboard link navigates to home", async ({ page }) => {
    await page.goto("/users");

    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL("/");
  });

  test("organizations link navigates to users page", async ({ page }) => {
    await page.getByRole("link", { name: "Organizations" }).click();
    await expect(page).toHaveURL("/users");
  });

  test("auth link navigates to auth page", async ({ page }) => {
    await page.getByRole("link", { name: "Auth" }).click();
    await expect(page).toHaveURL("/auth");
  });

  test("settings link navigates to settings page", async ({ page }) => {
    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL("/settings");
  });

  test("active nav item is highlighted", async ({ page }) => {
    const dashboardLink = page.getByRole("link", { name: "Dashboard" });
    await expect(dashboardLink).toHaveClass(/bg-blue-50/);
  });

  test("active nav item updates when navigating", async ({ page }) => {
    const orgsLink = page.getByRole("link", { name: "Organizations" });
    await orgsLink.click();
    await expect(orgsLink).toHaveClass(/bg-blue-50/);
  });

  test("sidebar shows Blerp branding", async ({ page }) => {
    const sidebarLogo = page.locator("aside").getByText("Blerp", { exact: true });
    await expect(sidebarLogo).toBeVisible();
  });
});

test.describe("Page Tab Navigation", () => {
  test("auth page tab navigation works", async ({ page }) => {
    await page.goto("/auth");

    const accountTab = page.getByRole("button", { name: "Account", exact: true });
    await expect(accountTab).toHaveClass(/border-blue-600/);

    const securityTab = page.getByRole("button", { name: "Security", exact: true });
    await securityTab.click();
    await expect(securityTab).toHaveClass(/border-blue-600/);

    const sessionsTab = page.getByRole("button", { name: "Sessions", exact: true });
    await sessionsTab.click();
    await expect(sessionsTab).toHaveClass(/border-blue-600/);
  });

  test("settings page tab navigation works", async ({ page }) => {
    await page.goto("/settings");

    const generalTab = page.getByRole("button", { name: "General" });
    await expect(generalTab).toHaveClass(/border-blue-600/);

    const auditTab = page.getByRole("button", { name: "Audit Logs" });
    await auditTab.click();
    await expect(auditTab).toHaveClass(/border-blue-600/);

    const usageTab = page.getByRole("button", { name: "Usage" });
    await usageTab.click();
    await expect(usageTab).toHaveClass(/border-blue-600/);
  });

  test("organization page tab navigation works", async ({ page }) => {
    await page.goto("/users");

    await page.getByRole("button", { name: "Demo Organization" }).click();

    const membersTab = page.getByRole("button", { name: "Members" });
    await expect(membersTab).toHaveClass(/border-blue-500/);

    const invitationsTab = page.getByRole("button", { name: "Invitations" });
    await invitationsTab.click();
    await expect(invitationsTab).toHaveClass(/border-blue-500/);

    const domainsTab = page.getByRole("button", { name: "Domains" });
    await domainsTab.click();
    await expect(domainsTab).toHaveClass(/border-blue-500/);

    const webhooksTab = page.getByRole("button", { name: "Webhooks" });
    await webhooksTab.click();
    await expect(webhooksTab).toHaveClass(/border-blue-500/);
  });
});
