# What We Did

> **Reading guide**: This is an append-only session log. The most recent entries are at the bottom and should be verbatim. Older entries are compacted to one paragraph per phase — full history is reconstructable from `git log --oneline` and the merged PR descriptions.
>
> Entry format:
>
> ```
> ## YYYY-MM-DD — [Short title; PR # when known]
> - Summary: one paragraph.
> - Tests run: commands + result.
> - Files touched: list of paths.
> - Notes/Links: optional.
> ```

---

## 2026-02-25 → 2026-03-21 — Pre-audit phases (compacted)

See `PLAN.md § Completed Milestones` for the full breakdown. Headline deliverables in this window:

- **M1–M4 (Feb 25–28)** — OpenAPI 3.1 baseline + Spectral/Redocly lint, TurboRepo monorepo with Bun-only tooling, Express 5 API + Drizzle multi-tenant SQLite, dashboard scaffold, `@blerp/nextjs` SDK with App Router, examples mirroring Clerk docs, Phase F type-hardening (eliminated all `any`).
- **M5–M6 (Feb 26–27)** — Monite SDK parity: deep metadata merge, query-by-metadata, organization domains + auto-enrollment, enhanced org profile/switcher UI, official `@monite/sdk-react` integration, token-exchange verification, Clerk↔Blerp mapping docs.
- **M7 (Feb 28)** — Clerk SDK parity: `UserProfile`, `UserButton`/`UserAvatar`, enhanced auth hooks (Phase A), control components (Phase B), auth flow hooks/components (Phase C), User-object MFA fields (Phase E), `@blerp/testing` (Phase D).
- **M8 (Mar 1)** — E2E testing as a CI gate (155 tests across auth/user/org/access, M8 Phase G).
- **M12 (Mar 1–2)** — Dashboard feature completion: organization features (invitations, webhooks, domains), profile editing, password change, project settings, API keys, project deletion, TOTP enrollment with QR + backup codes.
- **2026-03-19** — Nine-phase Dashboard UI gap closure (31 items: sign-in, deletions, OAuth, pagination, toasts, skeletons, sessions, users, avatars), CI lint fix + pre-commit enhancement, full Gap Analysis v2 vs Monite + Clerk, Monite SDK 100% parity + Clerk P1 quality (OrgSwitcher props, `createRouteMatcher`, `clerkClient`, user search/sort, org pagination), and three P2 production-polish batches totalling 20+ items (passkeys, restore, phone, dark mode, global search, shortcuts, bulk ops, redirect URLs, testing tokens).
- **2026-03-20** — SDK quality hardening + Custom Roles (C13) + M2M tokens (C5) with `client_credentials` grant. Deep SDK+API completeness audit. P0+P1 security fixes (S1–S5): JWT verification, persistent JWKS, real `useSignIn`/`useSignUp`, real OAuth token exchange. Production stubs replaced with real WebAuthn / dynamic signup codes / 2FA signin flow (BUG-18..20). Q1–Q7 production-quality fixes (passkey authz, removed hardcoded test keys, userinfo auth, Pino logger replacing `console.warn`, quota math, OAuth mock removal, removed remaining stubs). Systemic auth redesign: session JWTs replace `X-User-Id` trust across API + Dashboard + Next.js SDK. Backend SDK expansion: 26 methods across 6 namespaces + `BlerpAPIError`, full `clerkClient()` parity. Monite SDK demo: one-command setup + 13 Playwright screenshot tests (BUG-21/22 logged).
- **2026-03-21** — Next.js auth overhaul + dashboard UX (BUG-23..29): middleware JWT validation via remote JWKS, CSRF on BlerpProvider, `OrganizationSwitcher` reload for server components, removed broken sidebar org switcher, single auth form (no more side-by-side SignIn/SignUp), post-login redirect to dashboard, `EditUserModal`, member-name display. Doc cleanup pass removed 248 lines of duplicate/stale content across PLAN/GAP_ANALYSIS/FEATURES/DESIGN_DOCUMENT/ACCEPTANCE_CRITERIA.

End of pre-audit phases — repo state at the close: 49/49 API tests, 155/155 E2E tests, 16/16 Storybook tests, all milestones M1–M8 + M12 complete, M9 blocked on AWS creds, only P2 SAML + P3 polish remained.

---

## 2026-05-16 — Claude Code Skills (PR #51)

