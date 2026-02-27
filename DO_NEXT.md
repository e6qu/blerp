# Do Next

Prioritized list of upcoming actions based on Clerk parity gap analysis.

### Milestone 7 — Clerk SDK Parity (Priority)

#### Phase A — User Components ✅ COMPLETE

1. ~~**`<UserProfile />`**~~ — ✅ PR #15 merged
2. ~~**`<UserButton />`**~~ — ✅ PR #16 merged
3. ~~**`useUser()` hook**~~ — ✅ PR #17 merged
4. ~~**`useClerk()` hook**~~ — ✅ PR #17 merged

#### Phase B — Control Components ✅ COMPLETE

5. ~~**`<SignedIn />` / `<SignedOut />`**~~ — ✅ PR #19 merged
6. ~~**`<ClerkLoaded />` / `<ClerkLoading />`**~~ — ✅ PR #19 merged
7. ~~**Redirect components**~~ — ✅ PR #19 merged

#### Phase C — Auth Flow (Current)

8. **`useSignIn()` / `useSignUp()`** hooks — Full auth flow control.
9. **`<TaskResetPassword />`** — Password reset flow component.
10. **`<TaskSetupMFA />`** — MFA setup component.

#### Phase E — User Object

11. **Add `externalId`** — External system ID mapping.
12. **Add MFA fields** — totpEnabled, backupCodeEnabled, twoFactorEnabled.
13. ~~**Add `locked` field**~~ — ✅ Added in PR #15

### Milestone 5 — Completion

14. **`@blerp/testing` package** — Playwright helpers and token minting.
15. **Global setup pattern** — E2E test infrastructure.

### Phase F — Engineering Standards

16. **Standardize error handling** — Consistent error patterns.
17. **CI/CD optimization** — Faster GitHub Actions.

### Production

18. **v1.0.0 Release** — Final tag and container deployment.
19. **Marketing & Launch** — Announce General Availability.
