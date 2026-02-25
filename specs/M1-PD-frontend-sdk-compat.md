# Specification — Milestone 1 Phase D: Frontend Flows & SDK Compatibility

- **Plan Reference**: `PLAN.md` › Phase D Tasks 1-5
- **Task Briefs**: `tasks/to-do/M1-PD-T1` through `M1-PD-T5`
- **Primary Goal**: Validate SPA auth flows, Storybook/MSW coverage, Clerk SDK harnesses, SDK repointing docs, and demo templates to guarantee developer experience parity with Clerk.
- **Engineering Standards**: Commit to strict typing (no `any`/`object`), reduce indentation via early exits/inverted conditions, isolate try blocks to risky statements, favor functional/pure UI/service helpers behind an imperative shell, and ensure lint/type/vulnerability/SAST tooling runs as part of validation.

## Scope
1. Dashboard SPA routes (sign-in/up, profile, org management, sessions) backed by generated OpenAPI clients.
2. Storybook/MSW stories for all auth components showing success/error/MFA states.
3. Automated Clerk SDK harnesses for ClerkJS, `@clerk/clerk-react`, and server SDKs pointing to local Blerp.
4. Documentation for repointing official SDKs to Blerp endpoints.
5. Vite demo apps/templates enabling direct REST integration without custom SDKs.

## Traceability
- **User Stories**: 6–10, 26–30.
- **Acceptance Criteria**: AC §1 (SDK compatibility), AC §2 (tests + harness validation), AC §3 (documentation + Storybook), AC §4 (local dev parity), AC §5 (quality gates).

## Validation Plan
1. **SPA Flow QA**
   - Execute `bunx turbo run dev --filter=apps/dashboard` and perform manual flows (signup, signin, org switch, session revoke), capturing screenshots/logs; if any dev dependency complains about missing npm hooks, replace it rather than leaving Bun.
   - Add component/unit tests verifying state machines and API client usage.
2. **Storybook/MSW**
   - Run `bunx turbo run storybook` and `bunx turbo run test:storybook` (if visual tests) to ensure all stories render with MSW fixtures, maintaining the Bun-only tooling.
   - Document how to toggle error/success states and capture MSW handler list.
3. **Clerk SDK Harnesses**
   - Provide scripts (e.g., `scripts/clerk-harness/run.sh`) that spin up local stack + run SDK tests.
   - Record outcome logs; failing harnesses should block merges.
4. **SDK Repointing Docs**
   - Validate docs by following steps on a clean environment: configure SDK, run harness, confirm success; update doc with environment variables, CLI steps, troubleshooting.
5. **Vite Demo Templates**
   - `bun create blerp-demo` (or copy) and run `bun run dev` hitting local API; confirm README instructions lead to successful login, explicitly avoiding npm even if a template references post-install scripts (swap templates if necessary).

## Evidence to Capture
- Videos/screenshots (optional) referenced in WHAT_WE_DID.
- Harness logs stored as artifacts or summarized in repo docs.
- Links to docs showing configuration plus sample `.env` templates.
