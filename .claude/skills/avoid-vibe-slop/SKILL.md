---
name: avoid-vibe-slop
description: Project-local checklist that loads before any non-trivial code change in blerp. Refuses fake/fallback/anemic patterns, fake tests, fake implementations, dead-attempt code paths. Use proactively whenever about to write or modify TypeScript/TSX, modify an API controller, add a test, stage a fix, or touch the dashboard. Pairs with hidden-rot-audit, frontend-slop-check, clerk-monite-fidelity.
---

# Avoid vibe-coding slop (blerp)

Blerp is a Clerk + Monite SDK clean-room reimplementation that grew fast under AI coding. **Hands-on human testing has been minimal**, so this repo carries an above-average load of dead code, fake/asserts-nothing tests, half-finished UI, abandoned past attempts, and silently-failing flows. This skill is the runtime checklist before each substantial edit. It is anchored in `CLAUDE.md` § 6–7 (Testing Philosophy + Zero Tolerance).

## When this skill applies

- Before writing or modifying any `.ts` / `.tsx` under `apps/`, `packages/`, or `examples/`.
- Before writing or modifying an Express controller under `apps/api/src/v1/controllers/`.
- Before writing or modifying a React component under `apps/dashboard/src/components/` or `apps/dashboard/src/stories/`.
- Before adding a test (Vitest, Playwright, Storybook test).
- Before staging a "fix" for a bug, especially one entered in `BUGS.md`.
- NOT for: typo/comment-only edits, status-log updates, markdown-only docs (but `STATUS.md` / `DO_NEXT.md` / `WHAT_WE_DID.md` still need updating per `AGENTS.md` step 2).

## The checklist

Stop after each "no" and resolve it before writing code.

### Truth and SDK fidelity (Clerk + Monite are the references)

1. **Has someone already implemented this in the repo?** Grep for the function / route / component name across `apps/api/src`, `apps/dashboard/src`, and `packages/`. If yes, extend it — never re-implement. Bonus search: include `packages/nextjs/src` and `packages/backend/src` because SDK parity work duplicates surface across packages.
2. **What does the reference SDK actually do?** Clerk for auth/user/org/sessions; Monite for entities/payables/receivables. If you can't name the Clerk method (`clerkClient.users.getUser`) or Monite endpoint (`/entities/{id}/payables`) you're imitating, you don't know if the change is right. See `GAP_ANALYSIS.md`, `MONITE_SDK_CLERK_DATA.md`, `MONITE_SDK_CLERK_LIVE_DEPENDENCIES.md`.
3. **Is the response shape camelCase or snake_case?** OpenAPI schema + dashboard expect snake_case; Drizzle ORM hands you camelCase. Always map with a `mapX()` helper (see `mapWebhook`, `mapInvitation`, `mapDomain`, `mapMembership`, `mapUser` in `apps/api/src/v1/controllers/`). BUG-3 is the canonical example.
4. **If you're adding a fallback branch — is it actually a fallback, or is it lying about success?** Returning `{ data: [] }` when the upstream is unavailable is the same shape as success. Default answer: throw, return 5xx, or surface a real loading/error state in the UI. Never fabricate.
5. **Silently catching an error?** `try { ... } catch (e) { console.log(e) }` is forbidden. Either re-throw, return a typed error, or use the project's `ErrorBoundary` / Pino structured logger. The Express pino-http logger lives at `apps/api/src/middleware/`.

### Plan and root cause

6. **Is this the right fix, or the quick fix?** If you'd be embarrassed to explain it in a PR review, it's the quick fix. Per `CLAUDE.md` § 7, "I'll add a TODO" is not acceptable — fix it in this commit or stage it as a tracked entry in `PLAN.md` / `DO_NEXT.md`.
7. **Have you read at least one nearby file for the surrounding pattern?** Controller conventions, hook patterns, modal patterns, route patterns — they all have established shapes in this repo (e.g., every modal in `apps/dashboard/src/components/auth/*Modal.tsx` follows the same form-state + react-query mutate pattern).
8. **Stacking guards (`if (user?.organization?.membership?.role ...)`)?** What's the real bug — a missing JOIN, a wrong type, a missing mapper? Five-deep optional chains hide root causes.
9. **Refactor to delegate via a hook or service?** Audit every defensive layer in the original — empty-state, loading-skeleton, error-toast, CSRF inclusion. Delegation often drops the defenses silently. Compilers don't catch this.
10. **Bulk text rewrite across many files?** Use language-aware tools: `bunx tsc --noEmit` after every batch, `bunx eslint --fix`, AST tools when needed. Never trust `sed` on TSX — JSX rewrites eat closing tags. After any bulk rewrite: `bun run typecheck && bun run lint && bun run test`.