- Summary: Added seven project-local Claude Code skills under `.claude/skills/` adapted from `e6qu/sockerless`'s anti-slop suite. Skills: `avoid-vibe-slop`, `frontend-slop-check`, `design-system-check`, `ui-verification`, `hidden-rot-audit`, `clerk-monite-fidelity`, `context-recovery`. Each is a runtime checklist that fires before / during / after specific edits to keep the agent honest in a repo that grew fast under AI coding. Also gitignored `.claude/settings.local.json`.
- Tests run: `bun run typecheck` (6/6), `bun run lint` (9/9). Cache hits across the board — skills are doc-only.
- Files touched: `.claude/skills/{README,avoid-vibe-slop,frontend-slop-check,design-system-check,ui-verification,hidden-rot-audit,clerk-monite-fidelity,context-recovery}/SKILL.md` (new), `.gitignore`.

---

## 2026-05-17 — Skills audit + codex review (PR #52)

- Summary: First end-to-end run of the new `.claude/skills/` suite against the post-PR-51 baseline. Ran `context-recovery`, then the 7 `hidden-rot-audit` passes, then `frontend-slop-check` + `design-system-check`, then `clerk-monite-fidelity`. Found 10 issues. After the first batch landed locally, ran one more self-sweep + a non-interactive `codex review --base main` which surfaced 4 more. **Per user direction: no findings deferred — all 14 fixed in this same PR.**
- Result: BUG-30..BUG-43 closed; 39 new integration tests; 22 icon-only buttons gained aria-labels; WebAuthn passkey response no longer leaks credential material; OpenAPI now matches reality for org DELETE (403 not 404) and passkey PATCH/DELETE (404 properly mapped); 2FA disable reachable from UI; 6 components migrated from raw "Loading X…" to `<Skeleton>`; design tokens trimmed to only the ones actually consumed.

### Chunks (squashed into 7 commits)

1. **`edab638`** — BUG-30 + BUG-31 deletions + initial BUGS.md entries for BUG-30..BUG-38.
2. **`7a7478f`** — BUG-32 (wire "Manage 2FA" → `useDisableTotp` + backup codes view), BUG-34 (`mapPasskey()` projection — no more credential leak; user-supplied name now wired into registration; OpenAPI updated; PATCH/DELETE routes documented), BUG-39 (`DELETE /v1/organizations/{id}` added to OpenAPI), `better-sqlite3` bumped to ^12.10.0 for Node 26 compat.
3. **`51eae8c`** — BUG-33 aria-label sweep across 22 icon-only buttons; initial bulk script was over-greedy on multi-button files so 3 were redone with targeted edits.
4. **`a37f49d`** — Tiny follow-up fixing a Copy button mis-labelled "Close" by the aria sweep's over-greedy regex.
5. **`ea1b870`** — BUG-35 (removed 6 of 8 `as unknown as ...` casts; the 2 remaining are documented wire-boundary casts; cast removal exposed and fixed a missing null check in `updateUser`/`restoreUser`), BUG-36 (seeded `@theme inline` tokens — later trimmed in BUG-40), BUG-37 (Loading text → Skeleton in 6 components with `aria-busy` + `aria-live` + sr-only label).
6. **`51d2d1d`** — BUG-38: `controllers-audit.integration.test.ts` covering all 13 previously-untested controllers with happy-path + one-failure assertions per controller. Asserts the snake_case + no-credential-leak invariants BUG-3 and BUG-34 keep teaching us.
7. **`34c5fec`** — Second sweep + codex round 1 fixes: BUG-40 (drop unused brand/status tokens — only consumed `font-mono` kept), BUG-41 (passkey 404 mapping via `sendPasskeyError` helper), BUG-42 (drop unreachable 404 from org DELETE spec, document 403 instead — RBAC fires before the controller existence-check would), BUG-43 (Pagination chevron buttons get aria-label).
8. **Continuity docs prune** + **codex round 2 fixes**: streamlined `STATUS.md`/`DO_NEXT.md`/`WHAT_WE_DID.md` so a fresh agent can resume from a 30-line header (recent activity + current blockers + next action), with older milestones compacted to one paragraph per phase. Codex round 2 caught two follow-ups from my chunk-7 fixes: BUG-44 (OpenAPI DELETE passkey still said 400 even though controller now returns 404 — updated spec + regen) and BUG-45 (`CreateWebhookModal` Copy button was the twin of the API-key Copy button — still mis-labelled "Close" from the chunk-3 over-greedy regex; relabelled `Copy signing secret to clipboard`). Re-swept all Copy/Check/Pencil/Trash/RefreshCw/Plus/Bell buttons for the same class of mis-label — clean.
9. **Codex round 3 (verification only)**: ran against the round-2 fixes. Returned clean — no new findings. Two-round convergence (round 1 → 2 bugs; round 2 → 2 bugs; round 3 → 0 bugs) is the signal the audit is done.

