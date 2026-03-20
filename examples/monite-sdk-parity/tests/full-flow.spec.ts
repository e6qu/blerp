import { test, expect } from "@playwright/test";

const DEMO_EMAIL = "admin@demo-tenant.blerp.dev";
const DEMO_PASSWORD = "E2E_Test_Pass_42!";
const SCREENSHOTS = "tests/screenshots";

test.setTimeout(120_000); // 2 min — Next.js first compile is slow

test("FULL FLOW: sign in → switch org → see Monite context", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  // Warm up: hit the pages so Next.js compiles them before timing matters
  await page.goto("/sign-in");
  await page.waitForLoadState("load");
  await page.waitForTimeout(3000);
  await page.goto("/dashboard");
  await page.waitForLoadState("load");
  await page.waitForTimeout(2000);
  // Go back to clean sign-in state
  await page.context().clearCookies();

  // ── Step 1: Sign in ──
  await page.goto("/sign-in");
  await page.waitForLoadState("load");
  await page.waitForTimeout(2000);

  await page.fill("#blerp-signin-email", DEMO_EMAIL);
  await page.click('button:has-text("Continue")');
  await expect(page.locator("#blerp-signin-password")).toBeVisible({ timeout: 15_000 });
  await page.fill("#blerp-signin-password", DEMO_PASSWORD);
  await page.screenshot({ path: `${SCREENSHOTS}/flow-01-password-filled.png`, fullPage: true });

  await page.click('button:has-text("Sign in")');

  // Wait for navigation away from sign-in (allow slow first-compile)
  await page.waitForURL((url) => !url.pathname.includes("/sign-in"), { timeout: 30_000 });
  await page.waitForLoadState("load");
  await page.waitForTimeout(5000); // Wait for SSR + hydration

  await page.screenshot({ path: `${SCREENSHOTS}/flow-02-dashboard-initial.png`, fullPage: true });

  // ── Step 2: Verify dashboard ──
  expect(page.url()).toContain("/dashboard");
  await expect(page.locator("h1")).toContainText("Monite Integration Dashboard");
  const userLine = await page.locator("text=User ID:").textContent();
  expect(userLine).toContain("demo_user");

  // Verify session cookie
  const cookies = await page.context().cookies();
  const session = cookies.find((c) => c.name === "__blerp_session");
  expect(session).toBeTruthy();
  expect(session!.value.length).toBeGreaterThan(100);

  // ── Step 3: Wait for org switcher to hydrate ──
  const orgBtn = page.locator("header button").first();
  await expect(orgBtn).toContainText("Personal Account", { timeout: 15_000 });

  await page.screenshot({ path: `${SCREENSHOTS}/flow-03-hydrated.png`, fullPage: true });

  // ── Step 4: Open org switcher and verify orgs ──
  await orgBtn.click();
  await page.waitForTimeout(500);
  await expect(page.locator("text=Switch Organization")).toBeVisible({ timeout: 5000 });
  await expect(page.locator("text=Demo Organization")).toBeVisible();
  await expect(page.locator("text=Demo Monite Organizat")).toBeVisible();

  await page.screenshot({ path: `${SCREENSHOTS}/flow-04-org-dropdown.png`, fullPage: true });

  // ── Step 5: Switch to Demo Monite Organization ──
  await page.locator("text=Demo Monite Organizat").click();

  // Page reloads — wait for it
  await page.waitForLoadState("load");
  await page.waitForTimeout(5000);

  await page.screenshot({ path: `${SCREENSHOTS}/flow-05-after-org-switch.png`, fullPage: true });

  // ── Step 6: Verify org switched ──
  // Org cookie should be set
  const cookiesAfter = await page.context().cookies();
  const orgCookie = cookiesAfter.find((c) => c.name === "__blerp_org");
  expect(orgCookie).toBeTruthy();
  expect(orgCookie!.value).toBe("org_monite_demo");

  // Org switcher should show new org name
  const orgBtnAfter = page.locator("header button").first();
  await expect(orgBtnAfter).toContainText("Demo Monite", { timeout: 15_000 });

  // ── Step 7: Verify Monite context ──
  const hasMissing = await page
    .locator("text=Monite Context Missing")
    .isVisible()
    .catch(() => false);

  // eslint-disable-next-line no-console
  console.log(`Monite Context Missing: ${hasMissing}`);
  // eslint-disable-next-line no-console
  console.log(`Page errors: ${errors.join(", ") || "none"}`);

  if (hasMissing) {
    await page.screenshot({ path: `${SCREENSHOTS}/flow-06-BUG-still-missing.png`, fullPage: true });
  }

  // The org has entity_id in private_metadata — context should NOT be missing
  expect(hasMissing).toBe(false);

  // ── Step 8: Verify role is populated (owner) ──
  const roleText = await page.locator("text=Role:").textContent();
  // eslint-disable-next-line no-console
  console.log(`Role text: "${roleText}"`);
  // demo_user is owner of org_monite_demo — role should NOT be empty
  expect(roleText).toContain("owner");

  // ── Step 9: Verify admin actions visible (owner has org:write) ──
  const hasAdmin = await page
    .locator("text=Admin Actions")
    .isVisible()
    .catch(() => false);
  const hasDenied = await page
    .locator("text=You do not have permission")
    .isVisible()
    .catch(() => false);
  // eslint-disable-next-line no-console
  console.log(`Admin Actions: ${hasAdmin}, Permission denied: ${hasDenied}`);

  await page.screenshot({ path: `${SCREENSHOTS}/flow-06-with-role.png`, fullPage: true });

  // Owner should see admin actions, NOT permission denied
  expect(hasAdmin).toBe(true);
  expect(hasDenied).toBe(false);

  // ── Step 10: Verify Raw User Object has correct data ──
  const pre = page.locator("pre");
  await expect(pre).toBeVisible();
  const json = await pre.textContent();
  expect(json).toContain("demo_user");
  expect(json).toContain("monite_ent_demo");
  const user = JSON.parse(json!);
  expect(user.id).toBe("demo_user");

  await page.screenshot({ path: `${SCREENSHOTS}/flow-07-final.png`, fullPage: true });

  // No page errors
  expect(errors).toHaveLength(0);
});