### Tests and fidelity (HIGH RISK in this repo)

11. **Are you adding a test?** It must drive a real surface. For API: real Express app + real SQLite (`apps/api/tests` patterns) — never mock Drizzle. For dashboard: Playwright against a real running `apps/api` + `apps/dashboard` (the `playwright.config.ts` `webServer` block starts both). For unit Vitest in dashboard: render real components; only mock at the network boundary via MSW (`apps/dashboard/src/mocks/`).
12. **Is the assertion derived from spec or implementation?** Spec = OpenAPI in `openapi/blerp.v1.yaml` + Clerk/Monite SDK reference. If you wrote the assertion by reading the code you just wrote, you're testing yourself.
13. **`expect(x).toBeTruthy()` / `expect(x).toBeDefined()` as the ONLY assertion?** That's a fake test. Re-derive from the contract: what shape, what field values, what status code. CLAUDE.md § 6 forbids "loosening assertions to hide bugs."
14. **`test.skip()` / `test.fixme()` / `xtest()` / `describe.skip()` / `xit()` anywhere in your diff?** Stop. Document the bug in `BUGS.md` and ask the user. Skipping silently is the highest-severity violation in this repo.
15. **Did the test actually run AND fail before your fix, then pass after?** Without that loop you cannot claim the test is meaningful. Run `bun run test` (Vitest) or `bun run test:e2e` (Playwright in `apps/dashboard`) and capture the output.
16. **Sweep test fixtures for the same strings you cleaned from production code.** A grep for the stripped substring will find anchored snapshot tests before CI does.

### Comments, abstraction, pruning

17. **Default: write no comments.** Add one only when the _why_ would surprise a reader. Restating signatures is forbidden. Never leave a `// TODO`, `// FIXME`, `// HACK`, `// for now`, `// temporary`. Grep for them in your diff before committing.
18. **About to add a factory / provider / manager for one call-site?** Stop. Three similar lines beats premature abstraction.
19. **Did your change DELETE anything?** AI is an expansion engine. A diff that's only additions is feeding hidden rot — look for dead helpers, retired modal variants, stale mappers, unused exports. See `hidden-rot-audit` skill.
20. **Behaviour changed → did you sync docs?** READMEs, `GAP_ANALYSIS.md`, `FEATURES.md`, `DESIGN_DOCUMENT.md`, OpenAPI spec (`openapi/blerp.v1.yaml`), and any per-component `*.stories.tsx`. Wrong docs are worse than missing docs.

### Dependencies (Bun-only, slop-squatting risk)

21. **Is the package real?** Before `bun add <name>`, confirm on `npmjs.com` it exists, is current, has weekly downloads, has a real repo. Slop-squatted package names are weaponised malware.
22. **Is the package needed at all?** Blerp already includes React Query, Lucide React, openapi-fetch, Tailwind v4, MSW, Playwright, Vitest, Storybook 10. Don't add a date library when the dashboard renders `created_at` already. Check `apps/dashboard/package.json` + `packages/shared/package.json` first.
23. **NEVER switch to npm/pnpm/yarn.** `CLAUDE.md` Tooling Mandate. If a package needs install scripts and Bun can't run them, replace the package.

### Destructive actions

24. **About to run `rm -rf`, `bun pm cache rm`, `git reset --hard`, `git push --force`, `drizzle-kit drop`, or wipe `apps/api/tenants/`?** Stop. Ask first. Same rule for `bun install` with no lockfile present.
25. **Touching `keys/`, `.env*`, or any file matching `*secret*` / `*credential*` / `*.pem` / `*.key`?** Stop. Read-only inspection only. Never commit. Cross-check `.gitignore` (`keys/` is already ignored).

### Context, commit, and re-verification discipline

26. **Did the conversation just compact?** Run the `context-recovery` skill: re-read `STATUS.md`, `DO_NEXT.md`, the last 2 commits, `BUGS.md` open section, and the relevant skill files. Context-amnesia silently rewrites prior decisions.
27. **Did you just claim something works?** Did you actually run it? "Works" without a captured shell prompt + output is suspicious. For UI: did you load the page in a browser? See `ui-verification` skill — type-check and tests verify code correctness, not feature correctness.
28. **After `git commit` reports success, did you run `git log --oneline -1`?** Pre-commit + lint-staged auto-fixes can roll back a commit silently. "Hook passed" ≠ "commit landed".
29. **First-pass review is sycophantic-by-default.** Before closing a BUG or finishing a substantial change, do a re-verification pass with fresh eyes. Re-grep the area for `TODO`, `any`, `as `, `// @ts-ignore`, `console.log`, `mock`, `fake`, `dummy`, `placeholder`.
30. **PR mandate.** Per `CLAUDE.md`, STOP after creating a PR. Do not start the next milestone. Do not amend without explicit ask.

