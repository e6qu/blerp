# Do Next

### Current Status

46/46 API tests, 155/155 E2E tests, 16/16 Storybook tests — all passing, CI green. Monite SDK demo path is 100% functional. Post-merge audit on 2026-03-20 found 7 production quality issues (Q1-Q7).

### Priority 1: Production Quality Fixes — 7 items

These are real bugs/stubs that should be fixed before any production deployment:

- **Q1**: `userinfo.controller.ts` uses `X-User-Id` header instead of validating access tokens — auth bypass
- **Q2**: `quota.service.ts` returns hardcoded mock values (10 users, 2 orgs, 5 sessions) — no real usage tracking
- **Q3**: OAuth service returns mock URLs/users when provider credentials not configured — should fail clearly instead
- **Q4**: `useSignUp().update()` hook stub — returns `{ status: "updated" }` without any API call
- **Q5**: `deletePasskey()` ignores `_userId` param — potential authorization bypass (deletes any passkey by ID)
- **Q6**: `keys.ts` uses `console.warn()` instead of pino structured logger
- **Q7**: `auth-guard.ts` has hardcoded test API keys (`pk_test_123`, `sk_test_123`) — should use DB lookup

### Priority 2: Enterprise — 1 item

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

### Completed (recent)

| Item                                    | Status              |
| --------------------------------------- | ------------------- |
| S3: M2M JWT verification                | ✅ Fixed 2026-03-20 |
| S4: Persistent JWKS key pair            | ✅ Fixed 2026-03-20 |
| S1+S2: Real useSignIn/useSignUp hooks   | ✅ Fixed 2026-03-20 |
| S5: Real OAuth token exchange           | ✅ Fixed 2026-03-20 |
| CI: ThemeProvider in Layout storybook   | ✅ Fixed 2026-03-20 |
| Custom Roles (C13) + M2M Tokens (C5)    | ✅ Fixed 2026-03-20 |
| SDK Quality Hardening                   | ✅ Fixed 2026-03-20 |
| Dashboard UI Gaps (P0+P1+P2, 3 batches) | ✅ Fixed 2026-03-19 |
