# Specification — Milestone 1 Phase 0: OpenAPI Schema Baseline

- **Plan Reference**: `PLAN.md` › Milestone 1 › Phase 0 Tasks 1-4
- **Task Briefs**: `tasks/to-do/M1-P0-T1-openapi-schema-authoring.md` through `M1-P0-T4-sdk-generation-pipeline.md`
- **Primary Goal**: Freeze a lint-clean OpenAPI specification, circulate previews, and enable automated SDK generation so all downstream work rests on a validated contract.
- **Engineering Standards**: Maintain strict typing (no `any`/`object` escapes), prefer shallow indentation/early exits, isolate exception-prone statements inside try blocks, keep spec tooling functional/pure where possible, and ensure lint/type/vulnerability/SAST tooling is run as part of validation.

## Scope
1. Endpoints + Schemas: `/v1/auth/*`, `/v1/users`, `/v1/projects`, `/v1/jwks`, webhooks, invitations, sessions, audit logs.
2. Security: publishable vs secret API keys, JWT bearer auth, cookie/session behaviors, RFC 7807 errors.
3. Tooling: Spectral + Redocly lint, preview artifacts, Make/Turbo SDK generation pipeline.

## Traceability
- **User Stories**: 1–10 (developer flows), 19 (RFC 7807), 26–30 (end-user auth surface).
- **Acceptance Criteria Alignment**:
  - Spec compliance + SDK parity (AC §1).
  - Tests/validation (Spectral/Redocly) recorded in logs (AC §2/§3).
  - Operational readiness guaranteed via automation hooks (AC §4).

## Validation Plan
1. **Schema Authoring Review**
   - Confirm `openapi/blerp.v1.yaml` contains every endpoint from DESIGN_DOCUMENT.md and references accurate component schemas.
   - Ensure example payloads cover happy + error cases for each user story.
2. **Linting Pipeline**
   - Run `bunx turbo run openapi:lint` (Spectral) and `bunx turbo run openapi:bundle` (Redocly) locally; capture outputs in `WHAT_WE_DID.md`. If any tool suggests using npm for post-install hooks, pick a different package/config rather than leaving Bun.
   - CI workflow proves same commands run on PRs.
3. **Preview Artifacts**
   - Generate HTML/Markdown previews (e.g., `openapi/preview/index.html`), store in repo, and document reviewer sign-off in STATUS/WHAT_WE_DID.
4. **SDK Generation Hooks**
   - Execute `bunx turbo run sdk:generate` (or Make equivalent) to emit TS clients under `packages/shared`; never switch package managers for generator dependencies.
   - Verify deterministic artifacts (git clean) and document regeneration instructions.
5. **Exit Signals**
   - Checklist completed when spec version tagged, previews approved, and automation commands referenced in DO_NEXT notes.

## Evidence to Capture
- Command transcripts or log excerpts in `WHAT_WE_DID.md` for lint + generation steps.
- Link to approval note (could be PR comment or markdown entry) proving spec review.
- Mention of spec version/commit hash inside `STATUS.md` entry when closing Phase 0 tasks.