## Failure modes to recognise in your own output

Stop and rewrite if you catch yourself producing any of these:

- "This _should_ work" — claim without test.
- "I've added comprehensive error handling" — followed by `try { ... } catch (e) { console.log(e) }` or empty catch.
- "Let me add a fallback for now" — silent-success pattern, always wrong.
- `// TODO: fix this properly later` — not allowed; track in `PLAN.md` / `DO_NEXT.md` or do it now.
- "Backward-compatibility shim" in code that has no users — `packages/nextjs`, `packages/backend` are unreleased; no shims needed.
- `expect(x).toBeTruthy()` as the only assertion.
- `test.skip()` / `xtest()` to make CI green.
- `as any`, `as unknown`, `@ts-ignore`, `eslint-disable` — violates `CLAUDE.md` Engineering Standards.
- A diff that's only additions, no deletions — pattern of pruning failure.
- 47 files touched for a one-call-site change.
- "Looks good to me" on your own work after a single pass — re-read with fresh eyes.
- Adding a UI component without a corresponding `*.stories.tsx` when sibling components have one.
- Adding an API endpoint without a `mapX()` snake_case mapper when sibling endpoints have one.
- Commit message says "tests pass" but no `bun run test` / `bun run test:e2e` output is in the conversation.
- "Pre-existing failure, not my change" — `CLAUDE.md` § 7 zero-tolerance. Fix it AND log in `BUGS.md`.

## Blerp-specific invariants (load-bearing; do not violate)

- **Bun-only.** `bun install`, `bun run`, `bunx`. Never npm/pnpm/yarn.
- **No `any`, no type ignores.** Use unions, optionals, or generics. Casts (`as`) only as a documented last resort.
- **Imperative shell, pure core.** Side effects at the edges; logic in pure functions.
- **snake_case at the API boundary.** Always map Drizzle camelCase → snake_case in the controller.
- **CSRF on mutations from the dashboard.** Backed by `csrf-csrf` middleware; the dashboard reads + forwards the token.
- **Pino structured logs.** No `console.log` in `apps/api/src`. UI may use `console.warn` / `console.error` only inside `ErrorBoundary`-equivalent paths.
- **Storybook stories live next to the component** (`Component.tsx` + `Component.stories.tsx`).
- **Playwright tests in `apps/dashboard/tests/`**, organized by feature (auth, organizations, settings, ui, user, access, admin).
- **OpenAPI `openapi/blerp.v1.yaml` is the API contract.** `bun run openapi:lint` must pass.
- **Tailwind v4 CSS-first config.** No `tailwind.config.js`; design tokens live in `apps/dashboard/src/index.css` via `@theme`. See `design-system-check` skill.
- **Never auto-merge PRs.** Per `CLAUDE.md` PR Mandate, user merges every one.

## Make the type system catch what discipline misses

When a class of bug can be enforced at compile time, prefer the type-system fix. Concrete patterns that work here:

- **Branded / opaque IDs.** `type UserId = string & { __brand: "UserId" }` so the compiler rejects `OrganizationId` where `UserId` was expected. Phase F type-hardening removed all `any`; the next step is making IDs distinct.
- **Discriminated unions for response shapes.** `type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError }` beats nullable returns.
- **OpenAPI-generated types as the wire spec.** `packages/shared` generates types from `openapi/blerp.v1.yaml`; consume them in `apps/dashboard` via `openapi-fetch`. If your controller types and the OpenAPI types disagree, the controller is wrong.
- **`zod` / `valibot`-style runtime validators at boundary handlers** when input arrives from the network — types alone don't survive `JSON.parse`.

## Output

When this skill fires, restate the 1–3 checklist items most relevant to the current change. Don't dump the whole list — 30 items is itself a sycophancy trap. Pick by change type:

- New API endpoint → Q2, Q3 (snake_case mapper), Q11 (real Express + SQLite test).
- New dashboard component → Q1 (sibling exists?), Q7 (read the pattern), Q15 (Playwright before claiming works), `frontend-slop-check` + `design-system-check`.
- Bug fix → Q6 (root cause), Q15 (failing-then-passing test), Q29 (re-verification pass).
- Bulk refactor → Q10 (typecheck after each batch), Q16 (sweep test fixtures), Q19 (delete something).
- After commit → Q28 (verify SHA), Q30 (PR mandate).
- Post-compaction → Q26 (`context-recovery`), Q29 (re-verification).

Then proceed — or stop and ask if a "no" surfaced.
