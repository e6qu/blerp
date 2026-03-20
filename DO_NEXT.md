# Do Next

### Current Status

46/46 API tests, 155/155 E2E tests, 16/16 Storybook tests — all passing, CI green. Monite SDK demo path is 100% functional. All production quality issues (Q1-Q7) are resolved.

### Priority 1: Systemic Auth Redesign

The `authMiddleware` trusts `X-User-Id` header without session validation for all non-M2M requests. This is the correct behavior for the current demo/dev workflow, but production deployments need real session-backed auth. This is a larger effort that affects every protected endpoint.

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
| Q1-Q7: Production Quality Fixes         | ✅ Fixed 2026-03-20 |
| S3: M2M JWT verification                | ✅ Fixed 2026-03-20 |
| S4: Persistent JWKS key pair            | ✅ Fixed 2026-03-20 |
| S1+S2: Real useSignIn/useSignUp hooks   | ✅ Fixed 2026-03-20 |
| S5: Real OAuth token exchange           | ✅ Fixed 2026-03-20 |
| CI: ThemeProvider in Layout storybook   | ✅ Fixed 2026-03-20 |
| Custom Roles (C13) + M2M Tokens (C5)    | ✅ Fixed 2026-03-20 |
| SDK Quality Hardening                   | ✅ Fixed 2026-03-20 |
| Dashboard UI Gaps (P0+P1+P2, 3 batches) | ✅ Fixed 2026-03-19 |
