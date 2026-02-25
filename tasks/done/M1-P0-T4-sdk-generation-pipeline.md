# M1-P0-T4 — SDK Generation Automation

- **Phase**: Milestone 1 — Phase 0 (OpenAPI Schema Baseline)
- **Plan Reference**: PLAN.md › Phase 0 Task 4
- **Status**: Completed

## Objective
Wire Makefile/Turbo tasks that regenerate SDK clients and docs from the locked OpenAPI spec so all future work can rely on generated artifacts instead of hand-written plumbing.

## Scope
- Add reproducible commands (Make/Turbo) that emit TypeScript clients plus any other language SDK stubs required later.
- Ensure generated code lives in the monorepo (e.g., `packages/shared`), with deterministic outputs and `.gitignore` rules as needed.
- Document workflows in README/WHAT_WE_DID for other devs.

## Related User Stories
- (#6) Dev wants Clerk SDKs to run against Blerp seamlessly.
- (#8) Dev depends on OpenAPI-generated clients.
- (#10) Dev wants CLI scaffolding built on top of the generated clients.

## Acceptance & Definition of Done Alignment
- Follows full Definition of Done/Acceptance Criteria: automation script committed, tests/linters updated, logs/docs refreshed.
- Running `blerp dev` (or equivalent) should regenerate clients without manual edits.

## Deliverables
- Makefile/Turbo entries plus supporting scripts/configs for SDK generation.
- Documentation updates showing how to regenerate clients.

## Dependencies
- **Depends on**: `M1-P0-T1`, `M1-P0-T2`, `M1-P0-T3`.
- **Blocking**: `M1-PA-T1`, `M1-PA-T2`, `M1-PA-T3`, `M1-PA-T4`, `M1-PA-T5`, `M1-PA-T6`, `M1-PA-T7`, `M1-PA-T8`.