### Final verification

- `bun run openapi:lint` — clean.
- `bun run typecheck` — 6/6 pass.
- `bun run lint` — 9/9 pass.
- API tests — 90/90 pass (was 49 pre-audit; +35 controllers-audit, +6 webauthn including 404 cases, +1 org DELETE 403 step).
- E2E tests — 152/152 pass.
- Storybook tests — 15/15 (was 16; -1 from the deleted orphan `SecurityPage.stories.tsx`).
- Two codex review rounds completed: round 1 caught BUG-41 + BUG-42; round 2 caught BUG-44 + BUG-45.

---

## Continuity-doc maintenance protocol

When you append an entry here:

- **Today**: full detail (Summary, Tests, Files, Notes).
- **>14 days ago**: compact into the appropriate "compacted" paragraph above; keep one bullet per phase noting the headline deliverable and PR number.
- **>3 months ago**: leave the compacted paragraph alone — `git log` and merged PR descriptions are authoritative for anything older.

The job of this file is to give a fresh agent enough breadcrumbs to resume mid-session. Anything older than a quarter is git's job, not this file's.

---

## 2026-05-17 — Clerk-compliance sweep (PR #53)

- Summary: After PR #52 merged, ran a focused Clerk-API-compliance sweep + a vibe-slop sweep against `origin/main`. Vibe slop was clean (no orphans, no fake tests, no a11y gaps — PR #52's cleanup held). The Clerk-fidelity sweep turned up 7 wire-contract drifts (BUG-46..BUG-52), all fixed in this PR per user direction.
- Result: BUG-46..BUG-52 closed across 5 commits.

### Chunks

1. **`d338540`** — Logged BUG-46..BUG-52 in `BUGS.md` (Clerk compliance + vibe slop sweep).
2. **`5b5cd62`** — BUG-52: `mapRole()` / `mapOAuthAccount()` / `mapEmailIdentity()` projections; `controllers-audit` test extended with explicit `not.toHaveProperty("organizationId")` assertions; seed membership role fixed to `owner` so the role routes' `org:write` RBAC accepts it.
3. **`ac4f6c1`** — BUG-46: shared env helper. `packages/shared/src/env.ts` is now the single source for `getApiUrl` / `getSecretKey` / `getWebhookSecret` / `getTenantId` / `getPublishableKey` / `getApiPort` / `getDashboardPort` and all swept consumers go through it. Re-exported from `@blerp/nextjs/server` so examples don't need a separate `@blerp/shared` dep. New `env-clerk-compat.test.ts` (8/8) pins the regression.
4. **`(this commit)`** — BUG-51: dual cookie. New `packages/nextjs/src/client/session-cookies.ts` writes both `__blerp_session` + `__session` on every sign-in; clears both on sign-out; server-side reads either; CSRF middleware reads either.
5. **`7b239f4`** — BUG-47/48/49/50 batched: error envelope dual `{ errors: [...], error: {...} }` via `BlerpError.toJSON()` + RBAC middleware refactor; `total_count` in paginated org/audit responses; session JWT carries `org_id/org_role/org_slug/org_permissions` claims from the user's first membership; webhook delivery emits Svix triple (`svix-id` / `svix-timestamp` / `svix-signature` v1) alongside `X-Blerp-Signature`. New `webhook-signatures.test.ts` (5/5) replicates the canonical Svix verification algorithm and round-trips emitted signatures.

### Final verification

- `bun run openapi:lint` — clean.
- `bun run typecheck` — 6/6 pass.
- `bun run lint` — 9/9 pass.
- API tests — 108/108 pass (was 90 pre-sweep; +8 env-compat, +1 BUG-49 JWT, +3 BUG-52 role tests, +1 BUG-47 envelope, +5 BUG-50 svix).
- Codex review pending.

---

