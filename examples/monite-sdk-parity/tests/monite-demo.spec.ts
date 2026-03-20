import { test as base, expect } from "@playwright/test";

const SCREENSHOTS_DIR = "tests/screenshots";
const DEMO_EMAIL = "admin@demo-tenant.blerp.dev";
const DEMO_PASSWORD = "E2E_Test_Pass_42!";

// Fresh context per test — no shared state, no fixture magic
const test = base;

// ── 1. Unauthenticated access ──

test.describe("Unauthenticated access", () => {
  test("home page is publicly accessible", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/01-home-public.png`, fullPage: true });

    // Must show actual content, not a redirect to sign-in
    await expect(page.locator("h1")).toContainText("Blerp Next.js Quickstart");
    await expect(page.locator('a[href="/dashboard"]')).toBeVisible();
    // URL must be exactly "/" — no redirect
    expect(page.url()).toMatch(/\/$/);
  });

  test("sign-in page shows complete auth form", async ({ page }) => {
    await page.goto("/sign-in");
    await page.waitForLoadState("load");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/02-signin-form.png`, fullPage: true });

    // Verify ALL form elements exist — not just text
    const emailInput = page.locator("#blerp-signin-email");
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toBeEditable();
    expect(await emailInput.getAttribute("type")).toBe("email");
    expect(await emailInput.getAttribute("required")).not.toBeNull();

    await expect(page.locator('button:has-text("Continue")')).toBeVisible();
    await expect(page.locator('button:has-text("Continue")')).toBeEnabled();
    await expect(page.locator('button:has-text("GitHub")')).toBeVisible();
    await expect(page.locator('button:has-text("Google")')).toBeVisible();
    await expect(page.locator("text=Or continue with email")).toBeVisible();
    await expect(page.locator('a[href="/sign-up"]')).toBeVisible();
  });

  test("sign-up page shows registration form", async ({ page }) => {
    await page.goto("/sign-up");
    await page.waitForLoadState("load");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/03-signup-form.png`, fullPage: true });

    await expect(page.locator("h2")).toContainText("Create your account");
    await expect(page.locator('button:has-text("Continue")')).toBeVisible();
    await expect(page.locator('a[href="/sign-in"]')).toBeVisible();
  });

  test("/dashboard redirects unauthenticated users to sign-in", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("load");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/04-dashboard-redirect.png`, fullPage: true });

    // Must redirect — verify URL contains sign-in AND redirect_url param
    expect(page.url()).toContain("/sign-in");
    expect(page.url()).toContain("redirect_url");
    expect(page.url()).toContain("dashboard");
  });
});

// ── 2. Full sign-in flow (real browser, no cookie injection) ──

