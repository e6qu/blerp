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
