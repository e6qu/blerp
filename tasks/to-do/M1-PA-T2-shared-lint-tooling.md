# M1-PA-T2 — Shared Linting, Formatting, and Type Tooling

- **Phase**: Milestone 1 — Phase A (Project Scaffolding & Tooling)
- **Plan Reference**: PLAN.md › Phase A Task 2
- **Status**: Pending

## Objective
Create repo-wide ESLint, Prettier/Biome, TypeScript base configs, and lint-staged hooks to ensure every package shares the same standards.

## Scope
- Centralize lint configs inside `packages/config` (or similar) and extend them from each app/package.
- Configure husky/lint-staged (or equivalent) for pre-commit enforcement.
- Add baseline lint/type scripts to Turbo and CI workflows.

## Related User Stories
- (#7) Dev wants predictable frontend tooling.
- (#9) Dev expects Storybook/MSW components to follow shared conventions.
- (#10) Dev needs CLI scaffolding with lint/test defaults baked in.

## Acceptance & Definition of Done Alignment
- Work must satisfy DoD/Acceptance Criteria, including documented commands, CI integration, and no outstanding lint errors.
- Hooked into `blerp dev`/Turbo tasks with README pointers.

## Deliverables
- ESLint/Prettier/Biome config files, lint-staged setup, and Turbo task definitions.
- Updated documentation describing tooling expectations.

## Dependencies
- **Depends on**: `M1-PA-T1`.
- **Blocking**: `M1-PA-T3`, `M1-PA-T4`, `M1-PA-T5`, `M1-PA-T6`, `M1-PA-T7`, `M1-PA-T8`.
