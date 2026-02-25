# M1-P0-T2 — OpenAPI Linting & Style Compliance

- **Phase**: Milestone 1 — Phase 0 (OpenAPI Schema Baseline)
- **Plan Reference**: PLAN.md › Phase 0 Task 2
- **Status**: Completed

## Objective
Run Spectral and Redocly linting over the authored OpenAPI document to catch schema mistakes early and enforce the style rules required for SDK generation.

## Scope
- Configure local Spectral/Redocly tooling (Turbo tasks invoked via `bunx turbo run …` or `bun run …` scripts) that run deterministically in CI; if any tool expects npm-style post-install hooks, reject it or find an alternative rather than switching away from Bun.
- Follow core engineering standards: strict typing (no `any`/`object` escapes), shallow indentation with early exits, minimal try blocks, functional/pure helpers where practical, and industry-standard lint/vuln/SAST checks.
- Address all lint errors/warnings, updating the spec or suppressing with documented justification.
- Capture validation outputs for transparency in `WHAT_WE_DID.md`.

## Related User Stories
- (#1) Dev onboarding via REST depends on accurate schema expectations.
- (#2) Dev signup/signin flows require precise request/response models.
- (#6) Dev needs Clerk SDK parity, which fails without a lint-clean spec.
- (#8) Dev wants OpenAPI-generated clients; linting enforces correctness.

## Acceptance & Definition of Done Alignment
- Meets repo Definition of Done/Acceptance Criteria, including running Spectral/Redocly locally and documenting the results.
- Lint commands wired into CI or Turbo so regressions break builds.

## Deliverables
- Spectral/Redocly configs (if missing) and documented command outputs.
- Updated spec with fixes derived from lint findings.
- Notes recorded in status logs about validation results.

## Dependencies
- **Depends on**: `M1-P0-T1`.
- **Blocking**: `M1-P0-T3`, `M1-P0-T4`.
