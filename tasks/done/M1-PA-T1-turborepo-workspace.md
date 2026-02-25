# M1-PA-T1 — TurboRepo Workspace Initialization

- **Phase**: Milestone 1 — Phase A (Project Scaffolding & Tooling)
- **Plan Reference**: PLAN.md › Phase A Task 1
- **Status**: Completed

## Objective

Initialize the monorepo structure (TurboRepo) with `apps/api`, `apps/dashboard`, `packages/config`, and `packages/shared` so all subsequent work has a consistent home.

## Scope

- Set up Turbo configuration, base package.json workspaces, and shared tsconfig references.
- Stub each package/app with minimal entrypoints plus scripts for lint/test/build placeholders.
- Document local setup commands in README/WHAT_WE_DID.

## Related User Stories

- (#7) Dev wants a React SPA dashboard template.
- (#10) Dev expects CLI scaffolding with lint/test defaults.
- (#22) Ops wants docker-compose parity rooted in a predictable repo layout.
- (#23) Ops needs CI to operate over a well-structured monorepo.

## Acceptance & Definition of Done Alignment

- Meets DoD/Acceptance Criteria: code formatted, Turbo commands runnable, documentation/status updates recorded.
- `bun install` (npm-compatible mode) plus Turbo graph operations must succeed without errors; never fall back to npm/pnpm/yarn, even if a package insists on post-install scripts (replace it instead).
- Repo scaffolding must respect engineering standards: strict typing defaults, shallow indentation via early exits, isolated try blocks, functional/pure shared utilities, and lint/type/vuln/SAST enforcement baked into the workspace.

## Deliverables

- Configured `turbo.json`, workspace package manifests, and initial folders for apps/packages.
- Updated docs/logs referencing repo bootstrap.

## Dependencies

- **Depends on**: `M1-P0-T4`.
- **Blocking**: `M1-PA-T2`, `M1-PA-T3`, `M1-PA-T4`, `M1-PA-T5`, `M1-PA-T6`, `M1-PA-T7`, `M1-PA-T8`.
