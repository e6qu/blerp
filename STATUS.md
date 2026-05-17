# Status Log

> **Now (2026-05-18)** — Branch `chore/clerk-compliance-sweep-2026-05-17` 80 commits ahead of `main` (PR #53 in flight). BUG-46 through BUG-219 fixed across 21+ rounds of codex review on the same branch. Most recent commit `c2c5d54` (BUG-218 P1: narrow "tenant admin" to "owns every project in tenant"; BUG-219 P2: sk* admin sees whole tenant on org list).
> **Tests**: API 162/162 · Dashboard 15/15 · lint + typecheck + openapi:lint clean across 17 turbo tasks.
> **Codex review status**: r64 produced ONE clean round; r65/r66/r67 each surfaced follow-ups to earlier fixes (CSRF skip ordering, runtime-config public paths, tenant-admin scope semantics, sk* list contract). r68 attempt hit the codex usage limit (~2:56 AM reset). Need TWO consecutive clean rounds to declare convergence per PR's established rule; have one so far (r64).
> **Active blockers**: codex usage limit until ~2:56 AM (then resume r68); M9 Production Infrastructure waits on AWS credentials.
> **Next action**: re-run `codex review --base main` once the usage window resets. Detail: `DO_NEXT.md`. Open bugs / fix history: `BUGS.md`. Milestone history: `PLAN.md`.

## Recent activity (last 14 days — verbatim)

| Date (UTC) | Item                                                 | Status    | Notes                                                                                                                                                                                                         |
| ---------- | ---------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-18 | Clerk compliance sweep PR #53 — codex r60..r67 fixes | in_review | BUG-207..219 (13 bugs): tenant-root scope predicate, redirect open-redirect, CSRF skip for OAuth, public-config bypass in middleware, tenant-admin "owns every project", sk\_ tenant-wide org list, +more     |
| 2026-05-17 | Clerk compliance sweep PR #53 — codex r48..r59 fixes | in_review | BUG-178..206 (29 bugs): org list per-user scoping, inlined discovery env, BlerpProvider ref races, project-scoped admin paths, full M2M chain-of-trust, MFA brute-force lockout, audit project_id, +many more |
| 2026-05-17 | Clerk compliance sweep PR #53 — codex r1..r47 fixes  | in_review | BUG-46..BUG-177 (132 bugs): full Clerk env-var surface, dual-cookie session, JWT org claims, total_count, errors[], Svix webhooks, M2M tenant binding, scope hardening across the entire API surface, +more   |
| 2026-05-17 | Skills audit + 2 codex rounds (PR #52)               | merged    | BUG-30..BUG-45 all fixed; 39 new tests; 24 a11y fixes; WebAuthn / org / passkey OpenAPI contract                                                                                                              |
| 2026-05-16 | Claude Code Skills (PR #51)                          | merged    | 7 anti-slop / UI / context-recovery skills under `.claude/skills/`                                                                                                                                            |

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
