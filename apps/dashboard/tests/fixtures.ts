import { test as base, expect, type Page } from "@playwright/test";
import { createAuthenticatedPage, getTestUserId } from "@blerp/testing";

type DashboardFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<DashboardFixtures>({
  authenticatedPage: async ({ page }, use) => {
    const userId = getTestUserId() || "e2e_dashboard_user";

    await createAuthenticatedPage(page, {
      userId,
      email: "e2e-dashboard@blerp.test",
    });

    await use(page);
  },
});

export { expect };
