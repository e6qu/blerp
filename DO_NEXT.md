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

#### Phase C — Auth Flow ✅ COMPLETE

8. ~~**`useSignIn()` / `useSignUp()`** hooks~~ — ✅ PR #20 merged
9. ~~**`<TaskResetPassword />`**~~ — ✅ PR #20 merged
10. ~~**`<TaskSetupMFA />`**~~ — ✅ PR #20 merged

#### Phase E — User Object ✅ COMPLETE

11. ~~**Add `externalId`**~~ — ✅ Already in schema
12. ~~**Add MFA fields**~~ — ✅ PR #21 merged
13. ~~**Add `locked` field**~~ — ✅ Added in PR #15

### Milestone 5 — Completion (Current)

#### Task 14: `@blerp/testing` Package (In Progress)

**Completed:**

- `tokens.ts`: createTestToken(), createTestUser(), createTestOrganization(), createTestSession(), mintTestTokens()
- `playwright.ts`: BlerpTestHelper class, loginAsUser(), logout()
- `index.ts`: Export all public APIs
- `package.json` with proper exports

**Remaining:**

- Build and lint verification
- Add to turbo.json pipeline
- Create PR

15. **Global setup pattern** — E2E test infrastructure.

### Phase F — Engineering Standards

16. **Standardize error handling** — Consistent error patterns.
17. **CI/CD optimization** — Faster GitHub Actions.

### Production

18. **v1.0.0 Release** — Final tag and container deployment.
19. **Marketing & Launch** — Announce General Availability.
