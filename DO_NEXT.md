# Do Next

> **Snapshot (2026-05-17)** — All milestones M1–M8 + M12 complete. PR #52 merged. PR #53 (Clerk-compliance sweep) in flight on branch `chore/clerk-compliance-sweep-2026-05-17` with BUG-46..BUG-52 fixed. Tests: 108/108 API · lint + typecheck + openapi:lint clean. Only blocker: M9 needs AWS creds.

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
- **Periodic `hidden-rot-audit` cadence.** Run the full audit before every milestone close-out. PR #52 turned up 14 findings against a "green" CI tree; PR #53 turned up 7 more in a fresh Clerk-fidelity sweep.
- **Sweep remaining `res.status(N).json({ error: { ... } })` controllers.** BUG-47 fixed the central error envelope + RBAC middleware, but ~40 hand-rolled error responses in service-call catch blocks across controllers are still singular-`error`-only. They're back-compat-safe but eventually should throw `BlerpError` subclasses to gain the `errors[]` array automatically.
- **OpenAPI `ClerkErrorEnvelope` + `total_count` schema entries.** Document the new dual error envelope and the `total_count` pagination field in the spec so generated types reflect what the server actually emits.

## Maintenance protocol

When you finish a chunk of work:

1. Append a row to `STATUS.md` "Recent activity" (date + one-line note).
2. Add a short entry under the right date in `WHAT_WE_DID.md`.
3. If you opened/closed a bug, update `BUGS.md` (keep entries terse; move long fix narratives to the PR description).
4. If priorities shifted, edit the "After PR #52 merges" section above so the _next_ thing is unambiguous.

Out-of-date docs are worse than missing docs — strip stale rows aggressively.
