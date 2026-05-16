# Do Next

### Current Status

88/88 API tests (was 49; +39 new in audit PR), 152/152 E2E tests, 15/15 Storybook tests (was 16; -1 for deleted orphan `SecurityPage.stories.tsx`), all passing. Skills audit PR (branch `chore/run-skills-audit-2026-05-17`) ran the full `.claude/skills/` suite against the post-PR-51 baseline and turned up 10 findings (BUG-30..BUG-39). All 10 fixed in the same PR per user direction — none deferred. Highlights: `WebAuthn passkey response no longer leaks credential material`, `2FA disable now reachable from the UI`, `23 icon-only buttons gained aria-label`, `OpenAPI now documents DELETE /v1/organizations/{id}`, `13 controllers gained their first integration tests`.

### Skills audit follow-ups (after this PR lands)

- **Full OpenAPI ↔ routes diff sweep.** Regenerating `packages/shared/src/schema.ts` during the BUG-34 fix produced 87+/33- lines of change vs the previously-committed file. BUG-39 closed the first concrete drift (org DELETE); the magnitude implies more endpoints in `apps/api/src/v1/routes/*.routes.ts` are missing from the spec. Sweep each route file against the spec, add the missing path entries, ensure SDK callers (`packages/backend`, `packages/nextjs`) still typecheck.
- **Capture WebAuthn transports during registration.** `mapPasskey()` currently returns `transports: []`. `@simplewebauthn/server` already provides them — add a `transports` JSON column to `passkeys` schema, populate in `verifyRegistration`, surface in the mapper.
- **Adopt design tokens beyond the initial seed.** BUG-36's fix adds the minimum (`@theme inline`); future PRs should migrate Tailwind utility usage to the named tokens where they reuse 3+ times (status pills, surface colors, focus ring color).

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
