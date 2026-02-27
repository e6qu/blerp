# Do Next

Prioritized list of upcoming actions based on Clerk parity gap analysis.

### Milestone 7 — Clerk SDK Parity (Priority)

#### Phase A — User Components (Highest Priority)

1. **`<UserProfile />`** — Full user profile management with tabs (Account, Security, Connected Accounts).
2. **`<UserButton />`** — User dropdown with sign out, profile links, org switcher.
3. **`useUser()` hook** — Full User object access from frontend.
4. **`useClerk()` hook** — Expose full Blerp client object.

#### Phase B — Control Components

5. **`<SignedIn />` / `<SignedOut />`** — Conditional rendering components.
6. **`<ClerkLoaded />` / `<ClerkLoading />`** — Loading state components.
7. **Redirect components** — RedirectToSignIn, RedirectToSignUp, RedirectToUserProfile.

#### Phase C — Auth Flow

8. **`useSignIn()` / `useSignUp()`** hooks — Full auth flow control.
9. **`<TaskResetPassword />`** — Password reset flow component.
10. **`<TaskSetupMFA />`** — MFA setup component.

#### Phase E — User Object

11. **Add `externalId`** — External system ID mapping.
12. **Add MFA fields** — totpEnabled, backupCodeEnabled, twoFactorEnabled.
13. **Add `locked` field** — Account lock status.

### Milestone 5 — Completion

14. **`@blerp/testing` package** — Playwright helpers and token minting.
15. **Global setup pattern** — E2E test infrastructure.

### Phase F — Engineering Standards

16. **Standardize error handling** — Consistent error patterns.
17. **CI/CD optimization** — Faster GitHub Actions.

### Production

18. **v1.0.0 Release** — Final tag and container deployment.
19. **Marketing & Launch** — Announce General Availability.
