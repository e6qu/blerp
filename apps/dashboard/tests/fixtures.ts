import { test as base, expect, type Page } from "@playwright/test";

type DashboardFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<DashboardFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // The dashboard uses hardcoded demo_user/demo-tenant headers,
    // so every page is effectively "authenticated" via those headers.
    // Navigate to home to initialize the app.
    await page.goto("/");
    await use(page);
  },
});

export { expect };