## 2026-05-17 — Clerk-compliance sweep (PR #53) — rounds r1 .. r47

- Summary: 47 codex-review rounds against branch `chore/clerk-compliance-sweep-2026-05-17`, closing BUG-53 through BUG-177. Each round caught 1–3 issues; we fixed them all in the same PR per CLAUDE.md §7 zero-tolerance. Coverage included CLERK\_\* env-var surface (BUG-46+), dual cookie (BUG-51), JWT org claims + total_count + dual-error envelope + Svix webhook signing (BUG-47..50), JWT tenant binding for M2M (BUG-149) and sessions (BUG-155), project-scoping for /organizations / webhooks / audit / SCIM / signup-restrictions / redirect-urls / m2m-tokens, scope-gating across the API, atomic lockout + transactional backup-code consume, and a long tail of small-but-real wire-contract fixes. CI green throughout.
- Tests: 159/159 (was 108 pre-r1 → ended at 159 after BUG-177).
- Result: BUG-53..BUG-177 all closed in BUGS.md (per-bug fix narratives there).

## 2026-05-17 — PR #53 codex rounds r48..r59 (BUG-178..BUG-206)

- Summary: 12 more codex-review rounds. Major surfaces: (r48) `GET /v1/organizations` per-user accessibility scope + inlined `@blerp/shared` env reads in `discovery.controller.ts` + `latestAuthRef` re-stamp in BlerpProvider; (r49) Next.js SDK session tenant-binding (`session-verify.ts`), webhook default-bucket wildcard, audit project*id; (r50) webhook admin paths honor `'default'`, embedded forms use runtime-config redirects; (r51) project-owner can't mint tenant-wide scopes (the BUG-186 fix); (r52) full M2M chain-of-trust on create + scope gate on `requireProjectAccess` + MFA persistent counter; (r53) sync ref refresh in runtime-config success path + MFA counter reset on success + CLERK_API_PORT in dashboard proxy; (r54) `org:read` / `org:write` on the org collection routes; (r55) raw `sk*…`accepted in authMiddleware (the big production unblock) + invitation revoke fallback + auto-owner-membership on session-created orgs; (r56) CSRF skip for bearer-no-cookie + project-bind on inferred-org invitation revoke; (r57)`sk*`prefix wins over JWT discriminator +`latestConfigRef`for openSign\* callbacks; (r58) blank`?domain=` no longer bypasses auth on org LIST + redirect components delegate to runtime-config openSign\*; (r59) MFA brute-force counter persists + audit visibility for sk* admins + executed sk\_ lastUsedAt update.
- Tests: 162/162 at end (was 159; +1 BUG-178 user-scope, +1 BUG-183 audit project_id pin, +1 BUG-187 chain-of-trust).
- Files touched range: every layer of the API + the Next.js SDK + the dashboard + OpenAPI spec + regenerated schema types.

## 2026-05-17 / 2026-05-18 — PR #53 codex rounds r60..r67 (BUG-207..BUG-219)

- Summary: 8 more rounds. Major surfaces: (r60) narrowed tenant-root predicate to exclude project-bound `:admin` scopes + closed open-redirect in `<SignIn>` / `<SignUp>` via `isSafeRedirect`; (r61) admit session tenant admins on `/v1/users` (`requireScopeOrTenantAdmin`) + invitation-lookup middleware before authMiddleware on flat revoke; (r62) tenant admin can read/edit individual users via `requireSelfOrM2M` + `<CreateOrganization>` derives `project_id` from auth context (API + OpenAPI + client + regen); (r63) auto-enrolled `user.created` carries the enrolled org's project*id + embedded auth links honor runtime config via new context fields; (r65) CSRF skip for `/v1/oauth/token` + framework-public paths bypass `blerpMiddleware`; (r66) CSRF skip uses mounted-relative `req.path` (BUG-215's predicate didn't fire in prod — test-env catch-all masked it); (r67) "tenant admin" tightened to "owns EVERY project in tenant" + sk* admin sees whole tenant on org list. r64 was the first clean round; r65/r66/r67 surfaced follow-ups.
- Tests: 162/162.
- Status: r68 attempt hit the codex usage limit (resumes ~2:56 AM). Convergence requires two consecutive clean rounds; r64 was the first. Branch is 80 commits ahead of `main` and PR #53 CI is green / `MERGEABLE`.
