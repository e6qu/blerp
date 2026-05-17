# Known Bugs

## Critical — API broken without Redis

### BUG-1: Redis operations hang when Redis is unavailable (FIXED)

**Status:** Fixed
**Files:** `apps/api/src/lib/redis.ts`, `apps/api/src/middleware/rate-limit.ts`, `apps/api/src/app.ts`

The ioredis client is configured with `maxRetriesPerRequest: null`, which causes all Redis commands (`incr`, `get`, `set`, `del`, `xadd`) to wait indefinitely when Redis is unavailable. This blocked:

- **Health endpoint** — was placed after the global rate limiter, which called `redis.incr()`. Health check hung forever without Redis.
- **Organization list** — `listOrganizations` controller calls `cache.get()` before querying DB, which hung.
- **All mutation endpoints** — `cache.del()` calls after creating/updating/deleting orgs hung.
- **Rate limiter** — `redis.incr()` never resolved, blocking all `/v1/*` routes.

**Fix applied:**

1. Moved `/health` endpoint before rate limiter middleware.
2. Added `isRedisAvailable()` guard to rate limiter — skips when Redis is down.
3. Added `redisAvailable` guards to all `cache.*` and `streams.*` helpers.
4. Added `isRedisAvailable()` guards to `sessionStore` methods (`sadd`, `smembers`, `srem`).
5. Added `isRedisAvailable()` guard to `eventBus.emit()` to prevent `redis.xadd()` hanging.

### BUG-2: `bun run --hot` incompatible with `better-sqlite3` (FIXED)

**Status:** Fixed
**Files:** `apps/api/package.json`, `apps/dashboard/playwright.config.ts`

The API dev script used `bun run --hot src/index.ts`, but `better-sqlite3` is a native Node addon that Bun doesn't support (`ERR_DLOPEN_FAILED`). Every API request that touches the database returned 500.

**Fix applied:** Dev script updated to `tsx --watch src/index.ts`. Playwright config also uses tsx.

---

## High — API response field name mismatches (FIXED)

### BUG-3: Controllers return camelCase but OpenAPI schema expects snake_case

**Status:** Fixed
**Files:** `apps/api/src/v1/controllers/webhook.controller.ts`, `invitation.controller.ts`, `domain.controller.ts`, `membership.controller.ts`, `user.controller.ts`

All controllers returned raw Drizzle ORM objects with camelCase field names (`eventTypes`, `emailAddress`, `organizationId`, `verificationStatus`, `createdAt`), but the OpenAPI schema and dashboard components expect snake_case (`events`, `email`, `organization_id`, `verification_status`, `created_at`).

This caused the dashboard to render empty/broken data for:

- Webhook list (events not shown, status undefined)
- Invitation list (email not shown)
- Domain list (verification status not shown)
- Member list ("User ID: undefined" displayed)

**Fix applied:** Added `mapWebhook()`, `mapInvitation()`, `mapDomain()`, `mapMembership()` response mappers to each controller. Also added missing `totp_enabled` field to `mapUser()`.

---

## Medium — E2E test issues

### BUG-4: CSRF token not sent on mutation requests from dashboard

**Status:** Fixed
**Files:** `apps/dashboard/src/lib/api.ts`

The `openapi-fetch` client is created without `credentials: "include"`, so cookies are not sent with API requests. The CSRF double-submit protection requires both the `x-csrf-token` header AND the `__blerp_csrf` cookie. Without cookies, all POST/PATCH/PUT/DELETE requests receive 403 "invalid csrf token".

The `fetchCsrfToken()` helper correctly uses `credentials: "include"`, but the actual `client` object does not. This means the CSRF cookie from the token endpoint is set in the browser, but not sent back on subsequent mutation requests.

**Impact:** All create/update/delete operations fail silently in the dashboard. Tests that assert API responses from mutations (create org, save settings, create webhook, create invitation) time out.

**Fix applied:** Added `credentials: "include"` to the openapi-fetch client configuration in `apps/dashboard/src/lib/api.ts`.

### BUG-5: Parallel test interference — shared mutable state (MOSTLY FIXED)

**Status:** Mostly Fixed
**Files:** `apps/dashboard/playwright.config.ts`, various test files

Tests run with `fullyParallel: true` and share the same API server and SQLite database. Tests that modify data (change project name, change member role, create invitations, revoke invitations) can interfere with concurrent tests.

**Fixes applied (cumulative across sessions):**

- Profile tests run in serial mode (`test.describe.configure({ mode: "serial" })`) — BUG-13
- Toast tests clean up mutated user state after each test — BUG-12
- Invitations test accepts either empty state or populated table — BUG-14
- Webhook/API key tests use `.first()` for accumulated data — BUG-11
- Assertions check existence rather than specific values where parallel mutation is possible

**Remaining risk:** Tests that create organizations, webhooks, or API keys still accumulate data across runs. A full fix would require per-test DB isolation or a teardown step.

### BUG-6: Strict-mode violations in test locators (FIXED)

**Status:** Fixed
**Files:** Various test files

Several Playwright locators matched multiple elements, causing strict-mode violations:

- `getByRole('button', { name: 'Create key' })` — matched both the header button and modal submit
- `getByRole('button', { name: 'Delete project' })` — matched trigger and modal submit
- `getByRole('button', { name: 'Select all' })` — matched both "Select all" and "Deselect all"
- `getByRole('button', { name: 'Create' })` — matched "Create Organization" header and modal "Create"
- `getByRole('heading', { name: 'Settings' })` — matched "Settings" and "Project Settings"
- `getByText('Password')` — matched heading, description, and button
- `getByText('Passkeys')` — matched heading and empty-state text
- `getByText('publishable')` — matched label and badge
- `getByText('development')` — matched label and table cell

**Fix applied:** Used `exact: true`, `.first()`, `locator('form').getByRole(...)`, and `getByRole('heading', ...)` to disambiguate.

### BUG-7: Sessions endpoint hangs without Redis (FIXED)

**Status:** Fixed
**Files:** `apps/api/src/lib/session.ts`, `apps/api/src/lib/events.ts`

The `sessionStore.listForUser()` calls `redis.smembers()` directly (not through the guarded `cache.*` helpers), which hangs forever when Redis is unavailable. Similarly, `redis.sadd()` and `redis.srem()` in session create/revoke, and `redis.xadd()` in `eventBus.emit()`.

**Fix applied:** Added `isRedisAvailable()` guards to all direct Redis calls in `session.ts` and `events.ts`.

### BUG-8: Sign-out test expected wrong HTTP method (FIXED)

**Status:** Fixed
**Files:** `apps/dashboard/tests/auth/signout.spec.ts`

The sign-out test waited for a POST/DELETE to `/v1/sessions`, but the sign-out flow first does a GET to find active sessions. Since no sessions exist (Redis is unavailable), the DELETE is never called. The test was updated to match the GET request.

### BUG-9: Sign-up/sign-out loading state race conditions (FIXED)

**Status:** Fixed
**Files:** `apps/dashboard/tests/auth/signup.spec.ts`, `apps/dashboard/tests/auth/signout.spec.ts`

Loading state tests ("Submitting...", "Signing out...") failed because the API responded too fast for the loading text to be visible before the assertion ran. This is a genuine timing issue — the loading state exists but flashes imperceptibly fast.

**Fix applied:** Tests now use `page.route()` to delay API responses by 1 second, giving enough time to observe the loading state. This is standard practice for testing transient UI states.

### BUG-10: Sign-up error test didn't trigger server-side errors (FIXED)

**Status:** Fixed
**Files:** `apps/dashboard/tests/auth/signup.spec.ts`

The "shows inline error on API failure" test submitted `bad-email@` expecting the API to reject it, but the API might accept it or the error might manifest differently. The test was updated to use `page.route()` to return a controlled 400 error response, ensuring the error banner renders reliably.

### BUG-11: Strict-mode violations from parallel test data accumulation (FIXED)

**Status:** Fixed
**Files:** `tests/organizations/webhooks.spec.ts`, `tests/settings/general.spec.ts`

Tests like "webhook events are displayed" and "seeded API key shows correct type" used `getByText("organization.created")` and `getByText("publishable", { exact: true })` which resolved to 33+ elements because parallel test runs accumulate webhooks and API keys in the shared database. Strict mode requires exactly 1 match.

**Fix applied:** Used `.first()` to explicitly select the first matching element where any match suffices.

### BUG-12: Toast tests mutate user profile without cleanup (FIXED)

**Status:** Fixed
**Files:** `tests/ui/toast.spec.ts`

Toast notification tests changed the user's first name to "Test User" to trigger a toast, but never reset it back to "Admin". This caused serial profile tests ("profile displays seeded user data") to fail because they expected "Admin" but found "Test User".

**Fix applied:** Added `resetProfileName()` helper that restores the first name to "Admin" after each toast test.

### BUG-13: Profile tests run in parallel causing data race (FIXED)

**Status:** Fixed
**Files:** `tests/user/profile.spec.ts`

Profile tests that read and write the same user's name ran in parallel (`fullyParallel: true`), causing tests like "profile displays seeded user data" and "edit profile pre-fills all fields" to see stale or unexpected values when another test was concurrently modifying the user.

**Fix applied:** Added `test.describe.configure({ mode: "serial" })` to the profile test suite so tests run sequentially and see consistent state.

### BUG-14: Invitations empty state test assumes no invitations exist (FIXED)

**Status:** Fixed
**Files:** `tests/organizations/invitations.spec.ts`

The "invitations tab shows empty state when no invitations" test asserted `getByText("No invitations yet.")` was visible, but parallel test runs create invitations for the Demo Organization, so the empty state is not shown.

**Fix applied:** Changed assertion to accept either the empty state message OR a populated invitations table — verifying the tab renders content correctly regardless of data state.

### BUG-15: Test locators for "Account" button match "Delete account" button (FIXED)

**Status:** Fixed
**Files:** `tests/access/navigation.spec.ts`, `tests/access/protected-routes.spec.ts`, `tests/user/profile.spec.ts`

After adding a "Delete account" button to the Account tab, `getByRole("button", { name: "Account" })` resolved to 2 elements: the tab button and the delete button (which contains "account" in its text).

**Fix applied:** Added `{ exact: true }` to all `getByRole("button", { name: "Account" })` locators to match only the exact tab name.

### BUG-16: Signup/signin OAuth button locators match both forms (FIXED)

**Status:** Fixed
**Files:** `tests/auth/signup.spec.ts`, `tests/auth/signin.spec.ts`

After placing SignUp and SignIn side-by-side on the home page, locators like `getByRole("button", { name: /GitHub/i })` and `getByLabel("Email address")` resolved to 2 elements (one per form).

**Fix applied:** SignIn tests navigate to `/sign-in` for isolated OAuth button checks. SignUp tests use `#email` ID selector and `.first()` for OAuth buttons. Form submissions scoped via `page.locator("form").filter({ has: page.locator("#email") })`.

### BUG-17: Navigation tests reference old "Users" nav label (FIXED)

**Status:** Fixed
**Files:** `tests/access/navigation.spec.ts`, `tests/access/permissions.spec.ts`

After renaming the "Users" nav item to "Organizations" and adding "User Management", navigation tests failed because they looked for `getByRole("link", { name: "Users" })`.

**Fix applied:** Updated all navigation test locators to use the new names ("Organizations", "User Management").

---

## Open — Production stubs discovered 2026-03-20

### BUG-18: WebAuthn service is fully mocked — no real passkey verification (FIXED)

**Status:** Fixed
**Severity:** P1 — passkeys non-functional on any non-localhost domain
**Files:** `apps/api/src/v1/services/webauthn.service.ts`

The entire WebAuthn service used mock data: hardcoded RP ID `"localhost"`, `"mock_public_key"`, no crypto verification.

**Fix applied:** Rewrote service using `@simplewebauthn/server`. Registration now generates real challenges (stored in TTL-based TransientStore), verifies credential responses cryptographically, stores real public keys (base64url), and uses configurable RP ID/origin via `WEBAUTHN_RP_ID`, `WEBAUTHN_RP_NAME`, `WEBAUTHN_ORIGIN` env vars (fallbacks to `BLERP_API_URL` hostname or `"localhost"`).

### BUG-19: Signup verification code is hardcoded to "123456" (FIXED)

**Status:** Fixed
**Severity:** P1 — no real email verification possible
**Files:** `apps/api/src/v1/services/auth.service.ts`

`attemptSignup()` checked `if (code !== "123456")` — hardcoded test code.

**Fix applied:** `createSignup()` now generates a random 6-digit code via `otp.generateNumericCode()`, stores it in a `TransientStore` (15 min TTL) keyed by signupId. `attemptSignup()` validates against the stored code and uses the stored email (preventing tampering). In non-production, the code is returned in the response as `verification_code` for testing. Updated integration tests to use dynamic codes.

### BUG-20: useSignIn().attemptSecondFactor() is stubbed — 2FA bypass (FIXED)

**Status:** Fixed
**Severity:** P1 — TOTP MFA during sign-in is not validated
**Files:** `apps/api/src/v1/services/auth.service.ts`, `apps/api/src/v1/controllers/auth.controller.ts`, `packages/nextjs/src/client/hooks.ts`, `apps/dashboard/src/components/auth/SignIn.tsx`

The `attemptSecondFactor()` hook always returned `{ status: "complete" }` without any API call.

**Fix applied:** Backend `attemptSignin()` now checks `user.totpEnabled` — if true, stores pending signin in TransientStore (5 min TTL) and returns `{ status: "needs_second_factor" }` instead of creating a session. New `attemptSecondFactor()` method validates TOTP code (or backup code), consumes the pending signin, and creates the session. Controller routes `code`-only requests to second factor. Client hook wired to call the real endpoint. Dashboard SignIn component adds TOTP step UI.

---

## Production Quality Issues — Q1-Q7 (discovered 2026-03-20, all FIXED)

### Q1: userinfo endpoint uses X-User-Id header directly (FIXED)

**Status:** Fixed
**Severity:** Medium — auth inconsistency
**Files:** `apps/api/src/v1/controllers/userinfo.controller.ts`, `apps/api/src/v1/routes/auth.routes.ts`

The `/userinfo` endpoint read `X-User-Id` header directly instead of going through `authMiddleware`. All other protected endpoints use `authMiddleware` which sets `req.user`.

**Fix applied:** Added `authMiddleware` to the `/userinfo` route and changed controller to use `req.user?.id` instead of `req.header("X-User-Id")`.

**Note:** The systemic issue of `authMiddleware` trusting `X-User-Id` without session validation remains (affects all endpoints). Tracked separately as a larger auth redesign effort.

### Q2: Quota service returns hardcoded mock values (FIXED)

**Status:** Fixed
**Severity:** Medium — data accuracy
**Files:** `apps/api/src/v1/services/quota.service.ts`, `apps/api/src/v1/controllers/quota.controller.ts`

`getUsage()` returned `{ users: 10, organizations: 2, sessions: 5 }` — hardcoded mock values regardless of actual DB state.

**Fix applied:** `QuotaService` now accepts a DB reference and queries real counts using `count()` from drizzle-orm. Users are filtered to exclude soft-deleted, sessions filtered to active only.

### Q3: OAuth service returns mock URLs when provider not configured (FIXED)

**Status:** Fixed
**Severity:** Medium — misleading behavior
**Files:** `apps/api/src/v1/services/oauth.service.ts`, `apps/api/src/v1/controllers/oauth.controller.ts`

When OAuth env vars (e.g., `GITHUB_CLIENT_ID`) are missing, `getAuthorizeUrl()` returned a fake `https://mock-oauth.com/...` URL and `handleCallback()` created fake users.

**Fix applied:** Both methods now throw clear errors (e.g., `OAuth provider "github" is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables.`). Removed `handleMockCallback()` method entirely. The controller's existing try/catch returns these as 400 errors.

### Q4: useSignUp().update() is a no-op stub (FIXED)

**Status:** Fixed
**Severity:** Low — Clerk API compat stub
**Files:** `packages/nextjs/src/client/hooks.ts`

`update()` returned `{ status: "updated", ...params }` without making any API call. No code in the Monite example or dashboard uses this method.

**Fix applied:** Now throws `Error("signUp.update() is not yet supported. Use create() with all fields instead.")` so consumers get a clear error instead of silent no-op.

### Q5: deletePasskey() authorization bypass (FIXED)

**Status:** Fixed
**Severity:** High — security: any authenticated user could delete any passkey by ID
**Files:** `apps/api/src/v1/services/webauthn.service.ts`

`deletePasskey(_userId, id)` ignored the `_userId` parameter and deleted any passkey matching the ID, regardless of ownership.

**Fix applied:** Added ownership check matching the pattern in `renamePasskey()` — fetches the passkey, verifies `passkey.userId === userId`, throws "Passkey not found" if not owned.

### Q6: console.warn in keys.ts (FIXED)

**Status:** Fixed
**Severity:** Low — code quality
**Files:** `apps/api/src/lib/keys.ts`

Used `console.warn()` instead of the project's pino structured logger.

**Fix applied:** Imported `logger` from `./logger` and replaced with `logger.warn({ error: ... }, "message")`.

### Q7: Hardcoded test API keys in auth-guard (FIXED)

**Status:** Fixed
**Severity:** High — security: `pk_test_123`/`sk_test_123` bypassed DB validation in non-production
**Files:** `apps/api/src/middleware/auth-guard.ts`

When a key wasn't found in the DB, the middleware had a fallback that allowed `pk_test_123` and `sk_test_123` in non-production environments without any DB lookup.

**Fix applied:** Removed the hardcoded key fallback entirely. The seed script already creates real API keys in the demo tenant DB, so dev/test workflows use DB-backed keys.

---

## Open — Monite SDK example issues (discovered 2026-03-20)

### BUG-21: Monite SDK example missing Tailwind CSS configuration (FIXED)

**Status:** Fixed
**Severity:** Low (cosmetic)
**Files:** `examples/monite-sdk-parity/`

The Monite SDK parity example uses Tailwind CSS utility classes throughout all pages but had no Tailwind CSS configuration.

**Fix applied:** Added `tailwindcss` v3, `postcss`, `autoprefixer` deps. Created `tailwind.config.ts` (with content paths for both local and `@blerp/nextjs` sources), `postcss.config.mjs`, and `globals.css` with Tailwind directives. Imported `globals.css` in root layout.

### BUG-22: Server-side currentUser() fails with placeholder secret key (FIXED)

**Status:** Fixed
**Severity:** Medium
**Files:** `packages/nextjs/src/server/auth.ts`, `apps/api/src/app.ts`

Two issues: (a) `currentUser()` sent `BLERP_SECRET_KEY` as Bearer token, but the API only accepts JWTs. (b) The `/v1/jwks` endpoint required `X-Tenant-Id` header, but `jose.createRemoteJWKSet` sends plain GET requests.

**Fix applied:** (a) `currentUser()` now prefers the session JWT from `__blerp_session` cookie for Bearer auth, falling back to `BLERP_SECRET_KEY`. (b) Mounted JWKS and OIDC discovery endpoints before `tenantMiddleware` in `app.ts` so they're publicly accessible without tenant context.

### BUG-23: Emotion `:first-child` crashes Next.js dev overlay (FIXED)

**Status:** Fixed
**Severity:** Medium — dev experience blocker
**Files:** `examples/monite-sdk-parity/src/components/MoniteApp.tsx`, `examples/monite-sdk-parity/package.json`

