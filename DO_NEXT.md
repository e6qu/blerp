# Do Next

### Current Status

46/46 API tests, 155/155 E2E tests passing. All P0 security and P1 quality gaps resolved (S1-S5). SDK hardening + Custom Roles (C13) + M2M Tokens (C5) + JWT verification + persistent JWKS + real hooks + real OAuth all complete.

### Priority 0: Security — ✅ All resolved

- ~~S3: M2M JWT signature not verified~~ — Fixed 2026-03-20: `jwtVerify()` with unified persistent key pair

### Priority 1: Production Quality — ✅ All resolved

- ~~S4: JWKS key pair in-memory~~ — Fixed 2026-03-20: PEM persistence to `keys/` directory
- ~~S1: `useSignIn()` hook stubbed~~ — Fixed 2026-03-20: wired to real API
- ~~S2: `useSignUp()` hook stubbed~~ — Fixed 2026-03-20: wired to real API
- ~~S5: OAuth token exchange mocked~~ — Fixed 2026-03-20: real GitHub/Google exchange with env var fallback

### Priority 2: Remaining — 1 item

**Backend:**

- C7: SAML connections (enterprise SSO) — complex XML protocol, security-critical, 4-6 week effort. Deferred.

### Priority 3: Future — 6 items

**Internationalization & UX:**

- U3: Theming / appearance API — CSS variable customization for white-labeling
- U4: i18n / localization — multi-language UI support
- D13: Appearance customization — theme preset beyond dark/light
- D15: Notification center — in-app notification feed

**Auth channels:**

- C8: Email/SMS templates — customizable transactional email content
- U6: SMS MFA — SMS-based second factor (TOTP already covers MFA)

### Blocked

| Item                         | Reason                   |
| ---------------------------- | ------------------------ |
| M9 Production Infrastructure | Requires AWS credentials |

### Completed

| Milestone                         | Status                                                                                                                      |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| M1-M8                             | Core platform, enterprise, SDKs, E2E testing                                                                                |
| M12                               | Dashboard feature completion                                                                                                |
| Dashboard UI Gaps P0+P1           | 9 phases (sign in, deletions, accounts, pagination, toasts, skeletons, sessions, users, avatars)                            |
| Monite SDK Parity (M1-M6)         | OrgSwitcher props, createRouteMatcher, clerkClient factory                                                                  |
| Clerk P1 Quality (C9-C11, D1, D6) | User search/sort, org pagination, audit filtering, error boundaries                                                         |
| P2 Production Polish Batch 1      | Passkey rename, user restore, revoke-all sessions, phone CRUD, leave/edit org, responsive layout, form validation           |
| P2 Production Polish Batch 2      | Session IP capture (C12), allowlist/blocklist (C1+C2), OrganizationList (U1), magic links (C3), webhook delivery logs (D11) |
| P2/P3 Batch 3                     | Dark mode (U2), global search (D8), keyboard shortcuts (D9), redirect URLs (C6), testing tokens (C4), bulk operations (D10) |
| SDK Quality Hardening             | Fixed @blerp/nextjs stubs: real currentUser(), BlerpProvider auth hydration, real has(), real SignIn/SignUp                 |
| Custom Roles (C13)                | DB table, CRUD service/controller/routes, dynamic RBAC, dashboard role dropdown                                             |
| M2M Tokens (C5)                   | DB table, client_credentials grant, CRUD endpoints, Bearer token middleware                                                 |
