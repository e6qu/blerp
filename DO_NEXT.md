# Do Next

### Current Status

49/49 API tests, 155/155 E2E tests, 16/16 Storybook tests — all passing, CI green. Monite SDK demo fully functional end-to-end with org switching and Payables SDK. Next.js SDK auth overhaul complete — JWT middleware verification, CSRF tokens, server-side org context + membership roles. Dashboard UX improved — single auth form, post-login redirect, edit users. Pre-commit hook runs full `bun run lint` matching CI.

### Priority 1: Enterprise — 1 item

- C7: SAML connections (enterprise SSO) — complex XML protocol, security-critical, 4-6 week effort. Deferred.

### Priority 2: Future — 6 items

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

| Item                                                      | Status              |
| --------------------------------------------------------- | ------------------- |
| Next.js auth overhaul (JWT middleware, CSRF, org context) | ✅ Done 2026-03-21  |
| Dashboard UX (single auth form, edit users)               | ✅ Done 2026-03-21  |
| Monite SDK demo fully functional                          | ✅ Done 2026-03-21  |
| Pre-commit lint alignment with CI                         | ✅ Done 2026-03-21  |
| Systemic auth redesign (JWT sessions)                     | ✅ Done 2026-03-20  |
| Q1-Q7: Production Quality Fixes                           | ✅ Fixed 2026-03-20 |
| S3: M2M JWT verification                                  | ✅ Fixed 2026-03-20 |
| S4: Persistent JWKS key pair                              | ✅ Fixed 2026-03-20 |
| S1+S2: Real useSignIn/useSignUp hooks                     | ✅ Fixed 2026-03-20 |
| S5: Real OAuth token exchange                             | ✅ Fixed 2026-03-20 |
| Custom Roles (C13) + M2M Tokens (C5)                      | ✅ Fixed 2026-03-20 |
