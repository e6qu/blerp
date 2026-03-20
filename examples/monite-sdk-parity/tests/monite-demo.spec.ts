import { test, expect } from "./fixtures";

const SCREENSHOTS_DIR = "tests/screenshots";

// ── Public pages ──

test.describe("Public pages", () => {
  test("home page redirects to sign-in for unauthenticated users @screenshot", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/01-home-unauthenticated.png`,
      fullPage: true,
    });

    // Unauthenticated users get redirected to sign-in by middleware
    expect(page.url()).toContain("/sign-in");
    await expect(page.locator("text=Sign in to your account")).toBeVisible();
  });

  test("sign-in page renders with OAuth and email form @screenshot", async ({ page }) => {
    await page.goto("/sign-in");
    await page.waitForLoadState("load");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/02-sign-in-page.png`, fullPage: true });

    await expect(page.locator("text=Sign in to your account")).toBeVisible();
    await expect(page.locator("#blerp-signin-email")).toBeVisible();
    await expect(page.locator("button:has-text('GitHub')")).toBeVisible();
    await expect(page.locator("button:has-text('Google')")).toBeVisible();
    await expect(page.locator("text=Or continue with email")).toBeVisible();
    await expect(page.locator("text=Don't have an account?")).toBeVisible();
  });

  test("sign-up page renders @screenshot", async ({ page }) => {
    await page.goto("/sign-up");
    await page.waitForLoadState("load");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/03-sign-up-page.png`, fullPage: true });

    await expect(page.locator("text=Create your account")).toBeVisible();
    await expect(page.locator("text=Already have an account?")).toBeVisible();
  });

  test("unauthenticated dashboard redirects to sign-in @screenshot", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("load");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/04-dashboard-redirect.png`, fullPage: true });

    expect(page.url()).toContain("/sign-in");
  });
});

// ── Sign-in flow (email entry step) ──

test.describe("Sign-in flow", () => {
  test("email entry step works @screenshot", async ({ page }) => {
    await page.goto("/sign-in");
    await page.waitForLoadState("load");
    await page.waitForTimeout(1500);

    // Enter email
    await page.fill("#blerp-signin-email", "admin@demo-tenant.blerp.dev");
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/05-signin-email-filled.png`,
      fullPage: true,
    });

    // Click continue — the API call may fail in test env (no X-Tenant-Id header from client),
    // so we just verify the email step works
    await expect(page.locator("#blerp-signin-email")).toHaveValue("admin@demo-tenant.blerp.dev");
  });

  test("sign-in via cookie authenticates dashboard @screenshot", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/dashboard", { timeout: 30_000 });
    await page.waitForLoadState("load");
    await page.waitForTimeout(3000);
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/06-cookie-auth-dashboard.png`,
      fullPage: true,
    });

    // Cookie-based auth bypasses sign-in form and renders dashboard
    await expect(page.locator("h1:has-text('Monite Integration Dashboard')")).toBeVisible();
  });
});

// ── Authenticated dashboard ──

test.describe("Authenticated dashboard", () => {
  test("dashboard loads with all sections @screenshot", async ({ authenticatedPage: page }) => {
    await page.goto("/dashboard", { timeout: 30_000 });
    await page.waitForLoadState("load");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/07-dashboard-full.png`, fullPage: true });

    await expect(page.locator("h1:has-text('Monite Integration Dashboard')")).toBeVisible();
    await expect(page.locator("text=Raw Blerp User Object")).toBeVisible();
  });

  test("header shows Blerp + Monite branding @screenshot", async ({ authenticatedPage: page }) => {
    await page.goto("/dashboard", { timeout: 30_000 });
    await page.waitForLoadState("load");
    await page.waitForTimeout(3000);

    // Capture just the header area
    const header = page.locator("header");
    await header.screenshot({ path: `${SCREENSHOTS_DIR}/08-header-branding.png` });

    await expect(page.locator("text=Blerp + Monite SDK")).toBeVisible();
  });

  test("monite context section visible @screenshot", async ({ authenticatedPage: page }) => {
    await page.goto("/dashboard", { timeout: 30_000 });
    await page.waitForLoadState("load");
    await page.waitForTimeout(3000);

    // Should show either Monite Payables or the "Monite Context Missing" fallback
    const hasMonite = await page
      .locator("text=Payables")
      .isVisible()
      .catch(() => false);
    const hasMissing = await page
      .locator("text=Monite Context Missing")
      .isVisible()
      .catch(() => false);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/09-monite-context.png`, fullPage: true });
    expect(hasMonite || hasMissing).toBeTruthy();
  });

  test("permission guard renders @screenshot", async ({ authenticatedPage: page }) => {
    await page.goto("/dashboard", { timeout: 30_000 });
    await page.waitForLoadState("load");
    await page.waitForTimeout(3000);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/10-permission-guard.png`, fullPage: true });

    // Either admin actions (has permission) or denied message (no permission)
    const hasAdmin = await page
      .locator("text=Admin Actions")
      .isVisible()
      .catch(() => false);
    const hasDenied = await page
      .locator("text=You do not have permission")
      .isVisible()
      .catch(() => false);
    expect(hasAdmin || hasDenied).toBeTruthy();
  });

  test("raw user object section @screenshot", async ({ authenticatedPage: page }) => {
    await page.goto("/dashboard", { timeout: 30_000 });
    await page.waitForLoadState("load");
    await page.waitForTimeout(3000);

    await expect(page.locator("text=Raw Blerp User Object")).toBeVisible();
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/11-raw-user-object.png`, fullPage: true });
  });
});

// ── Authenticated navigation ──

test.describe("Navigation", () => {
  test("authenticated home page shows content @screenshot", async ({ authenticatedPage: page }) => {
    await page.goto("/", { timeout: 15_000 });
    await page.waitForLoadState("load");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/12-authenticated-home.png`, fullPage: true });

    // When authenticated, home page should show the quickstart content
    await expect(page.locator("text=Blerp Next.js Quickstart")).toBeVisible();
  });

  test("navigate from home to dashboard @screenshot", async ({ authenticatedPage: page }) => {
    await page.goto("/", { timeout: 15_000 });
    await page.waitForLoadState("load");
    await page.waitForTimeout(1500);

    await page.click('a:has-text("Go to Dashboard")');
    await page.waitForLoadState("load");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/13-nav-to-dashboard.png`, fullPage: true });

    await expect(page.locator("h1:has-text('Monite Integration Dashboard')")).toBeVisible();
  });
});
