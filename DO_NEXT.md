# Do Next

> **Snapshot (2026-05-18)** — All milestones M1–M8 + M12 complete. PR #52 merged. **PR #53 merge-ready**: 99 commits ahead of `main`, BUG-46..BUG-247 (202 bugs) fixed across 39 codex rounds + 1 CI E2E catchup (BUG-247 — dashboard `SignUp.tsx` predated BUG-239's password gate). CI green on `76133ea` (all 6 checks + "All Checks Passed" SUCCESS); codex r85+r86 clean. Tests: 162/162 API · 7/7 signup E2E local · CI E2E green · lint + typecheck + openapi:lint clean. PR title/body rewritten on GitHub. **Immediate next action**: human review + merge PR #53.

## Immediate — PR #53 merge

1. **Review PR #53** on GitHub: <https://github.com/e6qu/blerp/pull/53>. Title is `chore(clerk-compliance): BUG-46..BUG-247 sweep (39 codex rounds)`; body is the category-grouped summary covering env compat, error envelope/RBAC, JWT/cookies/webhooks, M2M security model, auth UX, MFA/WebAuthn/audit, org-list races, dashboard infra, OIDC hygiene, and the BUG-247 CI catchup.
2. **Merge to `main`** when the review is signed off. Branch is `MERGEABLE` per `gh pr view`, all CI green.
3. **After merge**, pick a new branch and start the next item below.

## After PR #53 merges — pick one

1. **OpenAPI ↔ routes drift sweep** _(highest leverage, 1–2 sessions)_. Regenerating `packages/shared/src/schema.ts` during BUG-34 produced 87+/33− lines of change. BUG-39, BUG-41, BUG-42 closed three concrete drifts in PR #52; the magnitude implies more. Walk each `apps/api/src/v1/routes/*.routes.ts` against the spec, add missing path entries (or correct documented response codes), regen `schema.ts`, ensure `packages/backend` and `packages/nextjs` still typecheck. Add one integration assertion per controller for the failure code each route documents.
2. **Capture WebAuthn `transports`** _(small, security-flavoured)_. `mapPasskey()` returns `transports: []` today. `@simplewebauthn/server` already surfaces transports during registration. Add a `transports` JSON column to the `passkeys` schema, populate from `verifyRegistration`, surface via the existing mapper, regen OpenAPI types.
3. **C7 SAML connections** _(4–6 weeks, enterprise blocker for a real prospect only)_. Defer until a customer asks.
4. **U3 theming / D13 appearance / U4 i18n / D15 notification center / C8 templates / U6 SMS MFA** _(P3 — UX/i18n polish)_. Pick when there's a UX owner; none gate v1.

## Blocked

| Item                         | Reason                    |
| ---------------------------- | ------------------------- |
| M9 Production Infrastructure | Requires AWS credentials. |

## Skills/process backlog (not project features)

- **Adopt design tokens for real.** BUG-36 added `font-sans`/`font-mono` (kept) and `brand-*`/`status-*` (removed in BUG-40 because no consumer migrated). Next PR that touches dashboard colour should declare the tokens **and** migrate ≥3 sites simultaneously, per `.claude/skills/design-system-check`.
- **Periodic `hidden-rot-audit` cadence.** Run the full audit before every milestone close-out. PR #52 turned up 14 findings; PR #53 turned up 174 (BUG-46..BUG-219) across 21+ codex review rounds. The strict-codex-review loop is the single most productive QA tool we have.
- **Sweep remaining `res.status(N).json({ error: { ... } })` controllers.** BUG-47 fixed the central error envelope + RBAC middleware, but ~40 hand-rolled error responses in service-call catch blocks across controllers are still singular-`error`-only. They're back-compat-safe but should throw `BlerpError` subclasses to gain the `errors[]` array automatically. Once swept, promote `errors` back to required in `openapi/blerp.v1.yaml` `ErrorResponse` (it was made optional in BUG-60 because the runtime contract was not yet uniform).
- **OpenAPI `ClerkErrorEnvelope` + `total_count` schema entries.** Document the new dual error envelope and the `total_count` pagination field in the spec so generated types reflect what the server actually emits.
- **Multi-project tenant test coverage.** BUG-218 surfaced because "owns ANY project" felt right for single-project deploys but broke in multi-project ones. Add integration tests that seed two projects with different owners and verify the BUG-209 / BUG-211 / BUG-218 admission gates correctly admit/refuse session callers.
- **Lift the shared `isTenantRootM2M` / `TENANT_ROOT_ADMIN_SCOPES` helper.** Duplicated across `audit.controller.ts` (BUG-205/207) and `organization.controller.ts` (BUG-219) with subtle differences (dev-shim treatment). Worth consolidating into `apps/api/src/middleware/auth.ts` next time a third controller needs the same predicate.
- **Lift the `isSafeRedirect` open-redirect guard.** Duplicated in `Auth.tsx` + `SignUp.tsx` (BUG-208). Move to `@blerp/shared` or a `packages/nextjs/src/client/lib/safe-redirect.ts` next time a third surface adopts it.

## Maintenance protocol

When you finish a chunk of work:

1. Append a row to `STATUS.md` "Recent activity" (date + one-line note).
2. Add a short entry under the right date in `WHAT_WE_DID.md`.
3. If you opened/closed a bug, update `BUGS.md` (keep entries terse; move long fix narratives to the PR description).
4. If priorities shifted, edit the "After PR #53 merges" section above so the _next_ thing is unambiguous.

Out-of-date docs are worse than missing docs — strip stale rows aggressively.