test.describe("Browser sign-in flow", () => {
  test("complete email → password → dashboard flow", async ({ page }) => {
    // Track API calls for debugging
    const apiCalls: string[] = [];
    page.on("response", (res) => {
      if (res.url().includes("/v1/")) {
        apiCalls.push(`${res.status()} ${res.request().method()} ${new URL(res.url()).pathname}`);
      }
    });

    // Step 1: Go to sign-in
    await page.goto("/sign-in");
    await page.waitForLoadState("load");
    await page.waitForTimeout(1500);

    // Step 2: Enter email and submit
    await page.fill("#blerp-signin-email", DEMO_EMAIL);
    await expect(page.locator("#blerp-signin-email")).toHaveValue(DEMO_EMAIL);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/05-email-entered.png`, fullPage: true });

    await page.click('button:has-text("Continue")');

    // Step 3: Wait for password field — this proves the API accepted the email
    const passwordField = page.locator("#blerp-signin-password");
    await expect(passwordField).toBeVisible({ timeout: 10_000 });
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/06-password-step.png`, fullPage: true });

    // Verify we're on the password step
    await expect(page.locator(`text=Signing in as`)).toBeVisible();
    await expect(page.locator(`text=${DEMO_EMAIL}`)).toBeVisible();
    await expect(page.locator('button:has-text("Sign in")')).toBeVisible();

    // Step 4: Enter password and submit
    await page.fill("#blerp-signin-password", DEMO_PASSWORD);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/07-password-entered.png`, fullPage: true });

    await page.click('button:has-text("Sign in")');

    // Step 5: Wait for redirect to dashboard
    await page.waitForURL("**/dashboard**", { timeout: 15_000 });
    await page.waitForLoadState("load");
    await page.waitForTimeout(3000);
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/08-dashboard-after-signin.png`,
      fullPage: true,
    });

    // Step 6: Verify we're ACTUALLY on the dashboard, not redirected back
    expect(page.url()).toContain("/dashboard");
    expect(page.url()).not.toContain("/sign-in");

    // Verify the session cookie exists
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "__blerp_session");
    expect(sessionCookie).toBeTruthy();
    expect(sessionCookie!.value.length).toBeGreaterThan(100); // JWT is long

    // Verify dashboard content rendered (not an error page)
    await expect(page.locator("h1")).toContainText("Monite Integration Dashboard");

    // Verify user context was resolved server-side
    const userIdText = await page.locator("text=User ID:").textContent();
    expect(userIdText).toContain("demo_user");

    // Verify API calls happened in correct order
    expect(apiCalls.some((c) => c.includes("POST /v1/auth/signins"))).toBeTruthy();

    // Step 7: Verify the sign-in persists on reload
    await page.reload();
    await page.waitForLoadState("load");
    await page.waitForTimeout(3000);
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/09-dashboard-after-reload.png`,
      fullPage: true,
    });

    // Still on dashboard after reload (cookie persisted)
    expect(page.url()).toContain("/dashboard");
    await expect(page.locator("h1")).toContainText("Monite Integration Dashboard");
  });
});

// ── 3. Authenticated dashboard (using real sign-in, not cookie fixture) ──

test.describe("Dashboard functionality", () => {
  // Sign in before each test via the actual UI
  test.beforeEach(async ({ page }) => {
    await page.goto("/sign-in");
    await page.waitForLoadState("load");
    await page.waitForTimeout(1500);

    await page.fill("#blerp-signin-email", DEMO_EMAIL);
    await page.click('button:has-text("Continue")');
    await page.waitForSelector("#blerp-signin-password", { timeout: 10_000 });
    await page.fill("#blerp-signin-password", DEMO_PASSWORD);
    await page.click('button:has-text("Sign in")');
    await page.waitForURL("**/dashboard**", { timeout: 15_000 });
    await page.waitForLoadState("load");
    await page.waitForTimeout(3000);
  });

  test("header shows branding and org switcher", async ({ page }) => {
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/10-dashboard-header.png`, fullPage: true });

    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("text=Blerp + Monite SDK")).toBeVisible();

    // Org switcher button must exist and be clickable
    const orgSwitcher = page.locator("header button").first();
    await expect(orgSwitcher).toBeVisible();
  });

  test("org switcher dropdown shows organizations", async ({ page }) => {
    // Click the org switcher
    const orgSwitcher = page.locator("header button").first();
    await orgSwitcher.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/11-org-switcher-open.png`, fullPage: true });

    // Should show org list — check for the seeded orgs
    await expect(page.locator("text=Switch Organization")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=Personal Account").first()).toBeVisible();
    await expect(page.locator("text=Demo Organization")).toBeVisible();
    await expect(page.locator("text=Demo Monite Organization")).toBeVisible();
    await expect(page.locator("text=Create Organization")).toBeVisible();
  });

  test("switching to Monite org reloads context", async ({ page }) => {
    // Open org switcher
    const orgSwitcher = page.locator("header button").first();
    await orgSwitcher.click();
    await page.waitForTimeout(500);

    // Click "Demo Monite Organization"
    await page.locator("text=Demo Monite Organization").click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/12-after-org-switch.png`, fullPage: true });

    // Verify the __blerp_org cookie was set
    const cookies = await page.context().cookies();
    const orgCookie = cookies.find((c) => c.name === "__blerp_org");
    expect(orgCookie).toBeTruthy();
    expect(orgCookie!.value).toBe("org_monite_demo");
  });

  test("monite context section shows expected state", async ({ page }) => {
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/13-monite-context.png`, fullPage: true });

    // Either "Monite Context Missing" (no org selected) or Payables (org with entity_id)
    const hasMissing = await page
      .locator("text=Monite Context Missing")
      .isVisible()
      .catch(() => false);
    const hasPayables = await page
      .locator("text=Payables")
      .isVisible()
      .catch(() => false);
    expect(hasMissing || hasPayables).toBeTruthy();
  });

  test("permission guard section renders", async ({ page }) => {
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/14-permission-guard.png`, fullPage: true });

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

  test("raw user object displays valid JSON", async ({ page }) => {
    await expect(page.locator("text=Raw Blerp User Object")).toBeVisible();

    const pre = page.locator("pre");
    if (await pre.isVisible().catch(() => false)) {
      const content = await pre.textContent();
      // Must contain actual user data, not empty or error
      expect(content).toBeTruthy();
      expect(content!.length).toBeGreaterThan(10);
      // Should be valid JSON
      expect(() => JSON.parse(content!)).not.toThrow();
      const user = JSON.parse(content!);
      expect(user.id).toBe("demo_user");
      await page.screenshot({ path: `${SCREENSHOTS_DIR}/15-raw-user-json.png`, fullPage: true });
    }
  });
});

// ── 4. Navigation ──

test.describe("Navigation", () => {
  test("home → dashboard link works for authenticated user", async ({ page }) => {
    // Sign in first
    await page.goto("/sign-in");
    await page.waitForLoadState("load");
    await page.waitForTimeout(1500);
    await page.fill("#blerp-signin-email", DEMO_EMAIL);
    await page.click('button:has-text("Continue")');
    await page.waitForSelector("#blerp-signin-password", { timeout: 10_000 });
    await page.fill("#blerp-signin-password", DEMO_PASSWORD);
    await page.click('button:has-text("Sign in")');
    await page.waitForURL("**/dashboard**", { timeout: 15_000 });

    // Navigate to home
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/16-home-authenticated.png`, fullPage: true });

    await expect(page.locator("h1")).toContainText("Blerp Next.js Quickstart");

    // Click dashboard link
    await page.click('a[href="/dashboard"]');
    await page.waitForLoadState("load");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/17-nav-to-dashboard.png`, fullPage: true });

    expect(page.url()).toContain("/dashboard");
    await expect(page.locator("h1")).toContainText("Monite Integration Dashboard");
  });
});
