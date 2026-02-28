import { test as base, expect } from "@playwright/test";
import { createAuthenticatedPage, getTestUserId } from "@blerp/testing";

export const test = base.extend({
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
