# Status Log

> **Now (2026-05-18)** — Branch `chore/clerk-compliance-sweep-2026-05-17`, 98 commits ahead of `main`. **PR #53 codex-clean** at r85+r86, but CI E2E was red on the latest three head SHAs (24af12a, 8eb7da5, 47a74b5) because `tests/auth/signup.spec.ts:84` (`shows success message on successful signup`) hit a real-server regression: BUG-239 made password mandatory at `/v1/auth/signups` for `strategy=password`, but `apps/dashboard/src/components/auth/SignUp.tsx` never gathered one — every signup 400'd. Codex's "diff vs main" lens missed it because the form predated BUG-239. Logged as **BUG-247**, fixed in same PR per CLAUDE.md §7 (added password input + ≥8-char gate; updated 5 E2E tests to fill it). All 7 dashboard signup E2E tests now pass locally; awaiting CI re-run.
> **Tests**: API 162/162 · Dashboard signup E2E 7/7 local · lint + typecheck + openapi:lint clean across 17 turbo tasks.
> **Codex review trajectory**: r64 clean (1) → r65–r77 each found 1–3 follow-ups → r78 clean (2) → r79–r84 each found 1–3 follow-ups → r85 clean → r86 clean = codex convergence. CI exposed BUG-247 that codex couldn't see. Final headline categories: full `CLERK_*` / `BLERP_*` env-var surface with client-side static wrappers, dashboard session-admin admission (BUG-209/211/218), project-binding consistency across the four scope gates (requireM2M / requirePermission / requireProjectAccess / m2m-controller chain-of-trust), webhook `'default'` bucket gating (BUG-241/243), `isTenantRootM2M` + `isSessionTenantAdmin` helper consolidation (BUG-220), audit row backfill in migration 0016, `/v1/auth/*` and `/v1/organizations?domain=` middleware bypass, password gate (BUG-239) + dashboard form catchup (BUG-247).
>
> **Active blockers**: M9 Production Infrastructure waits on AWS credentials. No others.
>
> **Next action**: CI re-run on the BUG-247 fix. After green: human review + merge PR #53. After merge: pick next item from `DO_NEXT.md`. Open bugs / full fix history: `BUGS.md`. Milestone history: `PLAN.md`.

## Recent activity (last 14 days — verbatim)

| Date (UTC) | Item                                                      | Status    | Notes                                                                                                                                                                                                           |
| ---------- | --------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-18 | Clerk compliance sweep PR #53 — BUG-247 CI E2E regression | in_review | CI E2E red on three head SHAs because dashboard SignUp form never sent password after BUG-239 made it required. Fixed: added password field + ≥8-char gate; updated 5 E2E tests; 7/7 signup tests pass locally. |
| 2026-05-18 | Clerk compliance sweep PR #53 — codex-clean (r85 + r86)   | in_review | Two consecutive clean codex rounds against `main`. 201 bugs (BUG-46..246) fixed across 39 rounds. Codex couldn't see BUG-247 (server gate landed BUG-239 but pre-existing dashboard form never updated).        |
| 2026-05-18 | Clerk compliance sweep PR #53 — codex r68..r84 fixes      | in_review | BUG-220..246 (27 bugs): helper consolidation, sk\_ tenant-root exemptions across 4 gates (requirePermission/requireProjectAccess/m2m-controller/webhook), webhook default-bucket leak, audit backfill, +more    |
| 2026-05-17 | Clerk compliance sweep PR #53 — codex r48..r67 fixes      | in_review | BUG-178..219 (42 bugs): org list per-user scoping, BlerpProvider ref races, full M2M chain-of-trust, MFA brute-force lockout, audit project_id, embedded redirects, BUG-186/207 tenant-root predicate, +many    |
| 2026-05-17 | Clerk compliance sweep PR #53 — codex r1..r47 fixes       | in_review | BUG-46..177 (132 bugs): full Clerk env-var surface, dual-cookie session, JWT org claims, total_count, errors[], Svix webhooks, M2M tenant binding, scope hardening across the entire API surface, +more         |
| 2026-05-17 | Skills audit + 2 codex rounds (PR #52)                    | merged    | BUG-30..BUG-45 all fixed; 39 new tests; 24 a11y fixes; WebAuthn / org / passkey OpenAPI contract                                                                                                                |
| 2026-05-16 | Claude Code Skills (PR #51)                               | merged    | 7 anti-slop / UI / context-recovery skills under `.claude/skills/`                                                                                                                                              |

## Earlier activity (compacted — full history in `PLAN.md` § Completed Milestones)

- **2026-03-20..21** — Next.js auth overhaul (JWT middleware + CSRF + server-side org context), dashboard UX (single auth form, edit users), Monite SDK demo fully functional, backend SDK expansion (26 methods / 6 namespaces / `clerkClient()` parity), Custom Roles (C13) + M2M tokens (C5), Q1–Q7 production-quality fixes, systemic auth redesign (session JWTs replace `X-User-Id` trust), P0+P1 security (S1–S5), production stubs replaced with real WebAuthn / dynamic signup codes / 2FA, doc cleanup (−248 lines).
- **2026-03-01..19** — Dashboard UI gaps (9 phases, 31 items: sign-in, deletions, OAuth, pagination, toasts, skeletons, sessions, users, avatars), Bug fixes BUG-11..BUG-17, Monite SDK Parity + Clerk P1, P2 Production Polish (3 batches: passkeys, dark mode, global search, shortcuts, bulk ops), M8 E2E testing complete (155 tests gating CI), M12 Phase A/B/C complete.
- **2026-02-25..28** — Milestones M1–M8 complete (Core Foundations, Enterprise, Scale, Next.js Parity, Monite Parity, Clerk SDK Parity), Phase F type hardening, OpenAPI spec fix, real Monite creds wiring, M7 Phase A–E (user / control / auth / user-object), v1.0.0 release-ready tag.

## What remains

| Priority | Items                                                                                    | Why                                                                                    |
| -------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| P2       | C7 SAML connections (enterprise)                                                         | Complex XML protocol, security-critical, 4–6 week effort.                              |
| P3       | U3 theming, U4 i18n, D13 themes, D15 notification center, C8 email templates, U6 SMS MFA | UX/i18n polish + auth-channel completeness; none gate v1.                              |
| Blocked  | M9 Production Infrastructure                                                             | Requires AWS credentials.                                                              |
| Tracking | OpenAPI ↔ routes drift sweep                                                             | BUG-39/41/42 closed isolated cases; pattern suggests more drift to audit. See DO_NEXT. |

Update protocol: after each meaningful chunk, **append** a row to the "Recent activity" table with the date and one-line note. When recent activity passes 5 rows, fold the oldest entry into the "Earlier activity" compacted prose. Don't let "Recent activity" balloon — its job is to be readable at a glance.
