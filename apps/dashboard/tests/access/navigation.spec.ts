import { test, expect } from "@playwright/test";

test.describe("Sidebar Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("sidebar renders all navigation items", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Users" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Auth" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
  });

  test("dashboard link navigates to home", async ({ page }) => {
    await page.goto("/users");

    const dashboardLink = page.getByRole("link", { name: "Dashboard" });
    await dashboardLink.click();

    await expect(page).toHaveURL("/");
  });

  test("users link navigates to users page", async ({ page }) => {
    const usersLink = page.getByRole("link", { name: "Users" });
    await usersLink.click();

    await expect(page).toHaveURL("/users");
  });

  test("auth link navigates to auth page", async ({ page }) => {
    const authLink = page.getByRole("link", { name: "Auth" });
    await authLink.click();

    await expect(page).toHaveURL("/auth");
  });

  test("settings link navigates to settings page", async ({ page }) => {
    const settingsLink = page.getByRole("link", { name: "Settings" });
    await settingsLink.click();

    await expect(page).toHaveURL("/settings");
  });

  test("active nav item is highlighted on home", async ({ page }) => {
    const dashboardLink = page.getByRole("link", { name: "Dashboard" });
    await expect(dashboardLink).toHaveClass(/bg-blue-50/);
  });

  test("active nav item updates when navigating", async ({ page }) => {
    const usersLink = page.getByRole("link", { name: "Users" });
    await usersLink.click();

    await expect(usersLink).toHaveClass(/bg-blue-50/);
  });

  test("sidebar shows Blerp branding", async ({ page }) => {
    await expect(page.getByText("Blerp")).toBeVisible();
  });
});

test.describe("Page Tab Navigation", () => {
  test("auth page has Account, Security, Sessions tabs", async ({ page }) => {
    await page.goto("/auth");

    await expect(page.getByRole("button", { name: "Account" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Security" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sessions" })).toBeVisible();
  });

  test("auth page Account tab is active by default", async ({ page }) => {
    await page.goto("/auth");

    const accountTab = page.getByRole("button", { name: "Account" });
    await expect(accountTab).toHaveClass(/border-blue-600/);
  });

  test("auth page can switch to Security tab", async ({ page }) => {
    await page.goto("/auth");

    const securityTab = page.getByRole("button", { name: "Security" });
    await securityTab.click();

    await expect(securityTab).toHaveClass(/border-blue-600/);
    await expect(page.getByText("Passkeys")).toBeVisible();
  });

  test("auth page can switch to Sessions tab", async ({ page }) => {
    await page.goto("/auth");

    const sessionsTab = page.getByRole("button", { name: "Sessions" });
    await sessionsTab.click();

    await expect(sessionsTab).toHaveClass(/border-blue-600/);
  });

  test("settings page has General, Audit Logs, Usage tabs", async ({ page }) => {
    await page.goto("/settings");

    await expect(page.getByRole("button", { name: "General" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Audit Logs" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Usage" })).toBeVisible();
  });

  test("settings page General tab is active by default", async ({ page }) => {
    await page.goto("/settings");

    const generalTab = page.getByRole("button", { name: "General" });
    await expect(generalTab).toHaveClass(/border-blue-600/);
  });

  test("settings page can switch to Audit Logs tab", async ({ page }) => {
    await page.goto("/settings");

    const auditTab = page.getByRole("button", { name: "Audit Logs" });
    await auditTab.click();

    await expect(auditTab).toHaveClass(/border-blue-600/);
  });

  test("settings page can switch to Usage tab", async ({ page }) => {
    await page.goto("/settings");

    const usageTab = page.getByRole("button", { name: "Usage" });
    await usageTab.click();

    await expect(usageTab).toHaveClass(/border-blue-600/);
  });
});

test.describe("Organization Tab Navigation", () => {
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

    await page.goto("/users");
    await page.getByRole("button", { name: "Test Organization" }).click();
  });

  test("organization page has Members, Invitations, Webhooks tabs", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Members" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Invitations" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Webhooks" })).toBeVisible();
  });

  test("Members tab is active by default", async ({ page }) => {
    const membersTab = page.getByRole("button", { name: "Members" });
    await expect(membersTab).toHaveClass(/border-blue-500/);
  });

  test("can switch to Invitations tab", async ({ page }) => {
    const invitationsTab = page.getByRole("button", { name: "Invitations" });
    await invitationsTab.click();

    await expect(invitationsTab).toHaveClass(/border-blue-500/);
  });

  test("can switch to Webhooks tab", async ({ page }) => {
    const webhooksTab = page.getByRole("button", { name: "Webhooks" });
    await webhooksTab.click();

    await expect(webhooksTab).toHaveClass(/border-blue-500/);
  });
});