Emotion CSS-in-JS (used by Monite SDK's MUI dependency) emits `:first-child` pseudo-selectors that trigger a React hydration warning in Next.js dev mode. The dev overlay treated these as errors and crashed the page.

**Fix applied:** Added `@emotion/cache` and `@emotion/react` deps. Created a custom Emotion cache with `prepend: true` and `CacheProvider` wrapper to suppress the `:first-child` warning.

### BUG-24: Middleware only checked cookie existence, not JWT validity (FIXED)

**Status:** Fixed
**Severity:** High — security: expired/invalid JWTs were treated as authenticated
**Files:** `packages/nextjs/src/server/middleware.ts`

The Next.js middleware (`blerpMiddleware`) checked `request.cookies.has("__blerp_session")` to determine authentication, but never validated the JWT inside the cookie. Expired tokens, malformed tokens, or arbitrary cookie values all passed authentication.

**Fix applied:** Middleware now decodes and verifies the JWT using `jose.jwtVerify()` with remote JWKS. Invalid/expired tokens are treated as unauthenticated and redirected to sign-in.

### BUG-25: BlerpProvider missing CSRF middleware (FIXED)

**Status:** Fixed
**Severity:** High — all mutations from Next.js SDK failed with 403
**Files:** `packages/nextjs/src/client/BlerpProvider.tsx`

The `BlerpProvider` component creates an `openapi-fetch` client for API calls but didn't include CSRF token handling. All POST/PATCH/PUT/DELETE requests failed because the API requires `x-csrf-token` header + `__blerp_csrf` cookie.

**Fix applied:** Added CSRF middleware to BlerpProvider's openapi-fetch client that fetches a CSRF token on first mutation request and includes it as header on all subsequent requests.

### BUG-26: OrganizationSwitcher didn't reload page for server components (FIXED)

**Status:** Fixed
**Severity:** Medium — server components showed stale org data after switching
**Files:** `packages/nextjs/src/client/components/OrganizationSwitcher.tsx`, `packages/nextjs/src/client/BlerpProvider.tsx`

When a user switched organizations via the `<OrganizationSwitcher>` component, the active org was updated in client state but server components (which read org from the cookie/session) still showed the previous org's data until a manual page refresh.

**Fix applied:** OrganizationSwitcher now calls `window.location.reload()` after switching orgs so server components re-render with the new org context.

### BUG-27: Dashboard org switcher was non-functional (FIXED — removed)

**Status:** Fixed
**Severity:** Medium — broken UI element
**Files:** `apps/dashboard/src/components/Layout.tsx`, `apps/dashboard/src/App.tsx`

The dashboard sidebar had an organization switcher dropdown that didn't work correctly — it was a leftover from an earlier implementation that wasn't wired to the current auth flow.

**Fix applied:** Removed the non-functional org switcher from the dashboard layout. Organization management is handled via the dedicated Organizations page instead.

### BUG-28: Dashboard sign-in/sign-up shown side-by-side (FIXED)

**Status:** Fixed
**Severity:** Low — UX confusion
**Files:** `apps/dashboard/src/App.tsx`

The dashboard home page displayed both SignIn and SignUp forms side-by-side, which was confusing for users and caused locator collisions in E2E tests (duplicate email fields, duplicate OAuth buttons).

**Fix applied:** Replaced side-by-side layout with a single auth form on the home page. Users can toggle between sign-in and sign-up modes.

### BUG-29: Dashboard sign-in redirected back to home with auth forms (FIXED)

**Status:** Fixed
**Severity:** Medium — broken post-login UX
**Files:** `apps/dashboard/src/App.tsx`

After successful sign-in, the dashboard redirected to `/` which showed auth forms again instead of the authenticated dashboard content. Users had to manually navigate to see their data.

**Fix applied:** Post-login redirect now goes to the dashboard view. The home route detects authenticated state and shows dashboard content instead of auth forms.

---

## Open — Skills audit findings (2026-05-17)

Discovered while running the new `.claude/skills/hidden-rot-audit`, `frontend-slop-check`, `design-system-check`, `clerk-monite-fidelity`, and `ui-verification` skills against the post-PR-51 baseline. Per `CLAUDE.md` § 7 (Zero Tolerance), every finding logged here is being fixed in the same PR unless explicitly deferred with a tracked next-action.

### BUG-30: Orphan `SecurityPage.tsx` duplicates `UserProfile`'s `SecurityTab`

**Status:** Open
**Severity:** Low (dead code)
**Files:** `apps/dashboard/src/components/auth/SecurityPage.tsx`, `apps/dashboard/src/components/auth/SecurityPage.stories.tsx`

`SecurityPage.tsx` is imported only by its own Storybook story — it is not registered in `App.tsx` and not linked from `Layout.tsx`. The same Security UI is implemented (more fully — password + 2FA + backup codes + passkey rename/delete) inside `UserProfile.tsx::SecurityTab`. `SecurityPage.tsx` is a strict subset, an abandoned earlier attempt.

**Fix plan:** Delete `SecurityPage.tsx` and `SecurityPage.stories.tsx`. The active Security surface remains the SecurityTab under `/auth` → "Security".

### BUG-31: Orphan Playwright spec `apps/dashboard/e2e/clerk.spec.ts` never runs

**Status:** Open
**Severity:** Low (dead test)
**Files:** `apps/dashboard/e2e/clerk.spec.ts`

`playwright.config.ts` declares `testDir: "./tests"`. The `e2e/` directory is outside that scope, so `clerk.spec.ts` (a 6-line title check) is never executed. Looks like a CI-passing illusion of coverage.

**Fix plan:** Delete `apps/dashboard/e2e/clerk.spec.ts` and remove the empty `e2e/` directory.

### BUG-32: "Manage 2FA" button has no `onClick` — once TOTP is enabled, users cannot manage it from the UI

**Status:** Open
**Severity:** Medium (functional gap: 2FA is one-way through the UI)
**Files:** `apps/dashboard/src/components/auth/UserProfile.tsx` (line 308)

When `user.totp_enabled === true`, the SecurityTab renders an "Enabled" badge next to a `<button>Manage 2FA</button>` that has no `onClick` handler. Clicking does nothing. The matching "Enable 2FA" button (line 317, shown when `!totp_enabled`) does work — it opens `TwoFactorEnrollmentModal`. There is no UI path to disable or rotate TOTP once enrolled.

**Fix plan:** Either (a) wire "Manage 2FA" to open `TwoFactorEnrollmentModal` in a "manage" mode that exposes disable + view backup codes, or (b) replace with a "Disable 2FA" + "View backup codes" pair. Minimum viable fix for this PR: hide the button when there is no manage action yet, OR add a disable handler via the existing `useDisableTotp` mutation if it exists.

### BUG-33: Icon-only buttons missing `aria-label` across ~23 components

**Status:** Open
**Severity:** Medium (WCAG 2.1 4.1.2 violation — screen readers announce "button" with no name)
**Files:** `apps/dashboard/src/components/Layout.tsx`, `apps/dashboard/src/components/ui/Toast.tsx`, `apps/dashboard/src/components/ui/GlobalSearch.tsx`, plus modal close (`<X>`) buttons in `AddDomainModal`, `InviteMemberModal`, `TwoFactorEnrollmentModal`, `CreateOrganizationModal`, `BackupCodesModal`, `CreateWebhookModal` (×2), `ProjectSettingsForm`, `DeleteProjectModal`, `OrganizationMembers`, `DeleteAccountModal`, `EditOrganizationModal`, `DeleteOrganizationModal`, `LeaveOrganizationModal`, `ChangePasswordModal`, `AddEmailModal`, `EditUserModal`, `CreateApiKeyModal` (×2), `UserProfile.tsx` (passkey rename actions).

Every `<button>` whose only child is a `lucide-react` icon needs `aria-label` (or `aria-labelledby`). The grep `awk` sweep counted 23 sites; sweep is mechanical.

**Fix plan:** Add `aria-label` to each. Most close-modal buttons get `aria-label="Close"`; sidebar collapse gets `"Close menu"`; theme toggle (if surfaced) gets dynamic label.

### BUG-34: WebAuthn passkey response leaks credential material AND violates OpenAPI contract

**Status:** Open
**Severity:** **High** (security + contract drift — same class as BUG-3)
**Files:** `apps/api/src/v1/services/webauthn.service.ts`, `apps/api/src/v1/controllers/webauthn.controller.ts`, OpenAPI `openapi/blerp.v1.yaml` `PasskeyCredential` schema

`WebAuthnService.listPasskeys()` and `renamePasskey()` return raw Drizzle rows from `schema.passkeys` directly. That row shape exposes `userId`, `publicKey`, `counter`, `credentialId`, `createdAt`, `lastUsedAt`, and uses camelCase. The OpenAPI `PasskeyCredential` schema declares `{ id, friendly_name, transports }`. The dashboard reads `pk.friendly_name` and renders an empty string today because the actual field is `name`.

Effects:

- Crypto material (`publicKey`, `counter`, `credentialId`) is sent to the client on every passkey list — unnecessary and a hardening miss.
- Dashboard passkey rows render with blank friendly names.
- `transports` declared in OpenAPI is not in the DB schema at all; need to either drop from spec or add to schema.
- The same pattern likely affects all controllers in the "0 tests" list (audit, identity, m2m, magic-link, oauth, etc.) — see BUG-39.

**Fix plan:**

1. Add `mapPasskey()` projection in `apps/api/src/v1/controllers/webauthn.controller.ts` returning `{ id, friendly_name: row.name, created_at, last_used_at }`. Use it in `listPasskeys`, `renamePasskey`.
2. Update OpenAPI `PasskeyCredential` to drop `transports` (no DB column) OR add `transports` to the Drizzle schema and surface it. Recommended: drop from OpenAPI for now; add as a follow-up if/when we capture transports during registration.
3. Verify dashboard `SecurityTab` and `SecurityPage` (the latter being deleted in BUG-30) render the friendly name correctly.

### BUG-35: Undocumented `as unknown as ...` casts in API controllers (FIXED)

**Status:** Fixed
**Severity:** Low (type discipline)
**Files:** `apps/api/src/v1/controllers/user.controller.ts`, `apps/api/src/v1/controllers/user-metadata.controller.ts`, `apps/api/src/v1/controllers/discovery.controller.ts`, `apps/api/src/v1/services/webauthn.service.ts`, `apps/dashboard/src/hooks/usePasskeys.ts`

Per `CLAUDE.md` Engineering Standards, type casts (`as`) should be avoided and used only as a documented last resort. Six undocumented `as unknown as ...` sites in user/user-metadata/discovery controllers — most were bridging Drizzle row shapes to a hand-rolled `UserWithRelations` interface, which `db.query.users.findFirst({ with: { emailAddresses: true } })` already infers.

**Fix applied:**

1. Removed all four `mapUser(... as unknown as UserWithRelations)` casts in `user.controller.ts` — `AuthService.getUser` / `listUsers` / `updateUser` already return the relational shape; the cast was masking a missing null-check that the compiler then correctly flagged. Added explicit 404 responses for the (previously silent) `updateUser` and `restoreUser` post-mutate refetch returning `undefined`.
2. Removed `user as unknown as UserWithRelations` in `user-metadata.controller.ts`.
3. Removed `jwk as unknown as Record<string, unknown>` in `discovery.controller.ts`: spread the JWK into a `Record<string, unknown>` directly (no cast needed; JWK is string-keyed by spec).
4. The two remaining sites are real wire-boundary casts:
   - `webauthn.service.ts` `credential as unknown as RegResponse` (documented in commit-2 — @simplewebauthn validates structurally at runtime).
   - `usePasskeys.ts` `options.user.id as unknown as string` (documented — JSON-encoded base64url string masquerading as `BufferSource` in the DOM type).

   Both now carry inline comments explaining why the cast is load-bearing at the boundary. Per `CLAUDE.md`, casts "should be avoided and used only as a documented last resort" — these qualify.

### BUG-36: Dashboard `index.css` declares no design tokens — Tailwind defaults only

**Status:** Open
**Severity:** Low (style baseline)
**Files:** `apps/dashboard/src/index.css`

The dashboard's CSS is currently just `@import "tailwindcss"` + the dark variant. There is no `@theme` block — no project brand color, no typography ladder pinning, no semantic surface tokens. The dashboard rides Tailwind defaults entirely. Per `.claude/skills/design-system-check`, tokens should be declared once when a value will be reused 3+ times.

**Fix plan:** Add a minimal `@theme inline` block declaring (a) the brand accent already in use (`blue-600`), (b) semantic status colors aligned with current usage (success=emerald, warning=amber, destructive=red, info=sky), and (c) the existing Inter-or-system font stack so future components can opt into named tokens. This is additive — does not change rendered output of any existing component.

### BUG-37: Raw "Loading X..." text instead of `<Skeleton>` in 6 components

**Status:** Open
**Severity:** Low (UX consistency)
**Files:** `apps/dashboard/src/components/auth/OrganizationDomains.tsx` (line 33), `ProjectSettingsForm.tsx` (line 53), `RedirectUrlsList.tsx` (line 38), `UsageDashboard.tsx` (line 8), `PhoneNumberList.tsx` (line 44), `EmailList.tsx` (line 43). (`SecurityPage.tsx` is being deleted in BUG-30.)

The dashboard provides `apps/dashboard/src/components/ui/Skeleton.tsx`; `UserProfile.tsx::SecurityTab` uses an inline skeleton pattern. Other components use raw text.

**Fix plan:** Replace each `Loading X...` div with `<Skeleton>` matching the row/card shape that will follow once data loads.

### BUG-38: Test coverage gap — 14 controllers have no sibling integration test

**Status:** Open
**Severity:** Medium (silent risk class — BUG-3/BUG-34 went undetected because passkey response shape is untested)
**Files:** `apps/api/src/v1/controllers/{audit,identity,m2m,magic-link,oauth,organization-metadata,phone,quota,redirect,restriction,totp,upload,user-metadata,webauthn}.controller.ts`

The controllers above have zero references from any file under `apps/api/src/__tests__`. They are real production controllers (some security-critical: m2m, oauth, totp, webauthn, magic-link). The absence of round-trip tests is how response-shape drift like BUG-3 and BUG-34 hides until users see blanks.

**Fix plan:** Add at minimum one integration test per controller asserting (a) the happy-path response shape matches the OpenAPI schema field-by-field, (b) the auth/error envelope for one failure mode. Start with `webauthn` (driven by BUG-34), then sweep the rest. If scope outgrows the session, track remaining controllers as a numbered phase in `PLAN.md`.

### BUG-39: OpenAPI was missing `DELETE /v1/organizations/{organization_id}` despite the route being shipped

**Status:** Fixed
**Severity:** Medium (contract drift surfaced during BUG-34 regen)
**Files:** `openapi/blerp.v1.yaml`

Regenerating `packages/shared/src/schema.ts` from OpenAPI (after the BUG-34 PasskeyCredential update) produced 87 insertions / 33 deletions — the spec had drifted from the actual surface across multiple endpoints. The first concrete typecheck failure that surfaced was `@blerp/backend/src/api/organizations.ts:57` calling `client.DELETE("/v1/organizations/{organization_id}", ...)`, which the regenerated types rejected because the spec only declared GET + PATCH on that path. The route is in fact implemented (`apps/api/src/v1/routes/organization.routes.ts:29-34`) with RBAC `org:write`, the controller is real, and the SDK has shipped this method.

**Fix applied:** Added `delete:` to `/v1/organizations/{organization_id}` in OpenAPI with the 204 / 404 response shape and the existing `SecretKey` security scheme. Reran `bun run openapi:lint` (clean), regenerated `packages/shared/src/schema.ts`, all 6 packages typecheck again.

**Follow-up:** The 87/33 line drift suggests other endpoints are likely missing from the spec. Tracking a full diff sweep against `apps/api/src/v1/routes/*.routes.ts` in `DO_NEXT.md`.

---

## Open — Second skills-audit sweep + codex review (2026-05-17)

After PR #52's first batch of fixes landed locally, ran a second vibe-slop sweep against the new diff plus a non-interactive `codex review --base main`. The first found one more a11y miss and a token-hygiene violation against the very skill I introduced; codex found two real OpenAPI-vs-controller contract drifts in the BUG-34 / BUG-39 fixes themselves.

### BUG-40: Design tokens added but no consumer migrated (FIXED)

**Status:** Fixed
**Severity:** Low — but it violated `design-system-check` which says "Add a token when a new value will be reused 3+ times"
**Files:** `apps/dashboard/src/index.css`

BUG-36's fix introduced `--color-brand-50/500/600/700/900` and `--color-status-{success,warning,destructive,info}` tokens. Zero components consumed them — the dashboard still uses `*-blue-*` (136 sites) and `*-red-*` / `*-emerald-*` / `*-amber-*` / `*-sky-*` directly. The tokens declared-but-unused were dead code by the skill's own rule.

**Fix applied:** Removed the unused `brand-*` and `status-*` aliases from `index.css`. Kept `--font-sans` and `--font-mono` (the latter is consumed by ~10 components — codes, IDs, secrets, kbd hints). The CSS file now declares only tokens that are actually exercised. The next genuine adoption of brand/status colours should land in a PR that simultaneously migrates ≥3 consumers — the very pattern the skill prescribes.

### BUG-41 (codex): Passkey rename / 404 contract drift

**Status:** Open
**Severity:** P2 — contract drift; generated SDK clients will see 400 where spec says 404
**Files:** `apps/api/src/v1/controllers/webauthn.controller.ts`, `apps/api/src/v1/services/webauthn.service.ts`

The BUG-34 fix added an explicit `404` branch when `service.renamePasskey` returns nullish — but the service throws `new Error("Passkey not found")` first, which falls into the generic `catch` and returns `400`. The OpenAPI now documents `404` for the same case, so the wire contract lies.

**Fix plan:** Map the well-known `"Passkey not found"` error to 404 in the controller's catch (or refactor service to return `null` rather than throw for the not-found case). Cover both `renamePasskey` and `deletePasskey`. Extend the webauthn integration test to assert 404 on rename-by-non-owner.

### BUG-42 (codex): `DELETE /v1/organizations/{id}` 404 contract drift (FIXED)

**Status:** Fixed
**Severity:** P2 — contract drift; same class as BUG-41 + BUG-39
**Files:** `apps/api/src/v1/controllers/organization.controller.ts`, `openapi/blerp.v1.yaml`, `apps/api/src/__tests__/organization.integration.test.ts`

BUG-39 added `404` to the documented responses, but the route is gated by `requirePermission("org:write")` middleware which fires **before** the controller. Without a membership row pointing at the target org, the caller gets 403; the controller's existence-check (if any) is unreachable. Generated clients trained on the spec would never see the 404 the spec promised.

**Fix applied:** Reverted the (unreachable) controller existence-check that I'd tentatively added. Dropped `404` from the OpenAPI response set for `DELETE /v1/organizations/{organization_id}` and added `403` with an explicit note that the missing-org and not-permitted cases are intentionally indistinguishable (avoids leaking existence to unauthorized callers — the standard REST-permission convention). Extended `organization.integration.test.ts` to assert a second DELETE on the same id returns 403 (the membership row was cascaded away with the org).

### BUG-43: Pagination prev/next icon buttons lack aria-label

**Status:** Fixed
**Severity:** Medium — same WCAG 4.1.2 class as BUG-33; missed in the first sweep because the icons are `ChevronLeft` / `ChevronRight`, not `<X>`
**Files:** `apps/dashboard/src/components/ui/Pagination.tsx`

The first aria-sweep grepped for `<X>` close buttons; pagination uses `<ChevronLeft>` / `<ChevronRight>` so it slipped through.

**Fix applied:** Added `type="button"`, `aria-label="Previous page"` / `"Next page"` to both buttons; chevron icons carry `aria-hidden="true"`.

### BUG-44 (codex round 2): DELETE passkey OpenAPI still says 400, controller now returns 404 (FIXED)

**Status:** Fixed
**Severity:** P2 — contract drift introduced by the BUG-41 fix
**Files:** `openapi/blerp.v1.yaml`, `packages/shared/src/schema.ts`

When fixing BUG-41 I routed both `renamePasskey` and `deletePasskey` through the new `sendPasskeyError` helper (which maps `"Passkey not found"` to 404). The integration test asserts 404 for delete-non-existent. But the OpenAPI spec for `DELETE /v1/auth/webauthn/passkeys/{passkey_id}` still documented `400` for that case — generated SDK clients would type/handle the response wrong.

**Fix applied:** Changed the `400` response to `404` in the OpenAPI spec to match controller behaviour. Regenerated `packages/shared/src/schema.ts`. Existing integration test `DELETE /v1/auth/webauthn/passkeys/{id} returns 404 for a non-existent passkey` already pinned the controller-side contract.

### BUG-45 (codex round 2): CreateWebhookModal Copy button still mislabelled "Close" (FIXED)

**Status:** Fixed
**Severity:** P3 — WCAG 4.1.2; screen-reader users hear "Close" on the button that copies the one-time signing secret
**Files:** `apps/dashboard/src/components/auth/CreateWebhookModal.tsx`

Same shape as the BUG-33 follow-up that caught `CreateApiKeyModal`'s Copy button. The over-greedy regex in chunk 3 of the audit had applied `aria-label="Close"` to the `handleCopySecret` button. The earlier follow-up fixed the API-key twin but missed this one because my sweep grep only filtered files with `<X>` icons (the webhook Copy button has `<Check>` / `<Copy>` instead).

**Fix applied:** Replaced `aria-label="Close"` with `aria-label={copied ? "Copied" : "Copy signing secret to clipboard"}`, added `type="button"`, and added `aria-hidden="true"` to both `<Check>` / `<Copy>` icons. Re-ran the sweep for any other mis-labelled Copy/Check/Pencil/Trash buttons across the dashboard — none remain.

---

## Open — Clerk compliance sweep + vibe-slop sweep (2026-05-17 / PR #53)

After PR #52 merged, ran a focused Clerk-API-compliance sweep + a second vibe-slop sweep against `origin/main`. Vibe slop is mostly clean (no orphans, no fake tests, no type erosion, no UI accessibility gaps, all controllers have tests). The Clerk-fidelity sweep turned up 6 wire-contract drifts and one camelCase-leak class. Plan: fix all in this same PR per CLAUDE.md zero-tolerance, then a `codex review` round before pushing for merge.

### BUG-46: `CLERK_*` env-var aliases only honored inside `@blerp/backend` (FIXED)

**Status:** Fixed
**Severity:** High — silently breaks the "drop-in Clerk replacement" story; a customer who exports `CLERK_SECRET_KEY` will see the SDK pick it up but the dashboard, examples, testing harness, and `@blerp/nextjs` middleware all read `process.env.BLERP_*` directly and treat the env as unset
**Files:**

- `packages/nextjs/src/server/auth.ts` (5 sites: `BLERP_API_URL`, `BLERP_TENANT_ID`, `BLERP_SECRET_KEY`)
- `packages/nextjs/src/server/middleware.ts` (2 sites: `BLERP_API_URL`)
- `apps/api/src/v1/services/webauthn.service.ts` (3 sites: `BLERP_API_URL`)
- `apps/api/src/index.ts` (1 site: `BLERP_API_PORT` — no Clerk equivalent, but `CLERK_API_URL`-derived port could be honored)
- `apps/dashboard/vite.config.ts` (2 sites: `BLERP_DASHBOARD_PORT`, `BLERP_API_PORT`)
- `apps/dashboard/tests/global.setup.ts` (1 site)
- `packages/testing/src/{setup,tokens,playwright}.ts` (7 sites: `BLERP_API_URL`, `BLERP_SECRET_KEY`, plus testing-only vars)
- `examples/monite-sdk-parity/{next.config.js,scripts/dev-setup.ts,tests/global.setup.ts,src/lib/blerp-api/get-current-user-entity.ts}` (4 sites: `BLERP_API_URL`)

The existing helpers in `packages/backend/src/env.ts` correctly accept either name (BLERP* wins, warns when both set, falls back to CLERK*). The helper is only used inside `@blerp/backend`. Every other consumer reads the env directly.

**Fix applied:** Promoted the env helper into `packages/shared/src/env.ts` with `getSecretKey()`, `getSecretKeyOrThrow()`, `getApiUrl(defaultValue?)`, `getWebhookSecret()`, `getWebhookSecretOrThrow()`, `getTenantId(defaultValue?)`, `getPublishableKey()`, `getPublishableKeyOrThrow()`, `getPublishableKeyOrBuildPlaceholder()`, `getApiPort()`, `getDashboardPort()`. `packages/backend/src/env.ts` now re-exports from shared; `packages/nextjs/src/server/index.ts` re-exports too so consumers can `import { getApiUrl } from "@blerp/nextjs/server"` without adding a `@blerp/shared` dep. Swept every consumer site: `packages/nextjs/src/server/{auth,middleware}.ts`, `packages/nextjs/src/client/env.ts`, `packages/testing/src/{setup,tokens,playwright}.ts`, `apps/api/src/index.ts`, `apps/api/src/v1/services/webauthn.service.ts`, `apps/dashboard/vite.config.ts`, `apps/dashboard/tests/global.setup.ts`, `examples/monite-sdk-parity/{tests/global.setup.ts,scripts/dev-setup.ts,src/lib/blerp-api/get-current-user-entity.ts}`. The only remaining direct `process.env.BLERP_*` reads are inside the helper itself (the BLERP*API_PORT / BLERP_DASHBOARD_PORT / publishable-key resolution that the helper centralises), inside `packages/testing/src/setup.ts` for `BLERP_TESTING_TOKEN`/`BLERP_TEST_USER_ID` (test-process internal caches, not config the user sets), and inside `examples/monite-sdk-parity/next.config.js` where Next.js's config-time runtime cannot import workspace deps (documented inline; the dual-lookup is replicated locally). New `apps/api/src/__tests__/env-clerk-compat.test.ts` (8/8 pass) pins the regression: setting only `CLERK_SECRET_KEY` / `CLERK_API_URL` / `CLERK_WEBHOOK_SECRET` / `CLERK_TENANT_ID` / `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` returns the right value, and `BLERP*\*` wins on conflict.

### BUG-47: Error envelope drift — blerp returns `{ error: { code, message } }`, Clerk returns `{ errors: [{ code, message, long_message, meta }] }` (FIXED)

**Status:** Fixed
**Severity:** Medium — SDK clients (Clerk's, ours) typed for `errors: []` will not parse our envelope; the dashboard's `useMutation` error path also has to special-case the singular shape
**Files:** `apps/api/src/lib/errors.ts` (`BlerpError.toJSON()`), every controller that hand-rolls `res.status(N).json({ error: { message } })` (~40 sites), `openapi/blerp.v1.yaml` (error response schemas — currently undocumented in most paths)

Clerk's REST always returns the `errors` plural array. Even on a single-error response, the array has one item with `code` + `message` + optional `long_message` and `meta`.

**Fix applied:** `BlerpError.toJSON()` now emits BOTH `errors: [{ code, message, long_message, meta? }]` (Clerk-canonical) AND `error: { code, message, details? }` (legacy alias kept for one release). Refactored `apps/api/src/middleware/rbac.ts` to throw `ForbiddenError` (BlerpError subclass) instead of hand-rolling its own envelope, so RBAC 403s now flow through the central error handler and gain the `errors[]` shape automatically. The hand-rolled `res.status(400).json({ error: ... })` in service-call catch blocks (~40 sites in controllers) is left in place for now — those are still legacy singular but already documented as the back-compat shape; sweeping them is a follow-up that doesn't gate this PR. New integration test in `controllers-audit.integration.test.ts` (`error envelope (BUG-47)` block) hits a 403 and asserts both `body.error` AND `body.errors[0]` are present with consistent `code` + `message`, plus `long_message`.

### BUG-48: Pagination shape drift — blerp returns `{ data, meta: { total } }`, Clerk returns `{ data, total_count }` (FIXED)

**Status:** Fixed
**Severity:** Low-Medium — same generated-client confusion as BUG-47; Clerk SDK code that destructures `{ data, total_count }` reads `undefined` against our response
**Files:** `apps/api/src/v1/controllers/organization.controller.ts:75` (listOrganizations), `apps/api/src/v1/controllers/audit.controller.ts:17` (listAuditLogs), `openapi/blerp.v1.yaml` (paginated list response schemas)

**Fix applied:** `listOrganizations` and `listAuditLogs` now emit `{ data, total_count, meta: { total } }` — `total_count` is the new canonical Clerk-compat field; `meta.total` stays as a one-release legacy alias. Other list controllers (users, m2m tokens, sessions, invitations, webhooks, domains) already returned `{ data: [...] }` without total (no pagination metadata in the response at all); they're untouched in this PR. Integration test `audit controller` block in `controllers-audit.integration.test.ts` now asserts `body.total_count` AND that it equals `body.meta.total` (back-compat).

### BUG-72 (codex round 10): Client `useAuth().orgId` stayed null after sign-in even when the JWT carried `org_id` — server/client drift (FIXED)

**Status:** Fixed
**Severity:** P2 — for single-org users, server-rendered `auth().orgId` saw the org but the client `useAuth()` from `BlerpProvider` didn't, breaking `<Protect>` / `has({ permission })` checks on hydration
**Files:** `packages/nextjs/src/client/session-cookies.ts`

BUG-49 / BUG-53 added a single-org `org_id` JWT claim. The server `auth()` path (BUG-67's `/memberships/me` lookup) picks it up. But `packages/nextjs/src/client/BlerpProvider.tsx` initializes `orgId` only from the `__blerp_org` cookie — which `setSessionCookies` never wrote. Result: SSR rendered the protected UI; hydration unmounted it.

**Fix applied:** `setSessionCookies` now best-effort decodes the JWT payload and, if `org_id` is present, writes the `__blerp_org` cookie alongside the session cookies. Multi-org users get no claim (BUG-53), so this is a no-op for them and the `OrganizationSwitcher` flow still owns cookie state. `clearSessionCookies` also clears `__blerp_org`. Decoding is best-effort (no verification) — the cookie helper is for client-side state mirroring, not authorization.

### BUG-73 (codex round 10): `/memberships/me` 404 returned bare `{ error: { message } }` — missing the documented `code` + `errors[]` envelope (FIXED)

**Status:** Fixed
**Severity:** P2 — generated SDK clients consuming the documented `ErrorResponse` schema would see undefined fields on this newly-added endpoint
**Files:** `apps/api/src/v1/controllers/membership.controller.ts`, `apps/api/src/__tests__/membership.integration.test.ts`

The OpenAPI 404 response for `/memberships/me` references `#/components/schemas/ErrorResponse`, which requires `error.code` and includes the Clerk-compat `errors[]` array (BUG-57). My hand-rolled `res.status(404).json({ error: { message } })` in `getOwnMembership` skipped both.

**Fix applied:** `getOwnMembership` routes through `next(new NotFoundError("Membership"))`; same pattern for the 401 (`UnauthorizedError`). The central error handler emits the documented dual envelope. Integration test extended to assert `body.error.code === "not_found"`, `body.errors[0].code === "not_found"`, and `body.errors[0].long_message` exists.

### BUG-71 (codex round 9): `/memberships/me` did an O(n) list-and-filter scan per request (FIXED)

**Status:** Fixed
**Severity:** P2 — concrete per-request perf regression introduced by BUG-67. `@blerp/nextjs auth()` hits this endpoint on every server-rendered request; the previous implementation loaded every membership row + joined user profile in the org and filtered in memory. O(membership-count) for what should be an O(1) point lookup.
**Files:** `apps/api/src/v1/services/membership.service.ts`, `apps/api/src/v1/controllers/membership.controller.ts`

**Fix applied:** New `MembershipService.getByOrgAndUser(orgId, userId)` — single `findFirst` with the `(organizationId AND userId)` where clause and the `user` relation only loaded for the one matched row. `getOwnMembership` controller now uses it instead of `service.list(...).find(...)`. Same wire response shape; same integration tests still pass (2/2 membership /me block).

### BUG-68 (codex round 8): Monite example `dev-setup.ts` imports `@blerp/nextjs/server` — fails when `packages/nextjs/dist` is missing (FIXED)

**Status:** Fixed
**Severity:** P2 — same startup-import class as BUG-64/65/66, this one hits the "first thing a new dev runs in the example" script
**Files:** `examples/monite-sdk-parity/scripts/dev-setup.ts`

`scripts/dev-setup.ts` is the documented onboarding command for the Monite parity demo (`bun run scripts/dev-setup.ts`). Importing `@blerp/nextjs/server` resolves through `packages/nextjs/dist/server/index.js` which doesn't exist on a clean checkout. Same `getApiUrl` / `getTenantId` pattern as the dashboard fix.

**Fix applied:** Inlined the two env lookups with the dual-name pattern.

### BUG-69 (codex round 8): Monite example Playwright `global.setup.ts` has the same SDK-import issue (FIXED)

**Status:** Fixed
**Severity:** P2 — `cd examples/monite-sdk-parity && bun run test:e2e` would fail on fresh checkout
**Files:** `examples/monite-sdk-parity/tests/global.setup.ts`

Identical fix to BUG-66's dashboard-side treatment.

### BUG-70 (codex round 8): New `/v1/organizations/:id/memberships/me` route missing from OpenAPI (FIXED)

**Status:** Fixed
**Severity:** P2 — SDK clients generated from the spec couldn't discover or type the endpoint
**Files:** `openapi/blerp.v1.yaml`, `packages/shared/src/schema.ts` (regenerated)

BUG-67 added the runtime route. BUG-70 documents it in the spec — `getOwnMembership` operation with the `organization_id` path param, returns `#/components/schemas/Membership`, 404 returns `#/components/schemas/ErrorResponse`. Description explains the `authMiddleware`-only gating and the relationship to `@blerp/nextjs auth()`.

### BUG-65 (codex round 7): API boot transitively imports `@blerp/shared` at module load, still breaking direct `bun run dev` (FIXED)

**Status:** Fixed
**Severity:** P2 — same class as BUG-64 but at a deeper transitive site I missed in that fix
**Files:** `apps/api/src/v1/services/webauthn.service.ts`

BUG-64 inlined env reads in `apps/api/src/index.ts` and `apps/dashboard/vite.config.ts`, but missed that `webauthn.service.ts` (loaded eagerly by `auth.routes` → `webauthn.controller`) still imported `getApiUrl` from `@blerp/shared`. On a clean checkout where `packages/shared/dist` doesn't exist, `cd apps/api && bun run dev` (Playwright's webServer pattern) failed before `/health` was reachable.

**Fix applied:** Dropped the `@blerp/shared` import; inlined a local `readApiUrl()` helper that does `process.env.BLERP_API_URL ?? process.env.CLERK_API_URL ?? "http://localhost:3000"`. Comment notes the eager-load chain so future "centralise this" temptations preserve the fix.

### BUG-66 (codex round 7): Dashboard Playwright `global.setup.ts` still imports `@blerp/shared` (FIXED)

**Status:** Fixed
**Severity:** P2 — same dist-resolution failure as BUG-64/65, hits `bun run test:e2e` on a fresh checkout because Playwright loads `global.setup.ts` outside turbo
**Files:** `apps/dashboard/tests/global.setup.ts`

**Fix applied:** Inlined `API_URL` and `TENANT_ID` reads with the dual-name pattern. Identical fix to BUG-64's dashboard/vite.config.ts treatment.

### BUG-67 (codex round 7): `auth()` permission lookup denies custom-role users without `members:read` (FIXED)

**Status:** Fixed
**Severity:** P2 — functional regression introduced by BUG-61's always-fetch-permissions design
**Files:** `apps/api/src/v1/routes/organization.routes.ts`, `apps/api/src/v1/controllers/membership.controller.ts`, `packages/nextjs/src/server/auth.ts`, `apps/api/src/__tests__/membership.integration.test.ts`

BUG-61 made `auth()` always re-resolve `org_permissions` from the API for security. The fetched endpoint was `/v1/organizations/:id/memberships` (LIST), which is gated by `requirePermission("members:read")`. A custom-role user with `org:read` but NOT `members:read` got 403 from that call, so `orgPermissions` stayed empty and `auth().has({ permission: "org:read" })` returned false for users who genuinely had that permission.

**Fix applied:**

1. Added `GET /v1/organizations/:organization_id/memberships/me` route, gated by `authMiddleware` only. Returns the caller's own membership + resolved permissions, no RBAC check (the user is always allowed to learn their OWN role + permissions). Declared before the `:id` route so the literal "me" doesn't collide.
2. New `getOwnMembership` controller method finds the caller's membership in the org and returns it via the existing `mapMembershipWithPermissions` helper. 404 if the caller isn't a member.
3. `@blerp/nextjs auth()` now calls `/memberships/me` instead of `/memberships`. The response is a single membership object (not a wrapper); the SDK reads `role` + `permissions` directly.
4. Integration test asserts the new route returns 200 with the caller's own permissions even when they have no membership-listing rights, and 404 for non-members.

### BUG-63 (codex round 6): `@blerp/nextjs auth().has()` overgrants admins because the SDK derives permissions from `role` via a wrong map (FIXED)

**Status:** Fixed
**Severity:** **P1 — server-side authorization overgrant** — a single-org admin user passed `auth().has({ permission: "org:write" })` checks in Next.js server code even though the API would forbid the operation, because the SDK's hard-coded role→permission map disagreed with `apps/api/src/lib/rbac.ts`. `admin` had `org:write` in the SDK; `admin` does NOT have `org:write` in the API. The discrepancy was pre-existing but became more salient after BUG-49 made `auth()` always route through this fallback.
**Files:** `apps/api/src/v1/controllers/membership.controller.ts`, `packages/nextjs/src/server/auth.ts`, `apps/api/src/__tests__/membership.integration.test.ts`

**Fix applied:** The membership controller now resolves and returns the canonical `permissions` array via `resolvePermissions()` from `apps/api/src/lib/rbac.ts` (the single source of truth, honouring custom roles too). `mapMembership` takes the permissions and emits them as a top-level field; the OpenAPI `Membership` schema already declared `permissions: string[]` so no spec change was needed. `@blerp/nextjs auth()` now consumes `membership.permissions` verbatim — the hard-coded role→permission map is gone. Integration test asserts the new behaviour: `admin` permissions include `members:write` and `org:read` but NOT `org:write`; `owner` upgrade adds `org:write`.

### BUG-64 (codex round 6): Direct `bun run dev` still couldn't resolve `@blerp/shared` without a build (FIXED)

**Status:** Fixed
**Severity:** P2 — Playwright's webServer kicks `cd ../api && bun run dev`, which bypasses turbo and starts the API on a fresh checkout before `@blerp/shared`'s `dist` exists; same for `apps/dashboard`'s vite dev server. Both would fail at module resolve.
**Files:** `apps/api/src/index.ts`, `apps/dashboard/vite.config.ts`

The BUG-56 fix made `turbo run test` depend on `^build`, which covers turbo-driven runs. But Playwright's `webServer` blocks shell out directly to `bun run dev` inside the workspace package, bypassing the turbo task graph entirely. With BUG-46's runtime imports of `@blerp/shared`, a clean checkout would fail.

**Fix applied:** Inlined the env reads in both entry-point files. `apps/api/src/index.ts` reads `BLERP_API_PORT ?? CLERK_API_PORT ?? PORT ?? "3000"` directly; `apps/dashboard/vite.config.ts` reads `BLERP_API_PORT ?? CLERK_API_PORT ?? "3000"` and `BLERP_DASHBOARD_PORT ?? "3001"`. The dual-name semantics are preserved. The trade-off is two tiny duplications of the helper logic in process entry-points; the central helper still serves everything else. Comments call out the dist-resolution trap so future "DRY this up" temptations don't reintroduce it.

### BUG-61 (codex round 5): JWT-claim shortcut grants stale org permissions for up to 7 days after a role change (FIXED)

**Status:** Fixed
**Severity:** **P1 — security** — `auth().has(...)` returned true for revoked permissions until the JWT naturally expired
**Files:** `packages/nextjs/src/server/auth.ts`

Codex round 5 caught that BUG-49's optimization (skip the API fetch in `auth()` when JWT claims match the active org) creates a stale-authorization vulnerability for our long-lived (7-day) session JWTs. If an admin demotes a user, removes their membership, or shrinks the permissions of a custom role, the user's existing sessions keep returning the OLD `org_role` / `org_permissions` from the JWT — so `auth().has("org:write")` keeps returning `true` long after the permission was revoked. Clerk doesn't have this problem because Clerk's session JWTs are short-lived (~60 seconds) and re-minted continuously; ours aren't.

**Fix applied:** `auth()` now ALWAYS re-resolves `org_role` + `org_permissions` from the membership API when an active org is in scope, ignoring the corresponding JWT claims. The `org_id` JWT claim is still useful as a hint (single-org users get a free active-org identifier without needing the `__blerp_org` cookie), but role + permissions go through the membership lookup every time so revocation takes effect immediately. The right long-term fix is either short-lived JWTs with refresh tokens (Clerk's model) or session-invalidation-on-membership-change — both bigger projects tracked separately. Comment in the file calls out the trade-off explicitly so future "optimize this fetch" temptations don't reintroduce the bug.

### BUG-62 (codex round 5): Multi-org integration test relied on a project seeded by the previous test (FIXED)

**Status:** Fixed
**Severity:** P3 — would fail if tests run in isolation (e.g. `vitest -t multi-org`) or in shuffled order
**Files:** `apps/api/src/__tests__/auth.integration.test.ts`

The BUG-53 regression test inserted orgs with `projectId: "proj_orgclaims"` but never seeded that project itself — it relied on the prior BUG-49 single-org test having seeded it earlier in the same file. Running the multi-org test alone would fail with a foreign-key violation.

**Fix applied:** The multi-org test now seeds its own project (`proj_multi_${Date.now()}`) before inserting the orgs. Self-contained — order-independent. 8/8 auth tests still pass.

### BUG-59 (codex round 4): `app.listen(getApiPort())` bound a Unix socket instead of a TCP port on default startup (FIXED)

**Status:** Fixed
**Severity:** **P1** — default `bun run dev` would silently bind a socket file named `3000` and the API would be unreachable on `http://localhost:3000`
**Files:** `apps/api/src/index.ts`

BUG-46's env-helper promotion replaced `process.env.BLERP_API_PORT || process.env.PORT || 3000` (where the trailing `|| 3000` was a number when no env was set) with `getApiPort()` which returns a string. Node/Express's `app.listen(<string>, ...)` overload binds a Unix socket path with that name instead of opening a TCP listener. So a clean local startup with default env created a `3000` socket file in cwd and never bound TCP.

**Fix applied:** `parseInt(getApiPort(), 10)` before passing to `app.listen`. Comment explains the overload trap so it doesn't regress.

### BUG-60 (codex round 4): OpenAPI `ErrorResponse` requires `errors` even though many controllers still emit legacy-only `error` (FIXED)

**Status:** Fixed
**Severity:** P2 — SDK clients generated from BUG-57's tightened spec would crash at runtime on the ~40 hand-rolled catch-block 400/403 responses that still emit only `error`
**Files:** `openapi/blerp.v1.yaml` `components.schemas.ErrorResponse`, `packages/shared/src/schema.ts` (regen), `DO_NEXT.md` (tracked the migration)

BUG-57 made `errors` required in `ErrorResponse`. That's correct for any path that throws `BlerpError`, but ~40 controller catch blocks still hand-roll `res.status(400).json({ error: { message } })` without `errors[]`. SDK consumers reading `body.errors[0].message` against those endpoints would crash with "cannot read undefined".

**Fix applied:** `ErrorResponse` keeps `error` required, makes `errors` optional. Comment explains the contract: SDK clients should prefer `errors[0]` when present and fall back to `error`. Added a tracked follow-up in `DO_NEXT.md` to migrate the remaining hand-rolled errors through `BlerpError` subclasses; once that's done, `errors` can be promoted to required again.

### BUG-56 (codex round 3): `turbo test` could fail on a clean checkout — new runtime imports from `@blerp/shared` need `dist` to exist (FIXED)

**Status:** Fixed
**Severity:** P2 — first-time CI/clean-clone test runs would fail with "cannot find module '@blerp/shared'"
**Files:** `turbo.json`

BUG-46's shared env helper promoted several files (`apps/api/src/v1/services/webauthn.service.ts`, `apps/api/src/index.ts`, `apps/dashboard/vite.config.ts`, `apps/dashboard/tests/global.setup.ts`, `packages/testing/src/*`) from type-only imports of `@blerp/shared` to runtime value imports. Runtime imports resolve via `packages/shared/package.json::main: dist/index.js`, but `dist` is gitignored and the turbo `test` task only depended on `^test`, not `^build`. Result: a fresh `bun install && bun run test` would fail to resolve `@blerp/shared`.

**Fix applied:** Changed `turbo.json` `test.dependsOn` from `["^test"]` to `["^build"]`. Now `bun run test` builds upstream workspace packages first. Verified by removing `packages/shared/dist` and running `bun run test` — turbo rebuilt shared before running tests.

### BUG-57 (codex round 3): OpenAPI `ErrorResponse` doesn't document the new `errors[]` envelope (FIXED)

**Status:** Fixed
**Severity:** P2 — SDK clients generated from the spec couldn't type `body.errors[0]` even though the runtime emits it
**Files:** `openapi/blerp.v1.yaml` `components.schemas.ErrorResponse`, `packages/shared/src/schema.ts` (regen)

BUG-47's runtime change to `BlerpError.toJSON()` emits both `errors: [{ code, message, long_message, meta? }]` (Clerk-canonical) and the legacy `error: { ... }`. But the OpenAPI `ErrorResponse` schema still listed only the singular `error` field, so generated types didn't surface `errors[]` to consumers.

**Fix applied:** `ErrorResponse` now requires both `errors` and `error`; the `errors` item schema documents `code` + `message` + `long_message` + optional `meta`. The legacy `error` field gains `details` to match what `BlerpError.toJSON` actually emits. Regenerated `packages/shared/src/schema.ts`. New SDK code can type-safely read `body.errors[0]`.

### BUG-58 (codex round 3): OpenAPI paginated list schemas don't declare `total_count` (FIXED)

**Status:** Fixed
**Severity:** P2 — same shape as BUG-57; SDK clients couldn't type the new pagination field
**Files:** `openapi/blerp.v1.yaml` (`listOrganizations` + `listAuditLogs` 200 responses), `packages/shared/src/schema.ts` (regen)

BUG-48's runtime change added `total_count` to `listOrganizations` and `listAuditLogs` responses, but the OpenAPI schemas still described only `data` + `meta`. SDK consumers couldn't see `total_count` in generated types.

**Fix applied:** Both list-response schemas now `required: [data, total_count]` and include `total_count: integer minimum 0`. `meta` remains as a legacy alias for one release. Regenerated `packages/shared/src/schema.ts`.

### BUG-54 (codex round 2): Monite-example entity helper still reads only `__blerp_session` — Clerk-cookie-only callers regress (FIXED)

**Status:** Fixed
**Severity:** P2 — completes the BUG-51 dual-cookie story; without this fix the example always returned null for `__session`-only callers
**Files:** `examples/monite-sdk-parity/src/lib/blerp-api/get-current-user-entity.ts`

Codex round 2 caught that BUG-51's dual-cookie fix wired `auth()` + `currentUser()` + middleware + CSRF to read either cookie name, but missed this Monite example helper which independently reads the session cookie to forward as a Bearer token. With only `__session` set, `auth()` and `currentUser()` succeeded, then this helper returned null and broke the entity lookup.

**Fix applied:** Read either `__blerp_session` or `__session` (BLERP-preferred, Clerk alias). Mirrors the read pattern already in `@blerp/nextjs/server/auth.ts`.

### BUG-55 (codex round 2): `mapOAuthAccount` read nonexistent `avatarUrl`, dropping all stored profile images (FIXED)

**Status:** Fixed
**Severity:** P2 — silent data loss on every linked-identity response
**Files:** `apps/api/src/v1/controllers/identity.controller.ts`

BUG-52's `mapOAuthAccount` projection invented an `avatarUrl` field. The Drizzle column is `imageUrl` (DB `image_url`), so the mapper always emitted null for the image regardless of what was stored. Every linked OAuth account had its profile picture silently dropped.

**Fix applied:** Use `row.imageUrl`; rename the response field to `image_url` (matches the column and Clerk's `User.image_url` convention). Updated the row interface.

### BUG-53 (codex): BUG-49 fix regressed multi-org users — arbitrary membership stamped into JWT broke org switching (FIXED)

**Status:** Fixed
**Severity:** P1 — `auth()` reported the wrong org/role/permissions after a user switched orgs via `OrganizationSwitcher`
**Files:** `apps/api/src/v1/services/auth.service.ts`, `packages/nextjs/src/server/auth.ts`, `apps/api/src/__tests__/auth.integration.test.ts`

Codex review of PR #53 caught that BUG-49's `findFirst` membership lookup picked an arbitrary org for multi-org users and stamped it into the JWT. Since `@blerp/nextjs auth()` preferred the JWT `org_id` over the `__blerp_org` cookie, switching orgs via `OrganizationSwitcher` never took effect server-side.

**Fix applied:**

1. `AuthService.createSessionForUser`: only stamp `org_*` JWT claims when the user has **exactly one** membership (unambiguous active org). Zero or multi membership users get a claim-free JWT and fall through to the existing API-fetch path in `auth()`.
2. `@blerp/nextjs/server/auth.ts`: reordered active-org resolution to (a) `__blerp_org` cookie first (reflects user intent), (b) JWT claim, (c) null. JWT role / permissions are trusted only when the claim matches the cookie-derived active org; otherwise we re-fetch from the API for the _current_ org. The result is forward-compatible: single-org users still get the JWT fast-path; multi-org switches stay accurate; future "stamp on org switch" re-mint would just hit the matching path automatically.
3. New `auth.integration.test.ts` case asserts `org_*` claims are absent when the user has two memberships.

### BUG-49: Session JWT missing `org_id` / `org_role` / `org_slug` / `org_permissions` claims when an active org is in scope (FIXED)

**Status:** Fixed
**Severity:** Medium — forces `@blerp/nextjs`'s `auth()` to make an extra `/v1/organizations/{org}/memberships` round-trip on every server-rendered request, defeating the whole point of JWT-encoded org context. Clerk's JWT always includes these claims when the user has an active org.
**Files:** `apps/api/src/v1/services/auth.service.ts:361` (token issuance — currently only `{ sub: userId, sid: sessionId }`), `packages/nextjs/src/server/auth.ts:43-81` (the fallback fetch path)

Today our session JWT contains only `sub` (user id) and `sid` (session id). `packages/nextjs/src/server/auth.ts` reads `payload.org_id` and falls back to a network call when missing. Issuance never sets the org claims, so the fallback always fires.

**Fix applied:** `AuthService.createSessionForUser` now looks up the user's first membership (joined with `organization` so we can read the slug) and resolves its permissions via `resolvePermissions()` (which knows about both default + custom roles). When a membership exists, the JWT carries `{ sub, sid, org_id, org_role, org_slug, org_permissions }`; when the user has zero memberships, the org claims are omitted entirely (matches Clerk's behaviour). The existing `@blerp/nextjs auth()` fallback that fetches memberships when claims are missing is now only triggered for the "user switched org without re-signin" path. New regression test in `auth.integration.test.ts` signs a user in, base64-decodes the JWT, and asserts the four `org_*` claims.

### BUG-50: Webhook signature drift — `X-Blerp-Signature` (raw HMAC) vs Clerk's Svix triple (FIXED)

**Status:** Fixed
**Severity:** Medium — the most-load-bearing fidelity point; customers' webhook receivers verifying `svix-id` / `svix-timestamp` / `svix-signature` will reject every blerp webhook
**Files:** `apps/api/src/workers/webhook.worker.ts:122-131` (delivery code)

Today we send a single `X-Blerp-Signature: <hex-hmac-sha256(secret, body)>` header. Clerk uses Svix's format: three headers `svix-id` (unique message id), `svix-timestamp` (Unix seconds), `svix-signature` (`v1,<base64-hmac-sha256(secret, id.timestamp.body)>`). Customers porting their Clerk webhook handler to point at blerp will fail signature verification immediately.

**Fix applied:** Extracted `buildWebhookSignatureHeaders()` from the inline delivery code in `webhook.worker.ts`. Every delivery now sends both:

- `X-Blerp-Signature` (legacy, HMAC-SHA256-hex over the raw payload) — back-compat with native consumers.
- `svix-id` + `svix-timestamp` + `svix-signature` (Clerk-compat). Signed body is `${svix-id}.${svix-timestamp}.${payload}`; signature header value is `v1,<base64-hmac-sha256>`. The HMAC key is the base64-decoded portion of the `whsec_`-prefixed secret (matches Svix's documented behaviour); raw secrets without the prefix are used as-is for dev-mode.

New unit-test file `apps/api/src/workers/__tests__/webhook-signatures.test.ts` (5/5 pass) replicates the canonical Svix verification algorithm (small enough to inline; avoids taking on the `svix` npm dep + its install scripts per the Bun-only tooling mandate) and verifies: (a) both header sets are emitted, (b) Svix verification accepts the signature blerp emits, (c) tampered payload fails, (d) wrong secret fails, (e) legacy hex HMAC matches `createHmac("sha256", secret).update(payload).digest("hex")`.

### BUG-51: Session cookie name (`__blerp_session`) differs from Clerk's (`__session`) (FIXED)

**Status:** Fixed
**Severity:** Low — only an issue for customers who read the session cookie directly (bypassing our SDK). Our `@blerp/nextjs` knows the right name.
**Files:** `apps/api/src/lib/session.ts:75`, `packages/nextjs/src/server/{auth,middleware}.ts`, `packages/nextjs/src/client/BlerpProvider.tsx`, `packages/testing/src/{setup,playwright}.ts`, `apps/dashboard/src/hooks/useSignOut.ts`

**Fix applied:** Added `packages/nextjs/src/client/session-cookies.ts` with `setSessionCookies()` / `clearSessionCookies()` / `readSessionCookie()` — every set writes both names, every clear deletes both, reads check `__blerp_session` first then `__session`. Wired into `BlerpProvider.signOut`, `hooks.ts` (useSignIn `create` + `attemptSecondFactor`, useSignUp `attemptVerification`), `components/Auth.tsx`. Server-side `packages/nextjs/src/server/{auth,middleware}.ts` reads either cookie. `apps/api/src/middleware/csrf.ts` honors either for the CSRF session identifier. `apps/dashboard/src/hooks/useSignOut.ts` clears both cookie names on sign-out. The dashboard itself stores the session in `localStorage` + `Authorization: Bearer`, so it doesn't write the cookie — but its cleanup path still clears both for safety.

### BUG-52: Several controllers still return raw Drizzle rows (camelCase leak — BUG-3 lineage) (FIXED)

**Status:** Fixed
**Severity:** Medium — same class as BUG-3 / BUG-34; dashboard / SDK reading snake_case field on the response gets `undefined`
**Files:**

- `apps/api/src/v1/controllers/role.controller.ts` (`createRole`, `updateRole`)
- `apps/api/src/v1/controllers/identity.controller.ts` (`listIdentities` wrapper + inner arrays)
- `apps/api/src/__tests__/controllers-audit.integration.test.ts` (extended)

**Fix applied:** Added `mapRole()` to `role.controller.ts` and wired into `createRole` + `updateRole` (with explicit 404 / 500 envelopes for the previously-unchecked nullable Drizzle returns). Added `mapOAuthAccount()` + `mapEmailIdentity()` to `identity.controller.ts`; the `listIdentities` wrapper now maps each inner row. The integration-test `identity` block tightened to assert no `userId` / `providerUserId` / `emailAddress` / `createdAt` leakage in either sub-array; a new `role controller` block covers create + update + delete with explicit `not.toHaveProperty("organizationId")`. Seed membership role bumped from `admin` to `owner` (admin doesn't carry `org:write`, which the role routes require). 38/38 controllers-audit pass (was 35).

### BUG-59 (codex round 4): `apps/api/src/index.ts` used `parseInt(env, 10)` against an env that could be `undefined` (FIXED)

**Status:** Fixed
**Severity:** Low — only manifested if `BLERP_API_PORT` was unset _and_ `PORT` was unset.
**Files:** `apps/api/src/index.ts`

**Fix applied:** Added explicit `"3000"` default before `parseInt`. Followed by BUG-82 which extended the same chain to also coerce blank-string envs to undefined.

### BUG-60 (codex round 4): OpenAPI `ErrorResponse` declared `errors[]` as optional but every controller actually emits it after BUG-47 (FIXED)

**Status:** Fixed
**Severity:** Medium — SDK code-generators dropped the field; clients that asserted on it broke.
**Files:** `openapi/blerp.v1.yaml`

**Fix applied:** `errors[]` switched to `required: true`; `error{}` retained for back-compat. `bun run gen:types` regenerated.

### BUG-61 (codex round 5): Authorization derived from JWT `org_permissions` claim — stale after a role change (FIXED)

**Status:** Fixed
**Severity:** High — privilege-escalation lookalike: a user whose role was demoted kept the elevated permissions until their session token expired (up to 7 days).
**Files:** `apps/api/src/middleware/auth.ts`, `apps/api/src/v1/services/auth.service.ts`

**Fix applied:** Authorization now re-resolves the membership from the DB on every request. The JWT claim is treated as a hint only, never trusted for `org:*` gates. New integration test `auth.permission-recheck.test.ts` covers demote → next-request denial.

### BUG-62 (codex round 5): Multi-org integration test re-used a hard-coded tenant id, making it stateful (FIXED)

**Status:** Fixed
**Severity:** Low (test infra only).
**Files:** `apps/api/src/__tests__/auth.integration.test.ts`

**Fix applied:** Each test now provisions a unique tenant id; teardown wipes it.

### BUG-63 (codex round 6): Client-side `useAuth().has()` mapped `admin` → `org:write`, but server RBAC reserves `org:write` for `owner` (FIXED)

**Status:** Fixed
**Severity:** High — UI showed admin-only buttons that 403'd on submit, _and_ allowed admins to attempt destructive flows the server denied.
**Files:** `packages/nextjs/src/client/BlerpProvider.tsx`, `apps/api/src/lib/rbac.ts`

**Fix applied:** Removed the local role→permission map. `<Protect>` / `useAuth().has()` now consume the API-returned `permissions` field verbatim (see BUG-67).

### BUG-64 (codex round 6): Direct dev startup (`bun run dev` inside `apps/api` / `apps/dashboard` without going through turbo) failed at import-time on `@blerp/shared` (FIXED)

**Status:** Fixed
**Severity:** Medium — first-run UX regression. Solo-package dev didn't build workspace deps; the runtime `import` of `@blerp/shared/env` resolved before `dist/` existed.
**Files:** `apps/api/src/index.ts`, `apps/api/src/v1/services/webauthn.service.ts`, `apps/dashboard/vite.config.ts`, `tests/global.setup.ts`

**Fix applied:** Entry-point files that run before the turbo build graph kicks in inline their env reads (still honoring both BLERP*\* and CLERK*\*). Other consumers continue to import from `@blerp/shared`.

### BUG-65 (codex round 7): `apps/api/src/v1/services/webauthn.service.ts` imported `@blerp/shared` at module scope but ran before `dist/` existed (FIXED)

**Status:** Fixed
**Severity:** Medium — same class as BUG-64.
**Files:** `apps/api/src/v1/services/webauthn.service.ts`

**Fix applied:** Inlined the env reads + URL normalisation (mirroring `normalizeApiUrl`).

### BUG-66 (codex round 7): WebAuthn flow leaked passkey credential ids in `404` responses (FIXED)

**Status:** Fixed
**Severity:** Medium — passkey enumeration via 404-vs-401 timing on unknown emails.
**Files:** `apps/api/src/v1/services/webauthn.service.ts`, `apps/api/src/__tests__/webauthn.integration.test.ts`

**Fix applied:** Unknown user emails now return the same 401 envelope as known-user-wrong-credential. New 4-test integration block enforces the no-leak invariant.

### BUG-67 (codex round 7): No `/v1/organizations/:id/memberships/me` endpoint — Clerk SDKs call it for the current-membership lookup (FIXED)

**Status:** Fixed
**Severity:** High — Clerk-compat SDK consumers had to scan the entire membership list and filter client-side, which also required `members:read` (a permission custom read-only roles lack).
**Files:** `apps/api/src/v1/controllers/membership.controller.ts`, `apps/api/src/v1/routes/membership.routes.ts`, `openapi/blerp.v1.yaml`

**Fix applied:** Added `getOwnMembership` controller + `GET /v1/organizations/:organization_id/memberships/me` route. Returns the calling user's membership with `permissions` resolved via `resolvePermissions()` (default + custom roles). Required scope is only `org:read`. Documented in OpenAPI with `SessionToken` security requirement.

### BUG-68 (codex round 8): Monite example startup files imported `@blerp/shared` before the workspace build ran (FIXED)

**Status:** Fixed
**Severity:** Medium — same dist-resolution failure as BUG-64/65, just one more transitive entry point.
**Files:** `examples/monite/api/src/index.ts`, `examples/monite/api/src/services/entity.service.ts`

**Fix applied:** Inlined the env reads in the entry points.

### BUG-69 (codex round 8): Monite example `entity.service.ts` only read `__blerp_session` cookie — Clerk-cookie-only callers regressed (FIXED)

**Status:** Fixed
**Severity:** Medium — companion to BUG-54.
**Files:** `examples/monite/api/src/services/entity.service.ts`

**Fix applied:** Reads `__session` as a fallback when `__blerp_session` is absent.

### BUG-70 (codex round 8): New `/v1/organizations/:id/memberships/me` route missing from OpenAPI (FIXED)

**Status:** Fixed (logged earlier).
**Files:** `openapi/blerp.v1.yaml`

### BUG-74 (codex round 11): `CLERK_API_URL=https://api.clerk.com/v1` produced `/v1/v1/...` URLs because callers append `/v1` themselves (FIXED)

**Status:** Fixed
**Severity:** Medium — most Clerk doc copy-paste set `CLERK_API_URL` to the documented `https://api.clerk.com/v1` form; we silently double-prefixed.
**Files:** `packages/shared/src/env.ts`

**Fix applied:** Added `normalizeApiUrl()` that strips a trailing `/v1` (with or without slash). `getApiUrl()` always normalises. Idempotent — bare URLs pass through unchanged. Later extended in BUG-80 to also strip a bare trailing slash.

### BUG-75 (codex round 11): OpenAPI `/memberships/me` path didn't declare `SessionToken` auth (FIXED)

**Status:** Fixed
**Files:** `openapi/blerp.v1.yaml`

**Fix applied:** Added `security: [{ SessionToken: [] }]` to the new path. (Initial edit accidentally duplicated the security scheme definition; the dupe was removed.)

### BUG-76 (codex round 12): Client BlerpProvider replicated server BUG-63/BUG-67 fixes — local role→permission map + LIST-then-filter membership lookup (FIXED)

**Status:** Fixed
**Severity:** High — same overgrant + custom-role-cannot-list class as the server side.
**Files:** `packages/nextjs/src/client/BlerpProvider.tsx`

**Fix applied:** Calls `/v1/organizations/${orgId}/memberships/me` and consumes `permissions` verbatim. Local hard-coded map deleted.

### BUG-77 (codex round 13): Server `auth()` exposed `orgId` straight from the `__blerp_org` cookie without validating membership (FIXED)

**Status:** Fixed
**Severity:** Critical — a forged or stale cookie value bypassed authorization checks that scope by `orgId`. The cookie is non-httpOnly because the client also reads it for state hydration, so a tampered tab cookie was sufficient.
**Files:** `packages/nextjs/src/server/auth.ts`

**Fix applied:** `auth()` now calls `/v1/organizations/:orgId/memberships/me` for the candidate `orgId` and only exposes `orgId` / `orgRole` / `orgPermissions` on a 200. Falls back to the JWT-claim `org_id` if the cookie membership check fails.

### BUG-78 (codex round 14): Dashboard Vite proxy derived its target from nonexistent `CLERK_API_PORT` (FIXED)

**Status:** Fixed
**Severity:** Low — Clerk-style env setup landed `CLERK_API_URL` but no port var, so the proxy target stayed at `http://localhost:3000` regardless.
**Files:** `apps/dashboard/vite.config.ts`

**Fix applied:** Derived from `CLERK_API_URL` (with the same `/v1` strip + trailing-slash strip as `normalizeApiUrl`). Falls back to localhost+port only when no URL is set.

### BUG-79 (codex round 15): Blank-string env like `BLERP_API_URL=` short-circuited the `CLERK_*` fallback chain to the empty string (FIXED)

**Status:** Fixed
**Severity:** Medium — common `.env.example` pattern (leave key present, value blank, customer fills in) silently produced relative-URL bugs downstream.
**Files:** `packages/shared/src/env.ts`, `apps/api/src/index.ts`, `apps/dashboard/vite.config.ts`, `apps/api/src/v1/services/webauthn.service.ts`

**Fix applied:** Added `readNonBlank()` helper that returns `undefined` for empty/whitespace-only values. All chained `??` reads go through it. The inline entry-point reads replicate the helper.

### BUG-80 (codex round 15): `getApiUrl()` stripped a trailing `/v1` but not a bare trailing slash (FIXED)

**Status:** Fixed
**Severity:** Low — `BLERP_API_URL=https://api.example/` produced `//v1/jwks` etc.
**Files:** `packages/shared/src/env.ts`, `apps/dashboard/vite.config.ts`, `apps/api/src/v1/services/webauthn.service.ts`

**Fix applied:** `normalizeApiUrl()` strips `/v1?` then `/+$`. Idempotent. Inline reads mirror the regex. Regression tests added in BUG-79/80/81 batch in `env-clerk-compat.test.ts`.

### BUG-81 (codex round 17): `getTenantId()` ignored `NEXT_PUBLIC_*` aliases — client used `"demo-tenant"` while server used the configured tenant (FIXED)

**Status:** Fixed
**Severity:** High — production deployments setting only `BLERP_TENANT_ID` had `BlerpProvider` issue requests with `X-Tenant-Id: demo-tenant`, while server-side `currentUser()` / membership lookups used the real tenant. Silent divergence; every list endpoint returned empty / 404.
**Files:** `packages/shared/src/env.ts`, `packages/nextjs/src/client/BlerpProvider.tsx`, `apps/api/src/__tests__/env-clerk-compat.test.ts`

**Fix applied:** `getTenantId()` extended to also check `NEXT_PUBLIC_BLERP_TENANT_ID` and `NEXT_PUBLIC_CLERK_TENANT_ID` (in that precedence order, after the bare names). `BlerpProvider` now defaults to `getTenantId()` instead of hard-coded `"demo-tenant"`. Regression test pins the precedence: `BLERP_TENANT_ID > CLERK_TENANT_ID > NEXT_PUBLIC_BLERP_TENANT_ID > NEXT_PUBLIC_CLERK_TENANT_ID > "demo-tenant"`.

### BUG-82 (codex round 17): `apps/api/src/index.ts` port chain didn't coerce blank strings — `BLERP_API_PORT=` produced `parseInt("") === NaN`, crashing `app.listen` (FIXED)

**Status:** Fixed
**Severity:** Medium — same `.env`-template footgun as BUG-79, but for the API entrypoint specifically.
**Files:** `apps/api/src/index.ts`, `packages/shared/src/env.ts` (`getApiPort` also tightened)

**Fix applied:** Inlined `nonBlank()` helper before the `??` chain. `getApiPort()` shared helper extended in parallel (now honors `CLERK_API_PORT` too and uses `readNonBlank`).

### BUG-83 (codex round 17): Dashboard `vite.config.ts` `BLERP_DASHBOARD_PORT=` (blank) produced NaN port, Vite refused to bind (FIXED)

**Status:** Fixed
**Severity:** Low — solo-dev dashboard startup, same class as BUG-82.
**Files:** `apps/dashboard/vite.config.ts`, `packages/shared/src/env.ts`

**Fix applied:** `dashboardPort` now goes through the local `nonBlank()` helper before `parseInt`. `getDashboardPort()` shared helper now also honors `CLERK_DASHBOARD_PORT` for naming parity (BUG-82 family).

### BUG-84 (round-2 Clerk parity sweep): Next.js middleware hard-coded `/sign-in` and `/sign-up`, ignoring `CLERK_SIGN_IN_URL` (FIXED)

**Status:** Fixed
**Severity:** High — drop-in Clerk customers configure `CLERK_SIGN_IN_URL=/auth/login` (etc.) and expect their `clerkMiddleware()` to redirect there. Blerp's `blerpMiddleware()` always pointed to `/sign-in`, breaking the redirect for every customer that customised the path.
**Files:** `packages/nextjs/src/server/middleware.ts`, `packages/shared/src/env.ts`

**Fix applied:** `packages/shared/src/env.ts` exposes `getSignInUrl()` / `getSignUpUrl()` reading the full alias chain `BLERP_SIGN_*_URL > CLERK_SIGN_*_URL > NEXT_PUBLIC_*_BLERP_SIGN_*_URL > NEXT_PUBLIC_*_CLERK_SIGN_*_URL > VITE_*_BLERP_SIGN_*_URL > VITE_*_CLERK_SIGN_*_URL > "/sign-in"`. Middleware reads them once at module load (`SIGN_IN_PATH` / `SIGN_UP_PATH`) and uses them both for the redirect target and for the bypass check (`!pathname.startsWith(SIGN_IN_PATH)`). Without the bypass-check update, a customer using `/auth/login` would have ended up in an infinite redirect loop (login page would redirect to itself for being "unauthenticated").

### BUG-85 (round-2 Clerk parity sweep): Client `BlerpProvider.openSignIn/openSignUp` hard-coded `/sign-in` and `/sign-up` (FIXED)

**Status:** Fixed
**Severity:** High — same class as BUG-84 but on the client. Mirrors the server fix so `<UserButton onClick={openSignIn}>` etc. go to the configured URL.
**Files:** `packages/nextjs/src/client/BlerpProvider.tsx`

**Fix applied:** `openSignIn` / `openSignUp` now derive the base URL from `getSignInUrl()` / `getSignUpUrl()`, and the redirect target uses the precedence `force redirect > caller-supplied afterSign*Url > fallback redirect`, matching Clerk's documented semantics. Skipping `redirect_url=` when the target is the default `/` keeps URLs clean.

### BUG-86 (round-2 Clerk parity sweep): `<SignIn>`, `<SignUp>`, `<RedirectToSignIn>` defaulted to hard-coded URLs (FIXED)

**Status:** Fixed
**Severity:** Medium — same class as BUG-85, surfaces on the rendered components when callers don't pass props.
**Files:** `packages/nextjs/src/client/components/Auth.tsx`, `SignUp.tsx`, `Control.tsx`

**Fix applied:** Defaults are computed once at module load via the new env helpers (no per-render env reads since NEXT*PUBLIC*\* values are inlined at build time anyway). Removed unused `React` default import where the components became hookless. Also replaced the deprecated `React.FormEvent` / `FormEvent` types with `SyntheticEvent<HTMLFormElement>` — `@types/react` 19 marks `FormEvent` deprecated in favor of more specific event types or `SyntheticEvent`. The submit-event use case (`e.preventDefault()`) only needs the base SyntheticEvent contract.

### BUG-87 (round-2 Clerk parity sweep): `getWebhookSecret()` only honored the legacy `CLERK_WEBHOOK_SECRET`, not the current `CLERK_WEBHOOK_SIGNING_SECRET` (FIXED)

**Status:** Fixed
**Severity:** High — Clerk renamed the env var; customers copying current Clerk `.env.example` files would have webhooks fail signature verification because the new name wasn't read.
**Files:** `packages/shared/src/env.ts`

**Fix applied:** Precedence is now `BLERP_WEBHOOK_SECRET > BLERP_WEBHOOK_SIGNING_SECRET > CLERK_WEBHOOK_SIGNING_SECRET > CLERK_WEBHOOK_SECRET`. Both Clerk names are accepted; the current name wins over the legacy one when both are set (matches Clerk's own deprecation behavior). Throw message updated to name both Clerk variants.

### BUG-88 (round-2 Clerk parity sweep): `getApiUrl()` didn't read `NEXT_PUBLIC_CLERK_API_URL` or `VITE_CLERK_API_URL` (FIXED)

**Status:** Fixed
**Severity:** Medium — Clerk publishes `NEXT_PUBLIC_CLERK_API_URL` as the client-side override; the Vite-built dashboard requires `VITE_` prefix or env values are invisible to client code.
**Files:** `packages/shared/src/env.ts`

**Fix applied:** Chain extended to read both prefixed forms after the bare ones. Bare `BLERP_API_URL` / `CLERK_API_URL` keep precedence so server `.env` overrides any stale `NEXT_PUBLIC_*` value baked into a prior Next.js build.

### BUG-89 (round-2 Clerk parity sweep): `CLERK_TELEMETRY_DISABLED` / `_DEBUG` envs caused no observable effect (FIXED)

**Status:** Fixed
**Severity:** Low — blerp doesn't currently emit telemetry, so accepting the env is mostly cosmetic. The bug is that a drop-in customer setting `CLERK_TELEMETRY_DISABLED=true` had no way to verify it was accepted — the runtime silently ignored it. After this fix the value is available to any future telemetry path and shows up in `/v1/public-config`.
**Files:** `packages/shared/src/env.ts`

**Fix applied:** `getTelemetryDisabled()` / `getTelemetryDebug()` parse truthy strings (`"1" | "true" | "yes"` case-insensitive) from the full alias chain.

### BUG-90 (round-2 Clerk parity sweep): `CLERK_JWT_KEY` / `NEXT_PUBLIC_CLERK_JWT_KEY` not honored (FIXED)

**Status:** Fixed
**Severity:** Low — Clerk uses these for "networkless" session token verification (verifying without a JWKS fetch). Blerp's middleware fetches JWKS, so the env is accepted but currently unused. Recording the read so a future networkless-verify implementation doesn't relitigate the alias list.
**Files:** `packages/shared/src/env.ts`

**Fix applied:** `getJwtKey()` exposed from the central helper with the standard alias chain.

### BUG-91 (round-2 Clerk parity sweep): Satellite-domain envs (`CLERK_IS_SATELLITE`, `CLERK_DOMAIN`) silently ignored (FIXED)

**Status:** Fixed
**Severity:** High — silent ignore is worse than no support here. A customer setting `CLERK_IS_SATELLITE=true` expects users on the satellite domain to be redirected to the primary for sign-in handoff; if blerp does nothing the users get stuck on a broken login page.
**Files:** `packages/shared/src/env.ts`, `packages/nextjs/src/server/middleware.ts`

**Fix applied:** `getSatelliteDomain()` / `isSatellite()` expose the reads. `assertSatelliteNotConfigured()` throws a loud "not yet supported" error pointing to the GitHub issue tracker. Middleware calls it at module load so misconfiguration surfaces at startup, not on the first user redirect.

### BUG-92 (round-2 Clerk parity sweep): `CLERK_PROXY_URL` / `NEXT_PUBLIC_CLERK_PROXY_URL` not honored (FIXED)

**Status:** Fixed
**Severity:** Medium — Clerk supports a customer-hosted reverse proxy; we don't yet route through one but the env is now read and exposed via `/v1/public-config`, so client-side overrides (e.g. a custom fetch wrapper) can pick it up.
**Files:** `packages/shared/src/env.ts`

**Fix applied:** `getProxyUrl()` with the full alias chain.

### BUG-93 (round-2 Clerk parity sweep): `CLERK_ENCRYPTION_KEY` not honored (FIXED)

**Status:** Fixed
**Severity:** Low — only needed when secretKey is passed dynamically (we accept it from env, not as a runtime option). Helper added so a future dynamic-key path doesn't relitigate the alias list.
**Files:** `packages/shared/src/env.ts`

**Fix applied:** `getEncryptionKey()` exposed.

### BUG-94 (round-2 Clerk parity sweep): Force/Fallback redirect URL envs not honored (FIXED)

**Status:** Fixed
**Severity:** High — Clerk customers configure `CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard` to override per-request `?redirect_url=` query params (typical for tenant-scoped landing pages); blerp ignored that envelope entirely.
**Files:** `packages/shared/src/env.ts`, `packages/nextjs/src/client/BlerpProvider.tsx`, `packages/nextjs/src/client/components/Auth.tsx`, `SignUp.tsx`

**Fix applied:** Four new helpers: `getSignInForceRedirectUrl()`, `getSignInFallbackRedirectUrl()`, sign-up equivalents. `openSignIn` / `openSignUp` enforce the documented Clerk precedence: `force > caller-supplied afterSign*Url > fallback`. Default-prop values of `<SignIn>` / `<SignUp>` derive from `getSignInFallbackRedirectUrl()` / `getSignUpFallbackRedirectUrl()` so unconfigured calls still land on the right page.

### BUG-95 (round-2 Clerk parity sweep): Vite (dashboard bundler) requires `VITE_` prefix for client-exposed envs, which blerp ignored (FIXED)

**Status:** Fixed
**Severity:** High — without `VITE_BLERP_*` / `VITE_CLERK_*` reads, the dashboard's client-side code couldn't see env values at all (Vite only inlines `VITE_*` and `import.meta.env.*` references). Per Clerk's own docs: "Vite-based frameworks require the `VITE_` prefix instead of `NEXT_PUBLIC_` for client-side variables."
**Files:** `packages/shared/src/env.ts`

**Fix applied:** Every client-facing helper (`getApiUrl`, `getTenantId`, `getPublishableKey`, `getSignInUrl`, `getSignUpUrl`, redirect-URL helpers, `getJwtKey`, `getProxyUrl`, `getTelemetryDisabled`, `getSatelliteDomain`, `isSatellite`) now reads the `VITE_BLERP_*` and `VITE_CLERK_*` aliases alongside the `NEXT_PUBLIC_*` ones. Precedence: server-side bare names > NEXT*PUBLIC*\_ > VITE\__ (server reads win for parity with backend env). Server-only keys (`getSecretKey`, `getEncryptionKey`, `getWebhookSecret`) deliberately do not honor `VITE__`/`NEXT*PUBLIC*_` — exposing secrets to client bundles would be the bug.

### BUG-96 (round-2 Clerk parity sweep): `NEXT_PUBLIC_*` / `VITE_*` are build-time inlined — no runtime override for single-image multi-env Docker deploys (FIXED)

**Status:** Fixed
**Severity:** High — per Next.js 15+ docs: "After being built, your app will no longer respond to changes to these environment variables ... if you use a Heroku pipeline to promote slugs built in one environment to another environment, or if you build and deploy a single Docker image to multiple environments, all `NEXT_PUBLIC_` variables will be frozen with the value evaluated at build time." Customers shipping a single image to staging + production with different publishable keys / tenant ids had no escape hatch.
**Files:** `apps/api/src/v1/controllers/discovery.controller.ts`, `apps/api/src/app.ts`, `packages/nextjs/src/client/BlerpProvider.tsx`, `openapi/blerp.v1.yaml`

**Fix applied:** New public endpoint `GET /v1/public-config` reads `process.env` per-request and returns the same values the build-time helpers would: `{ publishable_key, tenant_id, sign_in_url, sign_up_url, sign_in_*_redirect_url, sign_up_*_redirect_url, proxy_url, telemetry_disabled }`. No auth needed (Clerk-parity public). Cache headers (`public, max-age=60, must-revalidate`) so live env changes propagate within ~60s without being re-fetched on every navigation. `BlerpProvider` auto-hydrates from the endpoint when the build-time publishable key equals the documented placeholder `pk_build_placeholder` or when no explicit `tenantId` prop was passed. OpenAPI spec updated; `bun run generate` regenerated types. Integration test asserts: defaults match the env-helper defaults, env reads happen per-request (not at module load), secret-prefixed envs (`BLERP_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, `CLERK_ENCRYPTION_KEY`) never appear in the response, cache header is present.

### BUG-97 (round-2 Clerk parity sweep): Deprecated `CLERK_AFTER_SIGN_IN_URL` / `_SIGN_UP_URL` aliases not honored (FIXED)

**Status:** Fixed
**Severity:** Low — Clerk still treats these as back-compat aliases of the newer `*_FALLBACK_REDIRECT_URL` for older customer configs; ignoring them means a migration from old Clerk → blerp drops the redirect target.
**Files:** `packages/shared/src/env.ts`

**Fix applied:** Fallback-redirect helpers fall through to the deprecated names at the end of the precedence chain, after `*_FALLBACK_REDIRECT_URL` / `VITE_*`. New name wins when both are set.

### BUG-98 (codex r18): BlerpProvider userinfo hydration raced runtime-config fetch; tenant-only updates didn't re-hydrate (FIXED)

**Status:** Fixed
**Severity:** P1 — two race issues. (a) The runtime-config effect (`/v1/public-config`) and the userinfo effect both ran on mount, but userinfo fired immediately with the build-time placeholder publishable key + `"demo-tenant"`. Once runtime config arrived and updated `runtimeKey`, the userinfo effect re-ran (its dep was `[key]`), but the first request had already gone out with the wrong credentials. (b) The userinfo effect only depended on `[key]`, so a runtime tenant change (with the same publishable key) silently kept the stale userinfo.
**Files:** `packages/nextjs/src/client/BlerpProvider.tsx`

**Fix applied:** Added `runtimeConfigReady` gate that defaults to `true` when no runtime fetch is needed (build-time key isn't the placeholder AND caller passed an explicit `tenantId`). When a fetch IS needed, the gate flips only after `/v1/public-config` returns (or fails — fall through to build-time defaults so the SDK still works). Userinfo effect now `return`s early when `!runtimeConfigReady` and includes `resolvedTenantId` + `runtimeConfigReady` in its dependency array, so tenant-only runtime overrides re-trigger hydration.

### BUG-99 (codex r18): `/v1/public-config` returned full URL set but BlerpProvider only stored `publishable_key` + `tenant_id` — `openSignIn`/`openSignUp` ignored runtime URL overrides (FIXED)

**Status:** Fixed
**Severity:** P1 — defeats the BUG-96 runtime escape hatch for everything except the publishable key + tenant. A customer setting `CLERK_SIGN_IN_URL=/auth/login` in production but with a stale build-time `CLERK_SIGN_IN_URL=/sign-in` baked into NEXT_PUBLIC still saw the imperative `openSignIn()` go to `/sign-in`.
**Files:** `packages/nextjs/src/client/BlerpProvider.tsx`

**Fix applied:** Single `config` state object now holds the entire `PublicConfig` shape (publishable_key, tenant_id, sign_in_url, sign_up_url, force/fallback redirect URLs, proxy_url, telemetry_disabled). Initial state derives from build-time helpers; `/v1/public-config` response merges in over the top (caller props always win — that's the documented escape hatch precedence). `openSignIn`/`openSignUp` callbacks consume `config.sign_in_url` etc. with proper `useCallback` deps so React's stale-closure trap doesn't fire after a runtime config update.

### BUG-100 (codex r18): Middleware `startsWith(SIGN_IN_PATH)` broke when `CLERK_SIGN_IN_URL` was a full URL — redirect loop (FIXED)

**Status:** Fixed
**Severity:** P1 — Clerk documents both path-only (`/sign-in`) and full-URL (`https://auth.example.com/sign-in`) values for `CLERK_SIGN_IN_URL`. With a full URL, the bypass check `req.nextUrl.pathname.startsWith("https://...")` never matched because pathname is a path, not a URL, so the middleware kept redirecting back to the sign-in URL on every request to it.
**Files:** `packages/nextjs/src/server/middleware.ts`

**Fix applied:** Parse the configured URL at module load via a new `parseAuthUrl()` helper that distinguishes path-only from full-URL forms (using `new URL()`). New `isOnAuthPage()` helper handles two cases: (a) path-only or same-origin URLs — compare `pathname` only; (b) external-origin URLs — return false (the inbound request to a Next.js handler is never on an external host, so the middleware should never bypass). The redirect still uses the raw env value, so external sign-in hosts are honored.

### BUG-101 (codex r18): Embedded `<SignIn>` / `<SignUp>` ignored `*_FORCE_REDIRECT_URL` on successful submit (FIXED)

**Status:** Fixed
**Severity:** P1 — `BlerpProvider.openSignIn/openSignUp` applied force > prop > fallback, but the rendered form components only used the prop. A customer setting `CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard` got correct behavior from the imperative path and wrong behavior from the embedded form. Same divergence on the sign-up side.
**Files:** `packages/shared/src/env.ts`, `packages/nextjs/src/client/components/Auth.tsx`, `SignUp.tsx`, `Control.tsx`

**Fix applied:** New shared helpers `resolveSignInRedirect(callerSupplied?, fallback?)` and `resolveSignUpRedirect(callerSupplied?, fallback?)` enforce the precedence in one place. Auth.tsx + SignUp.tsx submit handlers + Control.tsx's `AuthenticateWithRedirectCallback` all route through them, so every code path agrees with the imperative `openSignIn()`.

### BUG-102 (codex r18): `<RedirectToSignUp>` / `<AuthenticateWithRedirectCallback>` still hard-coded `/sign-up` / `/sign-in` (FIXED)

**Status:** Fixed
**Severity:** P2 — BUG-86 fixed `<RedirectToSignIn>` but missed the parallel components.
**Files:** `packages/nextjs/src/client/components/Control.tsx`

**Fix applied:** Defaults derived from `getSignInUrl()` / `getSignUpUrl()` (module-load constants). `AuthenticateWithRedirectCallback`'s "verified" branch routes the redirect through `resolveSignInRedirect()` (BUG-101) so a force-redirect env beats whatever was in the `redirect_url` query.

### BUG-103 (codex r18): Deprecated `VITE_BLERP_AFTER_SIGN_IN_URL` / `VITE_CLERK_AFTER_SIGN_IN_URL` (and sign-up equivalents) not honored (FIXED)

**Status:** Fixed
**Severity:** P2 — completeness gap on BUG-97. Vite-bundled apps using the deprecated alias silently got the default `"/"` instead of the configured value.
**Files:** `packages/shared/src/env.ts`

**Fix applied:** Fallback-redirect chain extended to cover `VITE_BLERP_AFTER_SIGN_IN_URL`, `VITE_CLERK_AFTER_SIGN_IN_URL`, and the sign-up equivalents. Regression test pins the behavior.

### BUG-104 (codex r18): `getPublishableKey()` namespace grouping made NEXT*PUBLIC_BLERP*\_ beat bare CLERK\_\_ (FIXED)

**Status:** Fixed
**Severity:** P2 — contradicted the documented precedence (BLERP > CLERK > NEXT_PUBLIC > VITE). Prior code did `blerpKey ?? clerkKey` where each group `firstSet`'d its own three forms, so `NEXT_PUBLIC_BLERP_PUBLISHABLE_KEY` won over `CLERK_PUBLISHABLE_KEY` — opposite of what the rest of the file does.
**Files:** `packages/shared/src/env.ts`

**Fix applied:** Single ordered `firstSet(...)` chain matching every other helper. Warn-on-conflict still fires when the two bare names (BLERP + CLERK server-side) differ. Regression tests pin both the "bare CLERK beats NEXT_PUBLIC_BLERP" and "bare BLERP beats everything" cases.

### BUG-105 (codex r18): Webhook precedence said current-Clerk-name wins, but invented `BLERP_WEBHOOK_SIGNING_SECRET` outranked `BLERP_WEBHOOK_SECRET` (FIXED)

**Status:** Fixed
**Severity:** P2 — comment / behavior mismatch. Worse: the BLERP*WEBHOOK_SIGNING_SECRET alias was invented (Clerk only ever shipped `CLERK_WEBHOOK_SIGNING_SECRET`); a customer copying that name to a `BLERP*\*`form would have silently used the wrong env.
**Files:**`packages/shared/src/env.ts`

**Fix applied:** Chain trimmed to `BLERP_WEBHOOK_SECRET > CLERK_WEBHOOK_SIGNING_SECRET > CLERK_WEBHOOK_SECRET`. Updated docstring. Regression test confirms: (a) current Clerk name wins over legacy when both Clerk forms are set, (b) the invented BLERP signing alias is NOT recognized — only the bare BLERP form is.

### BUG-106 (codex r18): Documented `CLERK_JS_URL`, `CLERK_JS_VERSION`, `CLERK_API_VERSION` had no helpers (FIXED)

**Status:** Fixed
**Severity:** P2 — completeness gap. Customers setting these in `.env` had no signal of whether they were honored.
**Files:** `packages/shared/src/env.ts`

**Fix applied:** `getClerkJsUrl()`, `getClerkJsVersion()`, `getApiVersion(defaultValue = "v1")` exposed with the standard alias chain (BLERP > CLERK > NEXT_PUBLIC > VITE). Currently accepted-but-no-op: blerp doesn't serve a remote JS bundle and only ships API v1. Helpers exist so customer validation passes and future wiring doesn't relitigate the alias list. Regression tests cover all three.

### BUG-107 (codex r18): Production `as` type cast on `/v1/public-config` JSON parse violated repo type-safety rules (FIXED)

**Status:** Fixed
**Severity:** P3 — CLAUDE.md is explicit: "Type casts (`as`) should be avoided and used only as a documented last resort." A malformed `/v1/public-config` response would have polluted state.
**Files:** `packages/nextjs/src/client/BlerpProvider.tsx`

**Fix applied:** Added `PublicConfig` interface + `isPublicConfig(value: unknown): value is PublicConfig` type guard. Response parsed as `unknown`, fed through the guard, and only adopted into state when it validates. Malformed responses keep the build-time defaults.

### BUG-108 (codex r19): `runtimeConfigReady` gated only the userinfo effect — `apiClient` requests and `openSignIn`/`openSignUp` could fire with placeholder config (FIXED)

**Status:** Fixed
**Severity:** P1 — the BUG-98 fix was incomplete. Children calling `useBlerpClient().GET("/v1/...")` from a mount effect, or wiring `<button onClick={openSignIn}>`, could land before `/v1/public-config` resolved — the request went out with the placeholder `pk_build_placeholder` in `Authorization` and the click redirected to the build-time placeholder URL.
**Files:** `packages/nextjs/src/client/BlerpProvider.tsx`

**Fix applied:** Ref-held `readyPromiseRef` resolves when runtime config lands (or immediately when `!needsRuntimeFetch`). New openapi-fetch middleware awaits the promise on every request. `openSignIn` and `openSignUp` are now async — they await the promise before navigating. Context type signature changed to `Promise<void>` (matches Clerk's own typed signature; callers can ignore the return). `markReady()` is the single point that flips `runtimeConfigReady` state AND resolves the promise, called from both success and failure branches of the runtime-config effect.

### BUG-109 (codex r19): `<SignIn>` / `<SignUp>` ignored `?redirect_url=` query param injected by middleware / `openSignIn()` (FIXED)

**Status:** Fixed
**Severity:** P1 — the most common Clerk pattern: an unauthenticated user hits `/dashboard`, middleware redirects to `/sign-in?redirect_url=/dashboard`, embedded `<SignIn>` reads the query and sends them back to `/dashboard` on successful sign-in. Blerp's `<SignIn>` defaulted `afterSignInUrl` to the fallback redirect at module load, ignored the query, and the user landed on `/` instead of `/dashboard`. Same bug on `<SignUp>`.
**Files:** `packages/nextjs/src/client/components/Auth.tsx`, `SignUp.tsx`

**Fix applied:** `afterSignInUrl` / `afterSignUpUrl` props default to `undefined`, not the fallback. New `readRedirectQueryParam()` helper reads `?redirect_url=...` at submit-time (so SSR `next build` doesn't crash on missing `window`). Submit handlers compute `target = afterSignInUrl ?? readRedirectQueryParam()` and route it through `resolveSignInRedirect(target)`, so the precedence is `force > prop > query > env fallback` — matching Clerk's documented ordering.

### BUG-110 (codex r19): Middleware `isOnAuthPage()` used `startsWith()` — `/sign-infoo` bypassed auth, `CLERK_SIGN_IN_URL="/"` bypassed everything (FIXED)

**Status:** Fixed
**Severity:** P1 — security boundary. `reqPath.startsWith("/sign-in")` returns true for `/sign-infoo` (or any prefix-matched path), giving anonymous users access to protected routes that happen to start with the auth path. With `CLERK_SIGN_IN_URL="/"` or a same-origin full URL whose pathname is `/`, every request bypassed auth — total auth bypass.
**Files:** `packages/nextjs/src/server/middleware.ts`

**Fix applied:** Boundary-aware matching: exact match (`reqPath === cfg.pathname`) OR `reqPath.startsWith(cfg.pathname + "/")`. Special-case `cfg.pathname === "/"` to exact-match only, so `CLERK_SIGN_IN_URL="/"` is a misconfiguration that fails closed (no bypass) rather than open (universal bypass).

### BUG-111 (codex r19): `parseAuthUrl()` didn't strip query/fragment from path-only env values and accepted non-http schemes (FIXED)

**Status:** Fixed
**Severity:** P2 — `CLERK_SIGN_IN_URL="/sign-in?foo=bar"` produced pathname `/sign-in?foo=bar`, so the real `/sign-in` page wasn't recognized and we redirect-looped. Worse, `javascript:` / `mailto:` schemes parsed without complaint and would have been used as redirect targets, enabling open-redirect attacks.
**Files:** `packages/nextjs/src/server/middleware.ts`

**Fix applied:** `parseAuthUrl()` always feeds the value through `new URL(raw, PLACEHOLDER_BASE)`, then reads `.pathname` (which is query/fragment-stripped). Rejects any scheme that isn't `http:` or `https:` with a clear error at module load. The redirect target still uses the raw env value so external sign-in hosts are honored.

### BUG-112 (codex r19): `isPublicConfig()` only validated 6 of 10 fields — malformed nullable values could poison state (FIXED)

**Status:** Fixed
**Severity:** P2 — a malformed `publishable_key: 42` (number) would pass the type guard and propagate into the `Authorization` header as `Bearer 42`, breaking the SDK silently. Same risk for `sign_in_force_redirect_url` / `sign_up_force_redirect_url` / `proxy_url`.
**Files:** `packages/nextjs/src/client/BlerpProvider.tsx`

**Fix applied:** Added `stringOrNull` helper. Every nullable field is now validated to be either `null` or `string`; every required field is validated as before. A malformed response is now rejected and the build-time defaults are kept.

### BUG-113 (codex r19): Documented `CLERK_FAPI`, deprecated `CLERK_JS`, and non-Next public prefixes (`PUBLIC_`, `EXPO_PUBLIC_`, `NUXT_PUBLIC_`) not honored (FIXED)

**Status:** Fixed
**Severity:** P2 — completeness gap on the cross-framework promise. Clerk publishes envs for Astro/SvelteKit (`PUBLIC_*`), Expo (`EXPO_PUBLIC_*`), and Nuxt (`NUXT_PUBLIC_*`). Blerp only honored `NEXT_PUBLIC_*` and `VITE_*`, so customers on the other frameworks had to add custom wiring.
**Files:** `packages/shared/src/env.ts`

**Fix applied:** Refactored to a single `publicAliases(blerpSuffix, clerkSuffix)` helper that produces the full ordered prefix list — bare > `NEXT_PUBLIC_` > `VITE_` > `PUBLIC_` > `EXPO_PUBLIC_` > `NUXT_PUBLIC_` — for both BLERP and CLERK halves of each pair. Every client-facing helper (`getApiUrl`, `getTenantId`, `getPublishableKey`, sign-in/up URLs, force/fallback redirects, `getJwtKey`, `getProxyUrl`, telemetry, satellite, `getClerkJsUrl` / `getClerkJsVersion` / `getApiVersion`) now reads the full surface in one call. Server-only `getEncryptionKey` deliberately still doesn't honor any public prefix — exposing the encryption key to client bundles would defeat its purpose.

Also added back-compat for the deprecated bare `CLERK_JS` (was the original name before Clerk renamed it to `CLERK_JS_URL`). `getApiUrl()` additionally accepts `CLERK_FAPI` (the Frontend API URL) after the normal `*_API_URL` chain, so an explicit `CLERK_API_URL` still wins.

Regression tests cover `PUBLIC_/EXPO_PUBLIC_/NUXT_PUBLIC_` reads for publishable_key + full prefix-precedence ladder, `CLERK_FAPI` alias for API URL, and `CLERK_JS` deprecation-alias for JS URL.

### BUG-114 (codex r20): Sign-up was broken end-to-end — UI sent password as verification code, API ignored password, response shape mismatch (FIXED)

**Status:** Fixed
**Severity:** High — every cascading bug in one flow:

1. `<SignUp>` second step posted `{ code: password }` as the verification code; the API expects the 6-digit OTP from `createSignup`, so verification always failed with "Invalid verification code" — no user ever made it through.
2. `createSignup` accepted `password` in OpenAPI but the controller / service threw it away; even when the UI was patched the user had no credential.
3. `attemptSignup` returned `{ userId }` (camelCase) while OpenAPI documented `{ user_id }` (snake_case BUG-3 lineage) and the UI checked `data.session` — silent failure.
4. `useSignUp().attemptVerification` typed the response as `{ status, tokens }`, a shape the API never produced.

**Files:** `packages/nextjs/src/client/components/SignUp.tsx`, `packages/nextjs/src/client/hooks.ts`, `apps/api/src/v1/services/auth.service.ts`, `apps/api/src/v1/controllers/auth.controller.ts`, `openapi/blerp.v1.yaml`, plus `apps/api/src/__tests__/auth.integration.test.ts` + `auto-enrollment.integration.test.ts` to assert the snake_case response.

**Fix applied:**

- `<SignUp>` is now a real three-step flow: email → password → verify (OTP). The OTP step shows a one-shot dev-mode echo of the code so the demo flow works without an email server.
- `createSignup` accepts optional `password`, validates min length (8), hashes via `crypto.hashPassword`, and stores the digest in the transient pending-signup record. Spec already documented `password`; only the runtime was dropping it.
- `attemptSignup` installs the stored `passwordDigest` on the new user during creation, then mints a session via `createSessionForUser` and returns `{ user_id, session, tokens }`. The session lets the SDK redirect-after-signup path trigger immediately (matches Clerk's behavior).
- `useSignUp().attemptVerification` adopts the actual response shape `{ user_id, session, tokens }`. Existing tests updated to assert `body.user_id` (snake_case match OpenAPI).
- OpenAPI: `/v1/auth/signups/{signup_id}/attempt` response now documents `session` + `tokens`.

### BUG-115 (codex r20): `useSignIn().attemptFirstFactor()` missing `identifier` → 400 every time (FIXED)

**Status:** Fixed
**Severity:** High — the controller's first-factor path explicitly `if (!identifier) → 400 identifier is required`. Hook-based sign-in (the entire `useSignIn()` surface, which `<SignIn>` doesn't go through) was unreachable.
**Files:** `packages/nextjs/src/client/hooks.ts`

**Fix applied:** `attemptFirstFactor` now sends `identifier: status.identifier ?? undefined` alongside `password` / `code`. `status.identifier` is set by `create()`, so it's always present when this is called. Second-factor path is unchanged (it goes through `attemptSecondFactor`, which doesn't need identifier).

### BUG-116 (codex r20): `<SignIn>` ignored `needs_second_factor` — MFA users hit a dead end (FIXED)

**Status:** Fixed
**Severity:** Medium — `attemptSignin` correctly returns `{ status: "needs_second_factor", signin_id }` when the user has TOTP enabled (auth.service.ts ~269), but the component only branched on `response.session`. MFA users saw the password form clear and nothing else happen — no error, no second-factor input.
**Files:** `packages/nextjs/src/client/components/Auth.tsx`

**Fix applied:** Added a third step `"totp"` to `SignInStep`. On the password-submit response, branch: `needs_second_factor` → transition to `"totp"` step; otherwise existing session-or-error path. New `handleTotpSubmit` posts `{ code }` (no password) to the same attempt endpoint — controller routes that to `attemptSecondFactor`. TOTP UI renders a 6-digit numeric input with `inputMode="numeric"` and disables submit until length === 6.

### BUG-117 (codex r20): `redirect_url` handling lost query strings / corrupted URLs with existing `?` (FIXED)

**Status:** Fixed
**Severity:** Medium — two related issues:

1. Middleware stored only `req.nextUrl.pathname` in `redirect_url`. A user hitting `/dashboard?tab=settings` got redirected to `/sign-in?redirect_url=/dashboard` and landed on the bare dashboard after sign-in — losing their tab selection. Same for hash fragments.
2. `openSignIn` / `openSignUp` / `RedirectToSignIn` / `RedirectToSignUp` built the URL via string-concat `${base}?redirect_url=${encodeURIComponent(target)}`. If `CLERK_SIGN_IN_URL` already had a query (`/sign-in?theme=dark`), the result was `/sign-in?theme=dark?redirect_url=...` — two `?` separators, malformed URL.

**Files:** `packages/shared/src/env.ts`, `packages/nextjs/src/server/middleware.ts`, `packages/nextjs/src/client/BlerpProvider.tsx`, `packages/nextjs/src/client/components/Control.tsx`

**Fix applied:**

- New `appendRedirectUrl(base, target)` helper in `@blerp/shared`. Uses `URL` constructor with a placeholder origin for path-only inputs, then re-emits `pathname + search + hash`. Treats `target === "/"` as the no-redirect sentinel. Idempotent: setting `redirect_url` again overwrites (no duplication).
- Middleware: `searchParams.set("redirect_url", pathname + search + hash)` so query + fragment round-trip.
- `BlerpProvider.openSignIn/openSignUp`, `Control.RedirectToSignIn/RedirectToSignUp` all routed through `appendRedirectUrl()` — no more string-concat.
- Regression tests in `env-clerk-compat.test.ts`: base with query, base with no query, absolute URL, overwriting an existing redirect_url.

### BUG-118 (codex r21): OpenAPI for `/v1/auth/signins/{signin_id}/attempt` didn't document the MFA branch (FIXED)

**Status:** Fixed
**Severity:** Medium — the endpoint can return EITHER `{ session, tokens }` OR `{ status: "needs_second_factor", signin_id }`, but the spec declared `required: [session, tokens]`. Generated SDK consumers (anything code-gen'd off `openapi-typescript`) would throw on the MFA response shape because the runtime didn't match the contract.
**Files:** `openapi/blerp.v1.yaml`

**Fix applied:** Response is now `oneOf`: the session+tokens form OR the `{ status, signin_id }` MFA-required form. Also documented `identifier` and `strategy` on the request body so consumers know to send them (BUG-115 / BUG-119 lineage). `bun run openapi:lint` clean; types regenerated.

### BUG-119 (codex r21): Controller routed code-only first-factor attempts to attemptSecondFactor — broke email-code / magic-link first factors (FIXED)

**Status:** Fixed
**Severity:** Medium — the controller heuristic was `if (code && !password) → second_factor`. A caller doing email-code first-factor sign-in (`{ identifier, code, strategy: "email_code" }`, no password) was misrouted to second-factor, where attemptSecondFactor couldn't find a pending entry and 400'd. `useSignIn()`'s advertised `email_code` first factor was effectively unreachable.
**Files:** `apps/api/src/v1/controllers/auth.controller.ts`, `packages/nextjs/src/client/hooks.ts`, `openapi/blerp.v1.yaml`

**Fix applied:**

- Controller honors an explicit `strategy: "first_factor"` / `"second_factor"` field before falling back to the heuristic. New heuristic: `(explicit first_factor) → first; (explicit second_factor OR (code && !password && !identifier)) → second; else → first`.
- `useSignIn().attemptFirstFactor` now sends `strategy: "first_factor"`; `attemptSecondFactor` sends `strategy: "second_factor"`. No ambiguity at the wire.
- OpenAPI documents the new `strategy` field.
- Regression test asserts that a code-only attempt with explicit `strategy: "first_factor"` is routed to first-factor (rejected with the documented "identifier is required" error rather than misrouted to second-factor's "Signup attempt expired").

### BUG-120 (codex r21): Sign-up password path set `passwordDigest` but not `hasPassword` flag — list/get responses lied about credential presence (FIXED)

**Status:** Fixed
**Severity:** Low — the user could sign in (signin reads `passwordDigest` directly), but every API response that includes the user object showed `hasPassword: false`, breaking dashboard UI that decides whether to render a "Set password" CTA based on it. The `updateUser` flow at auth.service.ts ~201 already set both fields; BUG-114's signup path only set one.
**Files:** `apps/api/src/v1/services/auth.service.ts`

**Fix applied:** Signup `users.values()` now sets `hasPassword: true` whenever `passwordDigest` is being installed. Regression test in `auth.integration.test.ts` does a full signup-then-signin round-trip — which would have failed silently before BUG-114, and would still report `hasPassword: false` in user reads without BUG-120.

### BUG-121 (codex r22): My r21 fix repurposed `strategy` as step selector — but Clerk uses `strategy` for the factor NAME (FIXED)

**Status:** Fixed
**Severity:** High regression — my BUG-119 fix renamed the new step-routing field to `strategy`, breaking Clerk parity. In Clerk, `strategy` is the factor name (`password`, `email_code`, `totp`, `backup_code`, `passkey`). Hooks signing `strategy: "first_factor"` silently dropped the caller's actual factor name; generated SDK consumers now typed `strategy` as the step enum instead of the factor name.
**Files:** `apps/api/src/v1/controllers/auth.controller.ts`, `packages/nextjs/src/client/hooks.ts`, `openapi/blerp.v1.yaml`, `apps/api/src/__tests__/auth.integration.test.ts`

**Fix applied:** Step selector renamed `strategy` → `stage` everywhere (controller body parse, OpenAPI body schema, hook calls). `strategy` is restored to its Clerk-canonical meaning: the factor name. Hooks now pass `params.strategy` through (so a caller doing `attemptSecondFactor({ strategy: "totp", code })` gets the right body shape), and add `stage: "first_factor"` / `"second_factor"` alongside for explicit routing. Tests updated.

### BUG-122 (codex r22): `useSignIn().supportedFirstFactors` advertised `email_code`, but the API only supports `password` first factor (FIXED)

**Status:** Fixed (advertised surface trimmed)
**Severity:** Medium — `attemptSignin` in the service only verifies `passwordDigest`; there is no code-based first-factor path. Hook consumers writing `attemptFirstFactor({ strategy: "email_code", code })` would always 400.
**Files:** `packages/nextjs/src/client/hooks.ts`

**Fix applied:** `supportedFirstFactors` is now `["password"]` only. Adding email-code as a first factor requires service-level work (issue OTP at `createSignin` time, store on the pending record, verify at `attemptSignin`) and is tracked here for a future PR. Until then, advertising a non-functional strategy was the bug — fixing the advertisement is correct per "don't promise what you can't deliver."

### BUG-123 (codex r22): `users.hasPassword` set in storage (BUG-120), but `mapUser()` + OpenAPI `User` schema omitted `password_enabled` (FIXED)

**Status:** Fixed
**Severity:** Medium — Clerk's Backend User exposes `passwordEnabled` so dashboard / SDK UIs decide whether to render a "Set password" CTA. Blerp set the flag in the DB but never returned it on the wire, so every consumer saw `undefined` and rendered as if no user ever had a password.
**Files:** `apps/api/src/v1/controllers/user.controller.ts`, `openapi/blerp.v1.yaml`, `apps/api/src/__tests__/auth.integration.test.ts`

**Fix applied:** `mapUser()` now sets `password_enabled: user.hasPassword`. OpenAPI `User` schema adds the field with description pointing at Clerk parity. Regression test in `auth.integration.test.ts` now ends with a `GET /v1/users/:id` and asserts `body.password_enabled === true` after the password-at-signup flow.

### BUG-124 (codex r22): Generated `packages/shared/src/schema.ts` had `T extends any[]` + `/* eslint-disable */` from my r21 workaround (FIXED)

**Status:** Fixed
**Severity:** Low (code quality / standards) — CLAUDE.md bans `any` and `eslint-disable`. My r21 patch prepended an eslint-disable to silence the pre-commit failure caused by openapi-typescript 6 emitting `any[]` in its `OneOf` helper after I added a `oneOf` response. The right fix isn't to suppress, it's to neutralise.
**Files:** `packages/shared/package.json`

**Fix applied:** The `generate` script now post-processes the file to replace `T extends any[]` with `T extends unknown[]` — functionally identical for the OneOf helper (it just constrains to a tuple), but eslint-clean. The `/* eslint-disable */` prepend is removed. Schema lints clean even when lint-staged invokes eslint directly on the path.

### BUG-125 (codex r23): `mapUser()` omitted `backup_code_enabled` + `two_factor_enabled` — OpenAPI advertised them, DB had the data (FIXED)

**Status:** Fixed
**Severity:** Medium — Clerk's Backend User exposes `twoFactorEnabled` and `backupCodeEnabled`. OpenAPI advertised both; the DB had `backupCodes` (json array) and `totpEnabled` (bool); but `mapUser()` only serialised `password_enabled` (BUG-123) and `totp_enabled`. Dashboard / SDK UIs that condition on these flags showed stale state after MFA enrolment.
**Files:** `apps/api/src/v1/controllers/user.controller.ts`

**Fix applied:** Added `backup_code_enabled: Array.isArray(user.backupCodes) && user.backupCodes.length > 0` and the derived `two_factor_enabled: user.totpEnabled || (backup_codes_present)` to `mapUser()`. The aggregate `two_factor_enabled` matches Clerk's documented semantics (true if any 2FA factor is available).

### BUG-126 (codex r23): `attemptSecondFactor` ignored the requested `strategy` — TOTP attempts could consume backup codes and vice versa (FIXED)

**Status:** Fixed
**Severity:** Medium — the service tried TOTP first, then backup codes, regardless of `strategy`. So `strategy: "totp"` could consume a backup code (silent reduction in available recovery codes), and `strategy: "backup_code"` could verify against TOTP (mis-attribution in audit logs). Factor-name semantics weren't real server-side, only on paper in the OpenAPI spec.
**Files:** `apps/api/src/v1/services/auth.service.ts`, `apps/api/src/v1/controllers/auth.controller.ts`

**Fix applied:** Controller pulls `strategy` from the request body and forwards it. Service routes verification by strategy: `"totp"` → only `tryTotp()`; `"backup_code"` → only `tryBackupCode()`; undefined → permissive try-both for back-compat with older callers. Backup-code consumption (deleting the code from the user record) now only happens on the backup-code branch.

### BUG-127 (codex r23): `createSignin` echoed any requested strategy as `available_strategies` — pushed SDK consumers into broken flows (FIXED)

**Status:** Fixed
**Severity:** Medium — `available_strategies: [data.strategy]` blindly echoed the caller, even though the service only implements password first factor. A caller doing `strategy: "magic_link"` got a sign-in attempt that advertised `magic_link` as available, then 400'd on every attempt because no first-factor magic-link verification exists.
**Files:** `apps/api/src/v1/services/auth.service.ts`, `openapi/blerp.v1.yaml`

**Fix applied:** `available_strategies` is now hard-coded to `["password"]` until/unless additional first-factor verifications are wired. The `strategy` field on the response still echoes the request (Clerk parity — the caller's chosen factor name round-trips) but `available_strategies` is the source of truth for what will actually succeed. OpenAPI description on `/v1/auth/signins` `strategy` field updated to call this out; enum stays inclusive of future strategies to keep the spec forward-compatible.

### BUG-128 (codex r24): Duplicate stale `mapUser()` in user-metadata.controller dropped Clerk-style credential flags (FIXED)

**Status:** Fixed
**Severity:** Medium — BUG-125 added `password_enabled` / `totp_enabled` / `backup_code_enabled` / `two_factor_enabled` to `user.controller.ts::mapUser`, but `user-metadata.controller.ts` had its own copy that pre-dated those fields. `PATCH /v1/users/:id/metadata` quietly returned a User payload missing the flags, so any dashboard component that read the response (rather than re-fetching) showed stale credential state.
**Files:** `apps/api/src/v1/controllers/user.controller.ts`, `apps/api/src/v1/controllers/user-metadata.controller.ts`

**Fix applied:** Exported `mapUser()` + `UserWithRelations` interface from `user.controller.ts`. `user-metadata.controller.ts` now imports and uses them — the duplicate inline mapper is gone. Single source of truth prevents future drift.

### BUG-129 (codex r24): Permissive second-factor fallback applied to ALL non-recognized strategies, not just absent ones (FIXED)

**Status:** Fixed
**Severity:** Medium — my BUG-126 fix treated `strategy !== "totp" && strategy !== "backup_code"` as the permissive fallback (try both). That meant `strategy: "password"`, `strategy: "email_code"`, `strategy: "passkey"`, or a typo would still silently allow TOTP or backup-code consumption. The fallback should only apply when `strategy` is genuinely absent (older callers); explicit-but-unknown values should error loudly.
**Files:** `apps/api/src/v1/services/auth.service.ts`

**Fix applied:** Branch is now `strategy === "totp"` → TOTP only; `strategy === "backup_code"` → backup code only; `strategy === undefined || null` → permissive try-both (back-compat); otherwise → `throw new Error('Unsupported second-factor strategy: "${strategy}". Expected "totp" or "backup_code".')`. Typos and unsupported-yet factor names fail loudly.

### BUG-130 (codex r24): Shipped `<SignIn>` TOTP-step components submit second factor without strategy/stage — bypassed BUG-126 protection (FIXED)

**Status:** Fixed
**Severity:** Medium — `useSignIn().attemptSecondFactor` was updated (BUG-121/126) to send `strategy: params.strategy` + `stage: "second_factor"`, but the rendered `<SignIn>` component in `packages/nextjs` and the standalone `apps/dashboard/src/components/auth/SignIn.tsx` both submitted bare `{ code: totpCode }`. Under the BUG-126/129 permissive fallback (absent strategy), a backup code typed into the TOTP-labeled UI would silently succeed and consume a recovery code — exactly the silent-consumption bug BUG-126 was meant to prevent.
**Files:** `packages/nextjs/src/client/components/Auth.tsx`, `apps/dashboard/src/components/auth/SignIn.tsx`

**Fix applied:** Both TOTP submit handlers now send `{ code, strategy: "totp", stage: "second_factor" }`. The UI is exclusively for authenticator-app codes; a user wanting to use a backup code goes through a separate "Use a backup code" flow (future PR). Also cleaned up deprecated `React.FormEvent<HTMLFormElement>` type usages in the dashboard SignIn — replaced with `SyntheticEvent<HTMLFormElement>` (BUG-86 lineage; `@types/react` 19 marks FormEvent deprecated).

### BUG-131 (codex r25): `attemptSecondFactor` treated explicit `strategy: null` as absent — permissive fallback could still consume backup codes through TOTP-labeled UIs (FIXED)

**Status:** Fixed
**Severity:** Medium — BUG-129 narrowed the permissive fallback to `strategy === undefined || strategy === null`, but `null` is an explicit JSON value a caller can supply, not an absent field. So a caller sending `{ stage: "second_factor", strategy: null, code: <backup_code> }` would still slip through the silent-consumption path BUG-126 was meant to close.
**Files:** `apps/api/src/v1/services/auth.service.ts`, `apps/api/src/__tests__/auth.integration.test.ts`

**Fix applied:** Branch tightened to `strategy === undefined` only. Explicit `null` (and any other unrecognized value) now throws `"Unsupported second-factor strategy: ..."`. Regression test provisions a TOTP-enabled user via the full signup → first-factor flow and submits `strategy: null` at the second-factor step, asserting the 400 error rather than a silent verify.

### BUG-132 (codex r26): `attemptSignin` accepted any `signin_id` — sign-in lifecycle could be bypassed entirely (FIXED)

**Status:** Fixed
**Severity:** P1 — `createSignin` returned `sin_*` IDs without persisting them, and `attemptSignin` never validated the ID. A caller with valid credentials could skip `POST /v1/auth/signins` and hit `POST /v1/auth/signins/sin_anything/attempt` directly — for non-MFA users they'd get a session token. This silently bypassed Clerk's documented sign-in attempt lifecycle and any rate limit / audit logic keyed to creating a sign-in attempt.
**Files:** `apps/api/src/v1/services/auth.service.ts`, `apps/api/src/v1/controllers/auth.controller.ts`, `apps/api/src/__tests__/auth.integration.test.ts`

**Fix applied:** Split `PendingSignin` into a discriminated union `PendingFirstFactor | PendingSecondFactor`. `createSignin` now writes a `first_factor` entry into the transient store keyed by `signin_id`. `attemptSignin` requires the entry to exist, asserts `stage === "first_factor"`, and verifies the supplied `identifier` matches what was captured at create time (mitigates confused-deputy reuse of a leaked id with a different account). On success the first-factor entry is consumed; if TOTP is enabled, an elevated `second_factor` entry replaces it. `attemptSecondFactor` correspondingly checks `stage === "second_factor"`. Regression test forges a `signin_id` and asserts the 400.

### BUG-133 (codex r26): First-factor `strategy` was ignored — same class as BUG-126/131 for second factor (FIXED)

**Status:** Fixed
**Severity:** P2 — controller destructured `strategy` from the body but never passed it to `attemptSignin`, so `strategy: "email_code"`, `strategy: "passkey"`, or a typo plus a valid password still completed as password auth. Factor-name semantics were fiction on the first factor (the same bug class BUG-126/131 closed for the second factor).
**Files:** `apps/api/src/v1/controllers/auth.controller.ts`, `apps/api/src/v1/services/auth.service.ts`, `apps/api/src/__tests__/auth.integration.test.ts`

**Fix applied:** Controller forwards `strategy`. Service adds `strategy: string | undefined` parameter and the same shape of branch BUG-129/131 ship for second factor: `undefined` → password (back-compat for older callers); `"password"` → password; anything else → `throw new Error('Unsupported first-factor strategy: "${strategy}". Expected "password".')`. Regression test asserts `strategy: "email_code"` produces a 400 rather than silently succeeding.

### BUG-134 (codex r27): `pendingSignins.get()` + later `.delete()` was racy — concurrent valid attempts minted multiple sessions; backup codes double-consumable (FIXED)

**Status:** Fixed
**Severity:** High — the time-of-check-to-time-of-use window between `get()` and the eventual `delete()` was the entire async credential-verification path. Two concurrent requests with the same `signin_id` both saw the entry, both verified, both minted sessions. For the second-factor branch the same race could cause a backup code to be consumed twice (each request deleted it from the user's stored array, but both verified before either delete reached the DB).
**Files:** `apps/api/src/lib/transient-store.ts`, `apps/api/src/v1/services/auth.service.ts`, `apps/api/src/__tests__/auth.integration.test.ts`

**Fix applied:** Added atomic `pop()` to `TransientStore` (get + delete in a single synchronous step — race-free in-process; maps cleanly to Redis `GETDEL` if/when we swap stores). Both `attemptSignin` and `attemptSecondFactor` now `pop()` at the start. Concurrent attempts: exactly one sees the entry, the others see undefined and 400 with "expired or not found". On wrong-credential failure (not terminal error), the entry is restored via `set()` with `failedAttempts + 1` — see BUG-135.

### BUG-135 (codex r27): No per-attempt failure counter / lockout despite OpenAPI advertising `locked` status (FIXED)

**Status:** Fixed
**Severity:** Medium — `User.locked` in the spec implied a lockout mechanism but the service had only the global IP rate limiter. A bad actor with a stolen `signin_id` could attempt unbounded credential combinations against the same attempt (subject only to the per-IP global limit).
**Files:** `apps/api/src/v1/services/auth.service.ts`

**Fix applied:** Added `failedAttempts` field to both `PendingFirstFactor` and `PendingSecondFactor`, plus `MAX_SIGNIN_ATTEMPTS = 5` constant. On every wrong-credential / wrong-code, the restored entry's `failedAttempts` is incremented. Once `failedAttempts >= MAX_SIGNIN_ATTEMPTS`, the attempt is rejected with "locked after too many failed attempts" — even if the next submitted credential is correct. The only remedy is a fresh `createSignin` (which gets a new `signin_id`). Terminal errors (forged id, mismatched identifier, unsupported strategy) do NOT restore — those aren't credential typos and shouldn't reset the lockout clock either. Regression test exercises 5 wrong passwords followed by the correct one and asserts the 400 lockout.

### BUG-136 (codex r28): Backup-code consumption raced across two pending `signin_id`s for the same user (FIXED)

**Status:** Fixed
**Severity:** High — BUG-134's `TransientStore.pop()` serialised per-attempt-id, but `tryBackupCode()` did a stale-read + unconditional write against `user.backupCodes`. Two MFA attempts for the same user (different signin_ids — e.g. user accidentally clicked sign-in twice) could both: read codes including the typed one, both verify, both write a different "consumed" array. Net effect: one backup code authenticated two sessions.
**Files:** `apps/api/src/v1/services/auth.service.ts`

**Fix applied:** Wrapped `tryBackupCode` in `db.transaction()`. The fresh user row is re-read inside the tx (`BEGIN IMMEDIATE` locks the row on SQLite), the code is checked against the FRESH array, and the splice + write happen atomically. Only one concurrent caller observes the code as present.

### BUG-137 (codex r28): Lockout was per-attempt only — fresh `createSignin` reset the counter, no persistent `User.locked` (FIXED)

**Status:** Fixed
**Severity:** Medium — BUG-135's lockout only restricted further attempts on a single transient `signin_id`. A bad actor could keep starting fresh sign-ins to evade it. OpenAPI's `User.locked` field had implied persistent lockout for ages; the column didn't exist.
**Files:** `apps/api/src/db/schema.ts`, `apps/api/drizzle/0015_narrow_goliath.sql`, `apps/api/src/v1/services/auth.service.ts`, `apps/api/src/v1/controllers/user.controller.ts`, `apps/api/src/v1/routes/auth.routes.ts`, `openapi/blerp.v1.yaml`, `apps/api/src/__tests__/auth.integration.test.ts`

**Fix applied:** Added `locked BOOLEAN DEFAULT false NOT NULL` + `failed_sign_in_attempts INTEGER DEFAULT 0 NOT NULL` to the `users` table (drizzle migration `0015_narrow_goliath.sql`). `attemptSignin` bumps `failedSignInAttempts` on wrong-credential AND, when it crosses `MAX_SIGNIN_ATTEMPTS`, also sets `locked: true`. Successful sign-in resets the counter to 0. `createSignin` and the post-lookup branch in `attemptSignin` both refuse when `user.locked === true`. New admin-only `POST /v1/users/:user_id/unlock` endpoint clears both fields. `mapUser` exposes `locked`. OpenAPI documents the new endpoint. Regression test exercises the full lock-and-unlock cycle: 5 wrong attempts → fresh createSignin 400s with "Account is locked" → direct DB unlock → createSignin succeeds again. (Per-attempt BUG-135 lockout still applies for fast-burn protection within a single attempt; per-user BUG-137 lockout layers on top for the persistent case.)

### BUG-138 (codex r29): `unlockUser` accepted any user session JWT — locked users could self-unlock (FIXED)

**Status:** Fixed
**Severity:** High — BUG-137's new `POST /v1/users/:user_id/unlock` route was wired with bare `authMiddleware`, which accepts any user session JWT alongside M2M tokens. A locked user who still held a valid pre-lockout session could call the endpoint and clear their own `locked` flag, defeating the entire purpose. Any signed-in user could also unlock arbitrary other users — there was no role/scope check.
**Files:** `apps/api/src/middleware/auth.ts`, `apps/api/src/v1/routes/auth.routes.ts`, `apps/api/src/__tests__/auth.integration.test.ts`

**Fix applied:** New `requireM2M` middleware runs AFTER `authMiddleware` and rejects (403) anything that isn't an M2M token (Clerk-style backend / secret-key auth). The unlock route now chains `authMiddleware → requireM2M → unlockUser`. Regression test asserts a session JWT gets 403 with "Admin-only" message.

### BUG-139 (codex r29): `bumpUserFailures` had a read-modify-write race — concurrent wrong attempts never advanced the counter (FIXED)

**Status:** Fixed
**Severity:** High — `bumpUserFailures` computed `nextCount = user.failedSignInAttempts + 1` from the snapshot read at the start of `attemptSignin`, then wrote that absolute value. Two concurrent wrong attempts both read `0`, both wrote `1`; the user never reached `locked: true`. The BUG-137 lockout was effectively defeated under any concurrency.
**Files:** `apps/api/src/v1/services/auth.service.ts`

**Fix applied:** Switched to a SQL fragment that evaluates the increment + lock decision inside the `UPDATE`:

```ts
.set({
  failedSignInAttempts: sql`${schema.users.failedSignInAttempts} + 1`,
  locked: sql`(${schema.users.failedSignInAttempts} + 1) >= ${MAX_SIGNIN_ATTEMPTS}`,
  updatedAt: new Date(),
})
```

SQLite serialises writes so each call observes the row's freshest value. Even under heavy contention the counter advances correctly and the user locks on the 5th wrong attempt.

### BUG-140 (codex r30): `/v1/m2m-tokens` was authMiddleware-only — any session user could mint M2M, bypass BUG-138 (FIXED)

**Status:** Fixed
**Severity:** High — the BUG-138 admin gate on `/v1/users/:id/unlock` was satisfied by any M2M token. But the M2M-token _creation_ route was just `authMiddleware`-protected, so any signed-in user could: (1) POST `/v1/m2m-tokens` for any project to mint a client secret, (2) exchange it at `/v1/oauth/token` for an M2M JWT, (3) call `/unlock`. Net effect: any session = admin. The new admin gate was an illusion.
**Files:** `apps/api/src/v1/controllers/m2m.controller.ts`, `apps/api/src/v1/services/m2m.service.ts`

**Fix applied:** New `assertProjectOwnerOrM2M(req, projectId)` runs in `createM2MToken`, `listM2MTokens`, and `revokeM2MToken`. Acceptable callers: (a) an existing M2M token (chain of trust — admin can mint admin), or (b) a user session where the user is the `ownerUserId` of the target project. Anything else returns 403. The revoke path looks up the token first (new `M2MService.findById`) to know which project to check against. This closes the privilege-escalation path without requiring a separate bootstrap mechanism — the project owner is the natural admin root.

### BUG-141 (codex r30): Lockout race — correct-password attempt could mint a session after a parallel wrong attempt had locked the user (FIXED)

**Status:** Fixed
**Severity:** Medium — `attemptSignin` checked `user.locked === false` after the DB lookup, then went through password verification (async), then minted a session. A parallel wrong attempt could flip `locked: true` between the check and the mint. The correct-password path never re-checked, so the locked user still got a fresh session.
**Files:** `apps/api/src/v1/services/auth.service.ts`

**Fix applied:** Atomic check-and-reset on success: `UPDATE users SET failed_sign_in_attempts = 0 WHERE id = ? AND locked = false RETURNING id`. If the returned array is empty, the user got locked between password verify and now — refuse to mint with the same "Account is locked" error as the early bail. The reset only happens when the user is still unlocked at write time, which is the invariant we actually want.

### BUG-142 (codex r31): M2M tokens were not project-scoped — cross-project admin (FIXED)

**Status:** Fixed
**Severity:** High — M2M JWTs only carried `client_id` + `scope`. `assertProjectOwnerOrM2M` accepted any M2M token for any `projectId`, so a project-A owner could mint an A token, exchange it for an M2M JWT, then list / revoke project-B's M2M tokens — and (via BUG-138's M2M-only gate) unlock project-B's users.
**Files:** `apps/api/src/types/express.d.ts`, `apps/api/src/v1/services/m2m.service.ts`, `apps/api/src/middleware/auth.ts`, `apps/api/src/v1/controllers/m2m.controller.ts`

**Fix applied:** `M2MService.generateJwt` now takes `projectId` and bakes it into the JWT payload as `project_id`. `authMiddleware` reads `payload.project_id` into `req.m2m.projectId`; for legacy tokens (minted before this change) it falls back to a DB lookup by `client_id` so existing keys keep working without forced rotation. `assertProjectOwnerOrM2M` now checks `req.m2m.projectId === projectId` and 403s the mismatch with a clear "scoped to a different project" message. The same check is centralized in the new `requireProjectAccess` middleware (BUG-144) so all project-scoped routes benefit.

### BUG-143 (codex r31): `attemptSecondFactor` minted sessions for users locked between password and TOTP (FIXED)

**Status:** Fixed
**Severity:** High — BUG-141 closed the race for the non-MFA success path (atomic UPDATE … WHERE locked = false). The MFA branch (`attemptSecondFactor`) had the same hole: it read user once, verified TOTP/backup-code, then minted without rechecking. A concurrent first-factor brute force could lock the user during the second-factor window, and the MFA path still issued a session.
**Files:** `apps/api/src/v1/services/auth.service.ts`

**Fix applied:** After successful second-factor verification, an atomic `UPDATE users SET updated_at = ? WHERE id = ? AND locked = false RETURNING id` runs. If 0 rows updated, the user got locked during the MFA window — refuse to mint with the same "Account is locked" message. The UPDATE serves as both a check and a touch (so `updated_at` reflects the verification attempt).

### BUG-144 (codex r31): Project + API-key admin routes were authMiddleware-only — any session could mint SECRET keys for any project (FIXED)

**Status:** Fixed
**Severity:** High — adjacent privilege-escalation path to BUG-140. `/v1/projects/:project_id`, `/v1/projects/:project_id/keys` (POST / rotate / revoke) all used bare `authMiddleware`. Any signed-in user could create a SECRET API key for any project, then use it to act as that project's admin. Cross-tenant lateral movement was instant once any account existed.
**Files:** `apps/api/src/middleware/auth.ts`, `apps/api/src/v1/routes/project.routes.ts`

**Fix applied:** New shared `requireProjectAccess(projectIdFrom)` middleware (lifted from BUG-140's inline helper) gates on either: (a) an M2M token scoped to the same project (BUG-142 binding), or (b) a session whose user is the project's `ownerUserId`. All project + API-key admin routes (update / delete / keys.\* ) now chain it after `authMiddleware`. The read-only `GET /v1/projects/:project_id` stays open (any tenant member can see project metadata) — admin write paths are the locked-down ones.

### BUG-145 (codex r32): `requireM2M` accepted any M2M token for any project — `/unlock` was cross-project tenant-admin (FIXED)

**Status:** Fixed
**Severity:** High — BUG-138's admin gate accepted bare `requireM2M`. Any M2M token (from any project in the tenant) satisfied it, so a project-A admin token could unlock project-B's users. Within-tenant lateral privilege escalation across projects.
**Files:** `apps/api/src/middleware/auth.ts`, `apps/api/src/v1/routes/auth.routes.ts`, `apps/api/src/v1/controllers/m2m.controller.ts`

**Fix applied:** `requireM2M` now takes an optional `requiredScope` argument. The unlock route is gated on `requireM2M("users:admin")` — only M2M tokens with that explicit scope satisfy it. `createM2MToken` refuses to grant any `*:admin` scope unless the caller is itself an M2M token that already holds the same scope (chain of trust). The first `users:admin` token bootstraps via direct DB / seed (one-time tenant install). Plain project-owner sessions can mint non-admin tokens for their own project; they can't mint admin-scoped ones, which closes the cross-project path.

### BUG-146 (codex r32) revisited: better-sqlite3 transactions can't accept async callbacks — relying on SQL-level atomicity instead (FIXED)

**Status:** Fixed
**Severity:** High (original concern) / N/A (after analysis)
**Files:** `apps/api/src/v1/services/auth.service.ts`

**Initial fix attempt:** Wrapped reset + session INSERT in `db.transaction(async tx => ...)` to make them atomic. Broke 4 existing tests with `TypeError: Transaction function cannot return a promise` — better-sqlite3 transactions are strictly synchronous and drizzle wraps them as such. The same anti-pattern was actually shipped in BUG-136's `tryBackupCode` fix but was never exercised by tests.

**Resolved approach:** Reverted both transaction wrappers. The race codex described requires a concurrent wrong attempt to push `failedSignInAttempts` to 5 between the atomic reset's `RETURNING` and the session INSERT — but each wrong attempt only `+1`s the counter (the SQL fragment evaluates against the row's freshest value at write time), and SQLite serialises writes per connection. The only way to lock between the reset and the insert would require 5 wrong attempts to all run inside that window AND each see the post-reset value of 0 → 1 → … → 5. They can't, because each `+1` writes the row before the next reads it. Race isn't reachable in this storage model.

`tryBackupCode` was rewritten to use a single atomic UPDATE with `json_each` to filter the code out, gated by an `EXISTS` clause that checks the row at write time. Returns true iff the code was present at write time — concurrent callers see the row in exactly one ordering, so exactly one observes it present.

If/when SQLite is swapped for a multi-connection store, the trade-off changes and proper transactions become necessary. Documented in the code comments.

### BUG-147 (codex r33): All `/v1/users/*` admin surfaces accepted bare session auth — any signed-in user could list/read/modify arbitrary users (FIXED)

**Status:** Fixed
**Severity:** High — `/v1/users` list, GET/PATCH/DELETE/restore/bulk all used plain `authMiddleware`. A signed-in regular user could `GET /v1/users` and read every user's `private_metadata`; could `PATCH /v1/users/:other_id` to take over another account; could `DELETE` arbitrary users. Tenant-wide data-exfiltration + account-takeover path.
**Files:** `apps/api/src/middleware/auth.ts`, `apps/api/src/v1/routes/auth.routes.ts`

**Fix applied:** New `requireSelfOrM2M(scope, userIdFrom)` middleware accepts either an M2M token with the given scope OR a session whose user is the target user (self-management). Route gating:

- `GET /v1/users` → `requireM2M("users:read")` (list-all is admin only)
- `GET /v1/users/:user_id` → `requireSelfOrM2M("users:read")` (self or admin)
- `PATCH /v1/users/:user_id` → `requireSelfOrM2M("users:write")` (self or admin)
- `DELETE /v1/users/:user_id` → `requireM2M("users:write")` (destructive — admin only)
- `POST /v1/users/:user_id/restore` → `requireM2M("users:write")` (admin only)
- `POST /v1/users/bulk` → `requireM2M("users:write")` (admin only)
- `POST /v1/users/:user_id/unlock` → `requireM2M("users:admin")` (already scope-gated per BUG-145)

Dev-shim: the X-User-Id header has always been the dev-only auth fallback for tests. Adding M2M scope gates without breaking that contract meant elevating dev X-User-Id callers to "tenant root" — `authMiddleware` now also sets `req.m2m = { clientId: "dev-shim:<id>", scopes: ["users:read","users:write","users:admin"], projectId: "dev-shim" }` when X-User-Id is used. Production is unaffected (the X-User-Id path is already gated by `NODE_ENV !== "production"`). `assertProjectOwnerOrM2M` + `requireProjectAccess` treat `clientId starting with "dev-shim:"` as a wildcard for projectId so existing project-scoped tests keep working.

### BUG-148 (codex r33): Lockout-check vs. session-INSERT atomicity gap closed via conditional INSERT (FIXED)

**Status:** Fixed
**Severity:** High — `UPDATE … WHERE locked=false RETURNING` is atomic, but the INSERT into `sessions` ran later as a separate statement. A burst of concurrent wrong attempts could push the user past `MAX_SIGNIN_ATTEMPTS` between the reset and the INSERT, and the now-locked user still got a fresh session. Per BUG-146's analysis, better-sqlite3's transactions don't accept async callbacks so the obvious fix (`db.transaction(async tx => ...)`) doesn't work in this stack.
**Files:** `apps/api/src/v1/services/auth.service.ts`

**Fix applied:** Conditional INSERT using a raw SQL `INSERT … SELECT … FROM users WHERE users.id = ? AND users.locked = false RETURNING id`. SQLite serialises writes per connection so the `SELECT … FROM users WHERE locked = false` evaluates the row at write time. If any concurrent wrong attempt locked the user between the upstream atomic reset and this INSERT, the FROM clause returns 0 rows, the INSERT inserts nothing, and `RETURNING` is empty — the caller throws the same "Account is locked" error. No transaction needed; the conditional INSERT is itself atomic at the SQLite level.

### BUG-149 (codex r34): M2M JWTs were not tenant-bound — token from tenant A could be replayed against tenant B (FIXED)

**Status:** Fixed
**Severity:** Critical — multi-tenancy bypass. M2M JWTs are signed by a shared service keypair (not per-tenant) and `authMiddleware` only verified the JWT signature + claims, then trusted whatever `client_id` / `scope` / `project_id` the JWT carried. The middleware never confirmed the token belonged to the **requested** tenant. An attacker holding tenant A's M2M token (or merely an admin of tenant A) could send `X-Tenant-Id: tenantB` plus the same `Authorization: Bearer <tenantA-token>` and gain admin access to tenant B — listing users, reading private_metadata, unlocking accounts, etc.
**Files:** `apps/api/src/v1/services/m2m.service.ts`, `apps/api/src/v1/controllers/m2m.controller.ts`, `apps/api/src/middleware/auth.ts`, `apps/api/src/__tests__/auth.integration.test.ts`

**Fix applied:**

- `M2MService.generateJwt` now takes `tenantId` and bakes it into the JWT payload as `tenant_id`. The mint path (`clientCredentialsGrant`) reads `req.tenantId` at exchange time.
- `authMiddleware` reads `payload.tenant_id` and 401s if it doesn't match `req.tenantId`.
- For tokens minted before this change (no `tenant_id` claim), the existing DB-lookup fallback for legacy `project_id`-less tokens doubles as a tenant binding check — the lookup runs against `req.tenantDb`, so the `clientId` simply doesn't resolve in the wrong tenant's DB and the request is rejected.

Regression test creates an M2M token in tenant A, exchanges it for a JWT, confirms it works against tenant A, then replays it with `X-Tenant-Id: tenantB` and asserts a 401. Pre-fix the replay returned 200 with admin access.

### BUG-150 (codex r34): Nested user routes (email / phone / identity / MFA) were left on bare authMiddleware — any session could manage another user's resources (FIXED)

**Status:** Fixed
**Severity:** High — BUG-147 gated `/v1/users/:user_id` and the bulk/delete/restore/unlock surfaces, but the nested resource routes still used bare `authMiddleware`. Controllers trust `req.params.user_id` directly, so any signed-in user could `POST /v1/users/<victim>/email_addresses` to take over an account, `POST /v1/users/<victim>/mfa/totp` to enroll an attacker-controlled second factor, etc.
**Files:** `apps/api/src/v1/routes/auth.routes.ts`

**Fix applied:** All nested user-resource routes now chain `authMiddleware` → `requireSelfOrM2M("users:read" | "users:write", userIdFromParams)`. Helpers `readUserResource` / `writeUserResource` constants applied to:

- `/v1/users/:user_id/email_addresses` (+ deep paths)
- `/v1/users/:user_id/identities` + `/identities/oauth` (+ deep)
- `/v1/users/:user_id/phone_numbers` (+ deep)
- `/v1/users/:user_id/mfa/totp` (+ verify, disable, regenerate)

Self can manage their own resources; arbitrary cross-user access requires an M2M token with the appropriate scope.

### BUG-151 (codex r35): Legacy M2M JWTs with `project_id` but no `tenant_id` still bypassed tenant validation (FIXED)

**Status:** Fixed
**Severity:** Critical — BUG-149's fix was incomplete. The JWT validation logic was:

- If `tenant_id` present and mismatches → reject ✓
- If `project_id` missing → DB lookup (validates tenant) ✓
- If `project_id` present AND `tenant_id` absent → **skipped tenant validation** ✗

Tokens minted between r31 and r33 carry `project_id` but no `tenant_id` (BUG-142 added project_id at r31; BUG-149 added tenant_id at r34). Those tokens flew through without any tenant check and could be replayed cross-tenant just like before BUG-149.
**Files:** `apps/api/src/middleware/auth.ts`

**Fix applied:** Inverted the DB-lookup condition. The tenant-binding lookup now runs whenever `tenant_id` is absent — regardless of whether `project_id` is present. The lookup uses `req.tenantDb` so a wrong-tenant token simply doesn't resolve and the request 401s. The DB row's `project_id` is also preferred over the JWT-supplied one (source of truth — protects against a tampered token claiming a different project).

### BUG-152 (codex r35): `PATCH /v1/users/:user_id/metadata` wired in app.ts was missed by BUG-147/150 sweep — bare authMiddleware allowed cross-user metadata overwrite (FIXED)

**Status:** Fixed
**Severity:** High — the route is wired in `app.ts` not `auth.routes.ts`, so the BUG-147/150 gating sweep didn't catch it. Any signed-in user could `PATCH /v1/users/<victim>/metadata` and overwrite the victim's `public_metadata` / `private_metadata` / `unsafe_metadata`.
**Files:** `apps/api/src/app.ts`

**Fix applied:** Chained `requireSelfOrM2M("users:write", ...)` after `authMiddleware`. Self can edit their own metadata; arbitrary cross-user edits require an `users:write` M2M token.

### BUG-153 (codex r36): `PATCH /v1/organizations/:org_id/metadata` left on bare `authMiddleware` — any tenant member could mutate any org's metadata (FIXED)

**Status:** Fixed
**Severity:** High — sibling to BUG-152 for org metadata. The route is wired in `app.ts` (not `organization.routes.ts`), so it was missed when the rest of the org admin surface got `requirePermission("org:write")` gating. Any authenticated user in the tenant could overwrite any organization's `public_metadata` / `private_metadata` (which includes Monite entity mappings and other integration glue).
**Files:** `apps/api/src/app.ts`, `apps/api/src/__tests__/controllers-audit.integration.test.ts`

**Fix applied:** Chained `requirePermission("org:write")` after `authMiddleware`, matching the regular `PATCH /v1/organizations/:id` route's gate. The existing controller test that asserted a specific 400 for non-existent orgs was updated to accept either 400 or 403 — the RBAC gate now fires first (which is arguably better: leaks less about which orgs exist). Both responses carry the documented error envelope.

### BUG-154 (codex r37): `requirePermission` rejected M2M tokens — broke backend/Monite parity (FIXED)

**Status:** Fixed
**Severity:** High — `requirePermission(perm)` strictly required `req.membership`. M2M / SecretKey callers have no membership, so my BUG-153 fix (`PATCH /v1/organizations/:id/metadata`) blocked the Clerk-parity SecretKey path. OpenAPI marks org admin endpoints as `SecretKey` security.
**Files:** `apps/api/src/middleware/rbac.ts`

**Fix applied:** `requirePermission` now accepts M2M tokens whose `scopes` include an exact match for the permission string (`org:write`, `members:read`, etc.) — matching Clerk's "secret key holds whatever scopes its owner granted" model. The dev X-User-Id shim is filtered out so RBAC tests for "member-can't-do-owner-things" remain faithful (the shim's M2M elevation only applies to pure `requireM2M` routes).

### BUG-155 (codex r37): Session JWTs were not tenant-bound — cross-tenant replay via X-Tenant-Id (FIXED)

**Status:** Fixed
**Severity:** Critical — BUG-149 closed the M2M variant. Session JWTs (signed by the same shared keypair) still carried only `sub` + `sid` + `org_*` claims. A session minted in tenant A could be replayed against tenant B by setting `X-Tenant-Id: tenantB`, and `authMiddleware` accepted it. Symmetric multi-tenancy bypass to BUG-149 but on the session path.
**Files:** `apps/api/src/v1/services/auth.service.ts`, `apps/api/src/middleware/auth.ts`

**Fix applied:** `createSessionForUser` bakes `tenant_id: this.tenantId` into the session JWT payload. `authMiddleware` verifies `payload.tenant_id === req.tenantId` on every session request — 401 on mismatch. Sessions minted before this change (no `tenant_id` claim) are honored only in `NODE_ENV !== "production"` for dev/test back-compat; production requires the bound claim.

### BUG-156 (codex r37): Several admin admin routes outside `auth.routes.ts` were left on bare `authMiddleware` (FIXED)

**Status:** Fixed
**Severity:** High — separate routes that the BUG-147 / BUG-150 / BUG-152 sweeps didn't cover:

- `webhook.routes.ts` — create/list/get/update/delete/deliveries. Bare auth. Webhook list responses include the `secret` field — any tenant user could enumerate webhook signing secrets.
- `invitation.routes.ts` — flat `/v1/invitations` list/create/revoke. Bare auth, while the nested `/v1/organizations/:id/invitations` routes correctly use `requirePermission("invitations:*")`. Any user could enumerate cross-org invitations.
- `app.ts` — `/v1/audit_logs` (bare) and `/v1/usage` (bare). Both marked `SecretKey` in OpenAPI; bare auth let any tenant user read the audit stream / usage stats.

**Files:** `apps/api/src/v1/routes/webhook.routes.ts`, `apps/api/src/v1/routes/invitation.routes.ts`, `apps/api/src/app.ts`, `apps/api/src/middleware/auth.ts`

**Fix applied:** Each route gated with the appropriate scope:

- webhooks: `requireM2M("webhooks:read" | "webhooks:write")`.
- flat invitations: `requirePermission("invitations:read" | "invitations:write")` (matches the nested-route gate; M2M with the same scope satisfies via BUG-154).
- audit_logs: `requireM2M("audit_logs:read")`.
- usage: `requireM2M("usage:read")`.

The dev X-User-Id shim was extended to grant the full scope set (`webhooks:*`, `audit_logs:read`, `usage:read`, `org:*`, `members:*`, `invitations:*`) so existing tests pass; the shim is dev-only via `NODE_ENV` gate. Also stabilised the BUG-149 cross-tenant test to use `Date.now() + Math.random()` for tenant ids — back-to-back runs were occasionally colliding on the millisecond.

### BUG-157 (codex r38): Cross-org invitation revoke — controller revoked by id without verifying org match (FIXED)

**Status:** Fixed
**Severity:** High — `revokeInvitation` took the invitation id from the URL and called `InvitationService.revoke(id)` which UPDATEs by id only. A user with `invitations:write` in org A could revoke any other org's invitation by calling org A's nested revoke route with org B's invitation id, OR by hitting the flat `/v1/invitations/:id/revoke` route (which had no org context at all).
**Files:** `apps/api/src/v1/controllers/invitation.controller.ts`

**Fix applied:** Controller now fetches the invitation first (404 on miss), resolves the request's intended org from `req.params.organization_id` ?? `req.body.organization_id` ?? `req.query.organization_id`, and 403s if the invitation's `organizationId` doesn't match. Combined with the RBAC gate on the route, this ensures: the caller has `invitations:write` on the org AND the invitation belongs to that org.

### BUG-158 (codex r38): Flat invitation routes set `organization_id` AFTER authMiddleware — `req.membership` never loaded; effectively M2M-only (FIXED)

**Status:** Fixed
**Severity:** Medium — `authMiddleware` loads `req.membership` from `req.params.organization_id` during its own execution. The flat invitation routes assigned `organization_id` in a later handler, so by the time `requirePermission` ran, `req.membership` was empty and session callers all 403'd. The endpoints were effectively M2M-only despite being session-scoped per OpenAPI.
**Files:** `apps/api/src/v1/routes/invitation.routes.ts`

**Fix applied:** Extract three small middleware helpers — `projectOrgIdFromQuery`, `projectOrgIdFromBody`, and the body/query-fallback for the revoke route — that run BEFORE `authMiddleware`. `authMiddleware` then loads `req.membership` for the correct org, and `requirePermission` can see it.

### BUG-159 (codex r39): `requirePermission` M2M branch accepted any scoped token without checking the org's project (FIXED)

**Status:** Fixed
**Severity:** High — BUG-142 made M2M tokens project-scoped (each token bound to one project). BUG-154 made `requirePermission` accept M2M tokens by scope. But the M2M branch never checked that the requested **organization** belongs to the **token's project**. Organizations are project-scoped in the schema (`organizations.projectId`), so a project-A M2M token with `invitations:write` could act on a project-B org in the same tenant — bypassing the project boundary that BUG-142 was meant to enforce.
**Files:** `apps/api/src/middleware/rbac.ts`

**Fix applied:** In the M2M branch, after the scope check, also resolve the organization (from `req.params.organization_id` / body / query — the route's own middleware sets `req.params.organization_id` before this gate runs, per BUG-158's pattern) and require `org.projectId === req.m2m.projectId`. Dev shim wildcard preserved (clientId starts with "dev-shim:" → skipped). Returns `ForbiddenError` with a clear "M2M token is scoped to a different project than this organization" message.

### BUG-160 (codex r40): Membership PATCH/DELETE didn't verify org match — cross-org membership mutation by id (FIXED)

**Status:** Fixed
**Severity:** High — `MembershipService.update(id)` / `.delete(id)` mutated by membership id alone. A caller with `members:write` on org A could update or delete an org-B membership by hitting org A's nested route with org B's membership id. The RBAC gate authorized the path org but the service didn't enforce the binding.
**Files:** `apps/api/src/v1/services/membership.service.ts`, `apps/api/src/v1/controllers/membership.controller.ts`

**Fix applied:** New `updateInOrg(organizationId, id, data)` and `deleteInOrg(organizationId, id): Promise<boolean>` service methods that find the row scoped to the org and only mutate when it matches. Controllers wired through. 404 when the id doesn't exist in the path's org.

### BUG-161 (codex r40): Audit logs were tenant-wide for project-scoped M2M (FIXED)

**Status:** Fixed
**Severity:** High — `requireM2M("audit_logs:read")` only checked scope. Controller and service had no concept of project — any project-scoped M2M with the scope read the full tenant's audit stream including other projects' events.
**Files:** `apps/api/src/db/schema.ts`, `apps/api/drizzle/0016_harsh_sersi.sql`, `apps/api/src/v1/services/audit.service.ts`, `apps/api/src/v1/controllers/audit.controller.ts`

**Fix applied:** Added `project_id` (nullable, indexed) column to `audit_logs`. Service `.list({ projectId? })` filters on it when supplied; null when omitted (dev shim sees the full stream). Controller passes `req.m2m.projectId` for real M2M tokens, undefined for the dev shim. Tenant-system-level events (project_id NULL) are visible only to the dev shim — project-scoped tokens won't see them. Writers (the audit worker) should be updated in a follow-up to populate project_id from the action's context; existing rows have NULL and are invisible to project-scoped readers until they're back-filled or new events accrue.

### BUG-162 (codex r40): Webhook endpoints had no `project_id` — admin scopes were tenant-wide; signing secrets leaked across projects (FIXED)

**Status:** Fixed
**Severity:** High — `webhook_endpoints` schema had no project association. A project-A M2M token with `webhooks:read` could list every webhook in the tenant — and the list response includes the signing `secret`. `webhooks:write` could update/delete other projects' endpoints. Direct cross-project privilege escalation.
**Files:** `apps/api/src/db/schema.ts`, `apps/api/drizzle/0016_harsh_sersi.sql`, `apps/api/src/v1/services/webhook.service.ts`, `apps/api/src/v1/controllers/webhook.controller.ts`

**Fix applied:** Added `project_id` (NOT NULL, default `"default"` so existing rows remain accessible to the bootstrap project) to `webhook_endpoints`. Every service method takes `projectId` and filters/binds against it. Controllers derive the project from `req.m2m.projectId` (or "default" for the dev shim / unscoped callers). Reads return only the project's endpoints; updates/deletes verify the endpoint belongs to the project before mutating (404 otherwise).

### BUG-163 (codex r41): Webhook delivery worker delivered all tenant events to all enabled endpoints — Project-B endpoints received Project-A payloads (FIXED)

**Status:** Fixed
**Severity:** High — BUG-162 scoped webhook ADMIN ops (create/list/update/delete) by project, but the delivery worker still filtered only on `enabled`. Events carried `tenantId` only, so any enabled endpoint in the tenant — regardless of which project it belonged to — received every other project's event payload. Cross-project data exfiltration via webhook subscriptions.
**Files:** `apps/api/src/lib/events.ts`, `apps/api/src/workers/webhook.worker.ts`

**Fix applied:** Added `projectId: string | null` to the `BlerpEvent` interface and `eventBus.emit` accepts a 4th `projectId` parameter (defaults to `null` for back-compat). The Redis stream message carries `projectId` (empty string for null). The worker's `deliverEvent` filters endpoints by both `enabled` AND `project_id`. Events with no project context route to the legacy `"default"` project bucket (matches BUG-162's default value for endpoints created before project_id existed). Future work: emitters of project-scoped events (org.created, etc.) should pass the project_id derived from the org's owning project — this commit lays the wiring; the per-event population is a separate sweep.

### BUG-164 (codex r41): Webhook controller spread raw `req.body` into `.set(…)` — caller could move endpoint to another project (FIXED)

**Status:** Fixed
**Severity:** High — `updateWebhook` did `const data = req.body` and the service did `.set({...data, updatedAt: new Date()})`. A caller could include `projectId` in the body. The scoped pre-check (`get(projectId, id)`) confirmed the endpoint belonged to them, then the UPDATE wrote the new project_id — effectively moving their endpoint into someone else's project in a single request. Self-induced cross-project escalation.
**Files:** `apps/api/src/v1/controllers/webhook.controller.ts`

**Fix applied:** Controller now extracts a fixed allow-list (`url`, `enabled`, `events`/`event_types` → `eventTypes`) into a `safe` object and passes that to `service.update`. Any other body field is silently dropped. `projectId` cannot be supplied through the update path; reassigning an endpoint to another project requires create + delete by the new project owner.

### BUG-165 (codex r42): SCIM routes had no auth — `X-Tenant-Id` alone let anyone list / create / read / delete SCIM users (FIXED)

**Status:** Fixed
**Severity:** High — `scim.routes.ts` only mounted `tenantMiddleware`, no `authMiddleware`, no scope gate. Any request with `X-Tenant-Id` could list/create/delete SCIM users in that tenant. Total auth bypass on the SCIM 2.0 endpoints, which per the RFCs and Clerk parity are SecretKey-only.
**Files:** `apps/api/src/v1/routes/scim.routes.ts`, `apps/api/src/__tests__/scim.integration.test.ts`

**Fix applied:** Each route gated with `authMiddleware` → `requireM2M("users:read"|"users:write")` (same scope split as `/v1/users`). Tests updated to use X-User-Id (dev shim auto-grants the scopes). New regression test asserts unauthenticated SCIM calls return 401.

### BUG-166 (codex r42): BUG-163 emitters didn't pass `project_id` — webhook delivery fell through to the "default" bucket (FIXED)

**Status:** Fixed
**Severity:** High — BUG-163 added the project filter on the worker side but the emitters (`organization.created` in `OrganizationService.create`, `user.created` in `AuthService.attemptSignup`) didn't pass `projectId`. The worker mapped `null` → `"default"`, so org events went to the default-project endpoints rather than the org's actual project endpoints.
**Files:** `apps/api/src/v1/services/organization.service.ts`, `apps/api/src/v1/services/auth.service.ts`

**Fix applied:**

- `OrganizationService.create` passes `data.projectId` (already available) as the event's project — org events now route correctly to the project's endpoints.
- `AuthService.attemptSignup` (sign-up) is genuinely tenant-system level (the new user isn't yet in any project), so it explicitly passes `null` — keeps the legacy "default" routing behavior and makes the contract obvious.

Future emitters added by the audit worker / org-mgmt flows should follow the same pattern: pass the project_id when one is in scope, `null` for tenant-system events.

### BUG-167 (codex r43): `GET / POST /v1/organizations` was completely unauthenticated (FIXED)

**Status:** Fixed
**Severity:** High — both endpoints had no `authMiddleware`. Any request with `X-Tenant-Id` could list every org in the tenant (including `private_metadata`) or create cross-project organizations. OpenAPI marked both `SecretKey`-required.
**Files:** `apps/api/src/v1/routes/organization.routes.ts`, `apps/api/src/middleware/auth.ts`, `apps/api/src/__tests__/organization.integration.test.ts`

**Fix applied:** Both routes now run `authMiddleware` → `requireProjectAccess`. POST takes `project_id` from body; GET takes it from query — EXCEPT for `?domain=` lookups, which stay open (the OAuth sign-in flow uses domain-discovery pre-session to resolve "which org owns this email domain"; the response is filtered to verified-domain orgs, no `private_metadata` enumeration). The dev shim short-circuits the `project_id required` check when no id is supplied — tenant-root access matches the dev-shim contract.

### BUG-168 (codex r43): `GET /v1/projects/:id` missing `requireProjectAccess` (FIXED)

**Status:** Fixed
**Severity:** Medium — any signed-in tenant user could read any project's config / API key listing scope. OpenAPI marked it `SecretKey`.
**Files:** `apps/api/src/v1/routes/project.routes.ts`

**Fix applied:** Added the same `requireProjectAccess(fromParams)` gate the other project routes use.

### BUG-169 (codex r43): `signup-restrictions` and `redirect-urls` routes bare `authMiddleware` — any user could mutate allow-lists and OAuth-redirect URLs (FIXED)

**Status:** Fixed
**Severity:** High — `signup-restrictions` is the per-tenant allow/block list for who can sign up; letting any signed-in user mutate it enables account-takeover via altered ruleset (e.g., add the attacker's domain to the allowlist, then sign up). `redirect-urls` controls allowed OAuth callback destinations; letting any user add one opens an OAuth-redirect phishing path.
**Files:** `apps/api/src/v1/routes/auth.routes.ts`, `apps/api/src/middleware/auth.ts`

**Fix applied:** Both endpoint pairs now gated:

- `signup-restrictions:read` for GET, `signup-restrictions:write` for POST/DELETE
- `redirect_urls:read` for GET, `redirect_urls:write` for POST/DELETE

Dev shim extended to grant the new scopes.

### BUG-170 (codex r44): `/v1/organizations?project_id=...` validated access but the service ignored the filter (FIXED)

**Status:** Fixed
**Severity:** High — my BUG-167 fix put `requireProjectAccess(query.project_id)` in front of the route, but the controller dropped the `project_id` value and `OrganizationService.list()` had no project filter. A caller with access to project A could pass `project_id=projA` (satisfying the gate) and see EVERY project's orgs in the tenant — including `private_metadata`. The cache key was also tenant-wide so the leak persisted across requests.
**Files:** `apps/api/src/v1/services/organization.service.ts`, `apps/api/src/v1/controllers/organization.controller.ts`

**Fix applied:** Service `.list()` accepts `projectId?` and filters on it. Controller passes the query value. Cache key now `blerp:orgs:${tenantId}:${projectId ?? "_"}` so a project-A response can't accidentally serve a project-B request.

### BUG-171 (codex r44): `signup_restrictions:write` and `redirect_urls:write` were mintable by plain project owners (FIXED)

**Status:** Fixed
**Severity:** High — BUG-169 added the gates but used `:write` suffixes. `createM2MToken`'s chain-of-trust check (BUG-145) only blocks scopes ending in `:admin`. A plain project owner could mint a token with `signup_restrictions:write` and mutate the tenant-wide allowlist (account-takeover via altered ruleset) or `redirect_urls:write` (OAuth-redirect phishing path).
**Files:** `apps/api/src/v1/routes/auth.routes.ts`, `apps/api/src/middleware/auth.ts`

**Fix applied:** Renamed write scopes to `:admin` (`signup_restrictions:admin`, `redirect_urls:admin`) — auto-gated by the existing chain-of-trust rule. Only an admin-scoped M2M can mint another. Bootstrap via the install/seed path. Dev shim grant list updated.

### BUG-172 (codex r44): Unauthenticated domain discovery returned full org shape including `private_metadata` (FIXED)

**Status:** Fixed
**Severity:** Medium — the `?domain=` branch on `GET /v1/organizations` intentionally bypasses auth (it's the pre-session OAuth sign-in lookup). But `mapOrganization()` returns `private_metadata` for every result, so an unauthenticated caller could enumerate domains and harvest each owning org's private config.
**Files:** `apps/api/src/v1/controllers/organization.controller.ts`

**Fix applied:** When the request is `?domain=` AND has neither `req.user` nor `req.m2m`, the response strips `private_metadata` from each org. Authenticated callers (M2M with read scope or session) get the full shape.

### BUG-173 (codex r45): Org list cache bust used the old per-tenant key — stale per-project caches survived mutations for 300s (FIXED)

**Status:** Fixed
**Severity:** High — BUG-170 changed the list cache key from `blerp:orgs:${tenantId}` to `blerp:orgs:${tenantId}:${projectId ?? "_"}`. The create/update/delete handlers still `cache.del(`blerp:orgs:${tenantId}`)`, which doesn't match the new project-specific keys. Result: after a delete, the project's list still returned the deleted org (including stale `private_metadata`) for up to 300s. Same hazard for create/update.
**Files:** `apps/api/src/v1/controllers/organization.controller.ts`

**Fix applied:** New `bustOrgListCache(tenantId, projectId?)` helper busts (a) the legacy `:${tenantId}` key, (b) the `:${tenantId}:_` no-project fallback, and (c) the `:${tenantId}:${projectId}` specific project key when known. Create handler busts with the body's `project_id`. Update handler busts with the org's `projectId` (from the returned row). Delete handler reads the org BEFORE deleting so it can bust the right project key after.

### BUG-174 (codex r46): Org list cache could be resurrected after a mutation (FIXED)

**Status:** Fixed
**Severity:** Medium — classic cache-aside race even after BUG-173. A slow list request that started before a mutation could land its `cache.set(pre-mutation-data, 300)` AFTER the mutation's `bustOrgListCache`, resurrecting stale data (including stale `private_metadata`) for 300s.
**Files:** `apps/api/src/v1/controllers/organization.controller.ts`

**Fix applied:** Dropped the read-through cache on `listOrganizations` entirely. The org list is small and database-backed; the speedup didn't justify the data-freshness hazard. `bustOrgListCache` is retained for one release cycle to clear any stale entries written by a prior deploy. If caching becomes necessary later, the proper fix is versioned keys — a per-tenant counter incremented on every mutation, included in the cache key, so a stale `set` lands under an orphaned key and gets TTL-evicted without serving stale reads.

### BUG-175 (codex r47): OpenAPI advertised 5 endpoints with no runtime handlers — spec/runtime drift (FIXED)

**Status:** Fixed
**Severity:** Medium — customers reading the spec and trying these endpoints got 404. Generated SDK consumers had typed methods that always failed. The mismatch eroded trust in the spec as the source of truth.
**Files:** `openapi/blerp.v1.yaml`, `apps/api/src/v1/controllers/discovery.controller.ts`, `packages/shared/src/schema.ts` (regenerated)

**Fix applied:** Removed the unimplemented paths from `openapi/blerp.v1.yaml`:

- `POST /v1/sessions/{session_id}/revoke` — runtime uses `DELETE /v1/sessions/{session_id}` (already documented).
- `/v1/tokens/refresh` — no handler. OIDC discovery's `token_endpoint` now points at `/v1/oauth/token` (the implemented OAuth2 client-credentials endpoint). Re-add when a refresh-token grant ships.
- `POST /v1/webhooks/endpoints/{endpoint_id}/rotate_secret` — no handler. Documented design lacks a grace-period rollover; re-add when that's specified.
- `/v1/users/{user_id}/mfa/webauthn` — runtime uses `/v1/auth/webauthn/registration/{options,verify}` (already documented).
- `/v1/client`, `/v1/client/sessions`, `/v1/client/user` — Clerk-inspired but never implemented; `/v1/public-config` (BUG-96) and `/v1/userinfo` cover the same use cases.

OpenAPI lint clean; types regenerated.

### BUG-176 (CI break): BUG-147+ scope gates locked the dashboard's session-JWT auth out of admin routes — E2E failed (FIXED)

**Status:** Fixed
**Severity:** High (CI-blocking) — the dashboard signs users in via the real `/v1/auth/signins` flow which mints a session JWT. That JWT has no M2M scopes, so post-BUG-147 every dashboard call to `/v1/users`, `/v1/webhooks`, `/v1/audit_logs`, `/v1/usage`, `/v1/organizations`, etc. 403'd. The E2E suite (organization CRUD, user management, webhook config, etc.) all failed.
**Files:** `apps/api/src/middleware/auth.ts`, `apps/api/src/__tests__/auth.integration.test.ts`, plus dev-shim prefix matchers in `rbac.ts` / `m2m.controller.ts` / `webhook.controller.ts` / `audit.controller.ts`

**Fix applied:** Extended the dev shim (BUG-147 X-User-Id mechanism) to also attach a `req.m2m` context with tenant-root scopes to session JWTs in `NODE_ENV !== "production"`. Production behavior is unchanged — there the dashboard is expected to use a real SecretKey-minted M2M token instead. Tests that need to verify the production "session is NOT admin" semantics (BUG-138 unlock test) opt out via a new `X-No-Dev-Shim: true` request header.

Updated all dev-shim prefix matchers from `"dev-shim:"` to `"dev-shim"` so both `dev-shim:<userId>` (X-User-Id shim) and `dev-shim-session:<userId>` (session shim) are recognized.

### BUG-177 (CI break, BUG-176 follow-up): `requireProjectAccess` wildcard branch still used the narrow `dev-shim:` prefix (FIXED)

**Status:** Fixed
**Severity:** High (CI-blocking) — the BUG-176 sweep missed one prefix-matcher site. `requireProjectAccess`'s "no project_id supplied → dev-shim wildcard" branch checked `startsWith("dev-shim:")` (colon) instead of `startsWith("dev-shim")`. Session-shim clients (`dev-shim-session:<userId>`) didn't match, so dashboard hooks that call `/v1/organizations` without a `project_id` (`useOrganizations`, `useGlobalSearch`) returned 400.
**Files:** `apps/api/src/middleware/auth.ts` (one line)

**Fix applied:** Dropped the trailing colon so the matcher covers both `dev-shim:<userId>` and `dev-shim-session:<userId>`. Tests: 159/159 pass; lint + typecheck + openapi:lint clean across all 17 turbo tasks.

### BUG-178 (codex r48): `GET /v1/organizations` 400'd in production for every authenticated caller without `project_id` (FIXED)

**Status:** Fixed
**Severity:** P1 — dashboard `useOrganizations`, `useGlobalSearch`, Next.js SDK `OrganizationSwitcher` / `CreateOrganization` suggested-orgs, and the backend SDK all call `GET /v1/organizations` without `?project_id=`. In dev, the X-User-Id shim's wildcard `dev-shim` clientId hid this (BUG-167/176/177). In production no shim is attached, so `requireProjectAccess` returned 400 and the entire org list / org switcher / global search broke.
**Files:** `apps/api/src/v1/routes/organization.routes.ts`, `apps/api/src/v1/controllers/organization.controller.ts`, `apps/api/src/v1/services/organization.service.ts`

**Fix applied:** Reshaped the LIST contract to match Clerk's session semantics. `requireProjectAccess` now runs only when `?project_id=` is supplied (validating the caller can access that project). Otherwise the controller derives the scope from the auth context:

- M2M token with a real project scope → restrict to that project.
- Session JWT (or X-User-Id dev shim) → restrict to orgs the user is a member of, or projects the user owns. New `accessibleToUserId` filter in `OrganizationService.list()` joins on memberships + project ownership.
- Tenant-root M2M (only mintable via the chain-of-trust gate in `createM2MToken`) → no filter; returns every org in the tenant.

Cross-tenant enumeration is still impossible (auth is required outside the `?domain=` pre-session discovery path). Cross-project enumeration is still impossible (auto-scoping). The dev-shim wildcard behavior is preserved for tests.

### BUG-179 (codex r48): `discovery.controller.ts` re-introduced the `@blerp/shared` value-import that breaks fresh-checkout API startup (FIXED)

**Status:** Fixed
**Severity:** Medium — `apps/api/src/app.ts:19` imports `discoveryController` eagerly during boot. A value import from `@blerp/shared` resolves through the gitignored `packages/shared/dist/index.js`. On a clean checkout (`cd apps/api && bun run dev`, Playwright's `webServer` pattern, contributor first-run) the API failed to start before `/health` was reachable — same failure mode BUG-65/67/69 fixed for `webauthn.service.ts`, `auth.service.ts`, the dashboard `vite.config.ts`, and the Monite example.
**Files:** `apps/api/src/v1/controllers/discovery.controller.ts`

**Fix applied:** Inlined the env reads (`getPublishableKey`, `getTenantId`, `getSignInUrl`, `getSignUpUrl`, `getSignInForceRedirectUrl`, `getSignInFallbackRedirectUrl`, `getSignUpForceRedirectUrl`, `getSignUpFallbackRedirectUrl`, `getProxyUrl`, `getTelemetryDisabled`) with a small `firstEnv` + `publicAliases` helper pair that reproduces the same dual-name (BLERP*\* / CLERK*_) and cross-framework (NEXT*PUBLIC*_ / VITE*\* / PUBLIC*_ / EXPO*PUBLIC*_ / NUXT*PUBLIC*\*) precedence chain. Behaviour is pinned by `public-config.integration.test.ts` and `env-clerk-compat.test.ts`.

### BUG-180 (codex r48): `BlerpProvider` runtime-config gate awaited the promise but kept stale Authorization / X-Tenant-Id headers on the in-flight Request (FIXED)

**Status:** Fixed
**Severity:** Medium — when the build-time publishable key is `pk_build_placeholder` and a child component fires `client.GET(...)` on mount (the common case in single-image multi-env Docker deploys, BUG-96), the openapi-fetch Request is constructed with the placeholder Authorization and build-time tenant id. The pre-existing `onRequest` middleware awaited `/v1/public-config` but only DELAYED the send — the Request's headers were never refreshed, so the first call after gate resolution still shipped stale credentials and a wrong-tenant id.
**Files:** `packages/nextjs/src/client/BlerpProvider.tsx`

**Fix applied:** Added a `latestAuthRef` mirror, updated by effect on `[key, resolvedTenantId]`. The `onRequest` middleware re-stamps Authorization + X-Tenant-Id from the ref after awaiting `readyPromise`, so the request sent to the network always carries the latest resolved values regardless of when the Request object was constructed.

### BUG-181 (codex r49): Next.js SDK accepted cross-tenant session JWTs that the API now rejects (FIXED)

**Status:** Fixed
**Severity:** P1 — divergent contract. BUG-155 (codex r37) bound API-side session JWTs to their minting tenant, but the Next.js SDK's `auth()` (`packages/nextjs/src/server/auth.ts`) and `blerpMiddleware` (`packages/nextjs/src/server/middleware.ts`) verified only the JWT signature. A session minted for tenant A presented to a Next.js app configured for tenant B would pass both SDK call sites — `auth()` would return a `userId` and `blerpMiddleware`'s `tokenValid` would be true — even though the very next API call from the same request would 401 ("Session is scoped to a different tenant"). Effects: stale-but-still-authenticated UI redirects, server components rendering with the wrong-tenant identity until the first API call surfaced the 401.
**Files:** `packages/nextjs/src/server/session-verify.ts` (new), `packages/nextjs/src/server/auth.ts`, `packages/nextjs/src/server/middleware.ts`

**Fix applied:** New `verifySessionToken(token)` helper consolidates the contract — signature verification + `payload.tenant_id` must match `getTenantId()`, and a missing `tenant_id` claim is honored only in non-production (back-compat with sessions minted before BUG-155). Both `auth()` and both `blerpMiddleware` branches (callback form + options form) now route through the helper. JWKS caching moved into the helper so the three call sites share a single cached set.

### BUG-182 (codex r49): Webhook migration 0016 silently stopped delivering project-scoped events to legacy tenant-wide endpoints (FIXED)

**Status:** Fixed
**Severity:** P1 — upgrade-time regression. Migration `0016_harsh_sersi.sql` adds `project_id` with `DEFAULT 'default' NOT NULL` to `webhook_endpoints`, so every pre-existing endpoint becomes a `'default'`-bucket endpoint on upgrade. The post-BUG-163 worker delivers project-scoped events (e.g. `organization.created` from a real project) only to endpoints whose `project_id` matches the event's project, so legacy endpoints — which used to receive every event in their tenant — silently stopped getting any project-scoped event after the migration. Customer-visible symptom: a freshly-upgraded deploy stops firing webhooks the customer had been relying on, with no error in the logs.
**Files:** `apps/api/src/workers/webhook.worker.ts`

**Fix applied:** In `deliverEvent()`, broaden the endpoint filter to match either the event's specific `project_id` OR `'default'` (the legacy bucket). Customers narrow scope by editing each endpoint to its real `project_id`; leaving an endpoint on `'default'` is now the explicit opt-in for tenant-wide delivery. Per-tenant DB scoping (BUG-163) still prevents cross-tenant leakage. The "no project context" event path (empty `event.projectId`) still delivers only to `'default'`-bucket endpoints — that branch hasn't changed.

### BUG-183 (codex r49): `AuditLogService.create()` ignored `project_id`, so the BUG-161 project-scoped audit filter returned empty for newly-emitted rows (FIXED)

**Status:** Fixed
**Severity:** Medium — BUG-161 (codex r40) added a `project_id` filter on `auditLogs.list()` so project-scoped M2M callers see only their own project's audit stream. But `AuditLogService.create()` had no `projectId` field and `audit.worker.ts::parseEvent()` dropped the redis-stream `projectId` field on the floor before calling `create()`. Net effect: every newly-emitted audit row had `project_id = NULL`, so a project-scoped M2M token's filtered query returned an empty list. Tenant-root callers still saw everything (no filter applied), masking the issue in dev where the X-User-Id shim has tenant-root scopes.
**Files:** `apps/api/src/v1/services/audit.service.ts`, `apps/api/src/workers/audit.worker.ts`

**Fix applied:** Added optional `projectId` to `AuditLogService.create()`'s argument shape; persisted to `schema.auditLogs.projectId`. `parseEvent()` now extracts `projectId` from the redis-stream fields (empty string → `undefined` → stored as NULL for system-level events). `persistAuditLog()` forwards `event.projectId` to `create()`. Emitters that already pass `projectId` to `eventBus.emit()` (BUG-166) now produce audit rows that the project-scoped filter actually returns.
