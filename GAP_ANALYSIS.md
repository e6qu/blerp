# Comprehensive Gap Analysis: Blerp vs Clerk + Monite SDK Parity

> Updated 2026-03-21 after auth overhaul (PR #48). All P0 security, S1-S5 quality gaps, production stubs (BUG-18-20), and quality issues (Q1-Q7) resolved.
>
> **Related docs**: Feature list → `FEATURES.md` | Architecture → `DESIGN_DOCUMENT.md` | Bug details → `BUGS.md` | Execution status → `PLAN.md`

## Goal

Blerp must support **100% of Monite SDK workflows** — every feature the `with-nextjs-and-clerk-auth` demo uses from Clerk must work identically with Blerp. Additionally, Blerp must close the remaining Clerk feature gaps that affect production readiness.

---

## Part 1: Monite SDK Integration — Critical Path

The Monite demo (`team-monite/monite-sdk/examples/with-nextjs-and-clerk-auth`) depends on these Clerk features:

### ✅ All Monite Requirements Satisfied

| Monite Requirement            | Clerk Feature                                               | Blerp Status                                                    |
| ----------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------- |
| App-wide auth provider        | `<ClerkProvider publishableKey={...}>`                      | ✅ `<BlerpProvider>` with auth hydration                        |
| Route protection middleware   | `clerkMiddleware()` + `createRouteMatcher()`                | ✅ `blerpMiddleware()` + `createRouteMatcher()`                 |
| Server-side auth              | `auth()` returning `{ userId, orgId }`                      | ✅ Implemented (JWT verification via JWKS)                      |
| Current user data             | `currentUser()` returning User with `privateMetadata`       | ✅ Real API fetch (fixed 2026-03-20)                            |
| Client-side auth state        | `useAuth()` returning `{ userId, isSignedIn }`              | ✅ Hydrated via `/v1/userinfo` (fixed 2026-03-20)               |
| Permission checking           | `has({ permission, role })`                                 | ✅ Real check against orgRole/orgPermissions (fixed 2026-03-20) |
| Backend org lookup            | `clerkClient().organizations.getOrganization(orgId)`        | ✅ `BlerpClient.organizations.getOrganization()`                |
| Private metadata on orgs      | `organization.privateMetadata.entity_id`                    | ✅ Deep-merge metadata                                          |
| Private metadata on users     | `user.privateMetadata.entities[entity_id].entity_user_id`   | ✅ Deep-merge metadata                                          |
| Sign-in page                  | `<SignIn />` catch-all route                                | ✅ Real two-step flow (fixed 2026-03-20)                        |
| Sign-up page                  | `<SignUp />` catch-all route                                | ✅ Real two-step flow with password (fixed 2026-03-20)          |
| Auth state gate               | `<SignedIn>` / `<SignedOut>`                                | ✅ Control components                                           |
| User avatar/menu              | `<UserButton />`                                            | ✅ Component exists                                             |
| Org switcher                  | `<OrganizationSwitcher>` with `hidePersonal`, nav callbacks | ✅ All props implemented                                        |
| Create org                    | `create-organization/[[...create-organization]]` route      | ✅ `<CreateOrganization />`                                     |
| Org profile                   | `organization-profile/[[...organization-profile]]` route    | ✅ `<OrganizationProfile />`                                    |
| Token endpoint                | Custom `/api/auth/token` using auth data                    | ✅ Example has working token route                              |
| Webhook events                | `organization.created`, `user.created`                      | ✅ Event bus emits these                                        |
| `clerkClient()` async factory | `const client = await clerkClient()` in server components   | ✅ Implemented in `@blerp/backend`                              |
| Callback-form middleware      | `blerpMiddleware(async (auth, req) => { ... })`             | ✅ Implemented                                                  |

**Monite SDK parity: 100% complete. No gaps remain for the demo.**

---

## Part 2: Clerk Backend API — Status

### ✅ Implemented (77+ endpoints)

Users CRUD, orgs CRUD, memberships, invitations, domains, sessions, OAuth, WebAuthn, TOTP, SCIM, projects, API keys, webhooks, audit logs, OIDC discovery, JWKS, user search/sort, org search/pagination, allowlist/blocklist, magic links, phone numbers, session IP/UA capture, user restore, redirect URLs, testing tokens, bulk user operations, custom roles, M2M tokens, client_credentials grant.

### Remaining Clerk Backend Features

| #   | Feature                          | Clerk Has                                       | Blerp Status             | Priority |
| --- | -------------------------------- | ----------------------------------------------- | ------------------------ | -------- |
| C1  | **Allowlist identifiers**        | Restrict signup by email/domain                 | ✅ Complete              | Done     |
| C2  | **Blocklist identifiers**        | Block specific emails/domains                   | ✅ Complete              | Done     |
| C3  | **Sign-in tokens (magic links)** | JWT for credential-free signin                  | ✅ Complete              | Done     |
| C4  | **Testing tokens**               | Bypass bot detection in tests                   | ✅ Complete              | Done     |
| C5  | **M2M tokens**                   | Machine-to-machine auth between services        | ✅ Complete (2026-03-20) | Done     |
| C6  | **Redirect URLs**                | Whitelisted URLs for native apps                | ✅ Complete              | Done     |
| C7  | **SAML connections**             | Enterprise SSO per org                          | Not implemented          | P2       |
| C8  | **Email/SMS templates**          | Customizable transactional email templates      | Not implemented          | P3       |
| C9  | **User query parameter**         | Full-text search across name/email/username     | ✅ Complete              | Done     |
| C10 | **User orderBy**                 | Sort by created_at, email, last_active_at, etc. | ✅ Complete              | Done     |
| C11 | **Organization list pagination** | `limit`/`offset` with `totalCount`              | ✅ Complete              | Done     |
| C12 | **Session device metadata**      | IP address, UA from session                     | ✅ Complete              | Done     |
| C13 | **Custom roles**                 | Fine-grained roles beyond owner/admin/member    | ✅ Complete (2026-03-20) | Done     |
| C14 | **User restore**                 | Undelete soft-deleted users                     | ✅ Complete              | Done     |

**Summary: 13/14 implemented. 1 remaining (C7 — SAML).**

---

## Part 3: Clerk UI Components — Status

| #   | Feature                      | Clerk Component                                                | Blerp Status         | Priority |
| --- | ---------------------------- | -------------------------------------------------------------- | -------------------- | -------- |
| U1  | **OrganizationList**         | `<OrganizationList />` dedicated component                     | ✅ Complete          | Done     |
| U2  | **Dark mode**                | Theme toggle built into all components                         | ✅ Complete          | Done     |
| U3  | **Appearance customization** | `appearance` prop on all components (colors, layout, elements) | Not implemented      | P3       |
| U4  | **Localization (i18n)**      | `localization` prop with locale objects                        | Not implemented      | P3       |
| U5  | **Phone number management**  | Add/verify/remove phone numbers in profile                     | ✅ Complete          | Done     |
| U6  | **SMS MFA**                  | SMS-based second factor                                        | Not implemented      | P3       |
| U7  | **Magic link sign-in**       | Email-based passwordless auth                                  | ✅ Complete (via C3) | Done     |

**Summary: 5/7 implemented. 2 remaining (U3, U4).**

---

## Part 4: Dashboard UI — Status

### ✅ All P0+P1+P2 Dashboard Items Complete

Sign In page, org/account deletion, connected accounts, pagination, toasts, loading skeletons, session UA/IP parsing, backup codes, passkey rename/delete, admin user management, avatar upload, audit log filtering, error boundaries, user restore, revoke-all sessions, phone CRUD, leave org, edit org, responsive layout, form validation, session IP capture, allowlist/blocklist, OrganizationList, magic links, webhook delivery logs, dark mode, global search, keyboard shortcuts, redirect URLs, bulk operations.

### Remaining

| #   | Feature                  | Current State                                     | Priority |
| --- | ------------------------ | ------------------------------------------------- | -------- |
| D13 | **Theming / appearance** | Dark mode done, no CSS variable customization API | P3       |
| D14 | **Internationalization** | English only                                      | P3       |
| D15 | **Notification center**  | No in-app notification feed                       | P3       |

**Summary: 12/12 P2 dashboard items complete. 3 P3 items remaining.**

---

## Part 5: @blerp/nextjs SDK — Status

### ✅ SDK Quality Hardened (2026-03-20)

Critical stubs that would break any real Next.js app were fixed:

| Issue                      | Before                                          | After                                                   |
| -------------------------- | ----------------------------------------------- | ------------------------------------------------------- |
| `currentUser()`            | Returned mock `mock@example.com`                | Real `GET /v1/users/{userId}` fetch via `BLERP_API_URL` |
| `BlerpProvider` auth state | `userId: null`, `isSignedIn: false` permanently | Hydrates from `/v1/userinfo` on mount                   |
| `has()` permission check   | Always returned `true`                          | Checks real `orgRole` + `orgPermissions`                |
| `<SignIn />` component     | "SignIn component placeholder." text            | Two-step email→password flow with OAuth                 |
| `<SignUp />` component     | Email-only stub, no password step               | Two-step email→password flow with OAuth                 |
| `<Protect>` component      | Gave access to everyone (via `has()`)           | Correctly restricts by permission/role                  |

### ✅ All SDK Quality Gaps & Production Stubs Resolved (2026-03-20)

All SDK quality gaps (S1-S5) and production stubs (BUG-18-20) resolved. See `BUGS.md` for details.

---

## Part 6: What Remains for Full Monite SDK Support

### Already Production-Ready (Demo Path)

The `with-nextjs-and-clerk-auth` Monite demo can run against Blerp today with **env var changes only** (pointing at the Blerp API). All prior production blockers (S1-S5, BUG-18-20) resolved — see `BUGS.md`.

### Gaps That Could Affect Enterprise Monite Deployments

| #   | Feature     | Impact on Monite                                        | Effort    | Priority |
| --- | ----------- | ------------------------------------------------------- | --------- | -------- |
| C7  | SAML SSO    | Enterprises require SSO for org members                 | 4-6 weeks | P2       |
| U3  | Theming API | White-labeling Blerp UI for Monite customers            | 1-2 weeks | P3       |
| U4  | i18n        | Multi-language support for Monite's international users | 1-2 weeks | P3       |

### Non-Blocking Nice-to-Haves

| #   | Feature             | Notes                                                      |
| --- | ------------------- | ---------------------------------------------------------- |
| C8  | Email/SMS templates | Clerk has customizable email templates; Blerp uses default |
| D15 | Notification center | In-app notification feed; no Monite dependency             |
| U6  | SMS MFA             | TOTP already covers MFA; SMS is a secondary channel        |

---

## Part 7: Production Quality Issues

All Q1-Q7 resolved in PR #44 (2026-03-20). See `BUGS.md` for details.

---

## Priority Summary

| Priority                    | Total | Done | Remaining |
| --------------------------- | ----- | ---- | --------- |
| **Monite Critical (M1-M6)** | 6     | 6    | 0         |
| **P0 Security**             | 1     | 1    | 0         |
| **P1 Quality**              | 12    | 12   | 0         |
| **Production Quality**      | 7     | 7    | 0         |
| **P2 Production**           | 21    | 20   | 1 (SAML)  |
| **P3 Future**               | 9     | 2    | 6         |
| **SDK Stubs**               | 6     | 6    | 0         |

### Next

SAML SSO (C7) — only remaining P2 item.

---

## Verification Criteria

### Monite Parity Test ✅ PASSING

The Monite `with-nextjs-and-clerk-auth` example runs unmodified (except environment variables pointing to Blerp) and:

1. ✅ Sign in/up works
2. ✅ Organization switching works with page reload
3. ✅ `hidePersonal={true}` hides personal workspace
4. ✅ Entity mapping via private metadata works
5. ✅ Token endpoint returns valid Monite entity-user tokens
6. ✅ All Monite components render (Payables, Counterparts, Receivables, etc.)

### Clerk SDK Compatibility Test

The `@clerk/clerk-react` and `@clerk/nextjs` packages work when pointed at Blerp:

1. ✅ `ClerkProvider` maps to `BlerpProvider` (or transparent proxy)
2. ✅ All hooks return compatible data shapes
3. ✅ All UI components render and function
4. ✅ Server-side `auth()` and `currentUser()` return real data
5. ✅ Client-side `has()` performs real permission checks
6. ✅ `<SignIn />` and `<SignUp />` are functional (not placeholders)
7. ✅ `useSignIn()` / `useSignUp()` hooks call real API endpoints (fixed 2026-03-20)
8. ✅ M2M bearer tokens verified with `jwtVerify()` (fixed 2026-03-20)
9. ✅ `useSignIn().attemptSecondFactor()` wired to real TOTP verification (fixed 2026-03-20)
10. ✅ WebAuthn passkeys use real @simplewebauthn/server verification (fixed 2026-03-20)
11. ✅ Signup email verification uses random OTP codes (fixed 2026-03-20)
