import { test, expect } from "./fixtures";

test("authenticated user can access dashboard", async ({ authenticatedPage }) => {
  await authenticatedPage.goto("/");

  await expect(authenticatedPage).toHaveTitle(/Blerp Dashboard/);
});

test("authenticated user sees main content", async ({ authenticatedPage }) => {
  await authenticatedPage.goto("/");

  const mainContent = authenticatedPage.locator("main");
  await expect(mainContent).toBeVisible();
});
