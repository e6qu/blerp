# M1-PA-T3 — Dashboard SPA Skeleton & Storybook/MSW Setup

- **Phase**: Milestone 1 — Phase A (Project Scaffolding & Tooling)
- **Plan Reference**: PLAN.md › Phase A Task 3
- **Status**: Pending

## Objective

Stand up a Vite + React dashboard shell (ENT-style layout) along with Storybook and MSW mocks so the frontend team can prototype flows rapidly.

## Scope

- Configure Vite app with routing, Tailwind (if needed), auth placeholders, and environment wiring.
- Install Storybook + MSW, add sample stories for auth components, and ensure Turbo scripts cover build/test.
- Document local dev commands and how to extend the shell.

## Related User Stories

- (#7) Dev wants a React SPA dashboard template hitting the JSON API directly.
- (#9) Dev needs Storybook/MSW examples for auth components.
- (#29) EndUser expects branded hosted components.

## Acceptance & Definition of Done Alignment

- Must satisfy DoD/Acceptance Criteria: linted/formatted code, docs/logs updated, Storybook builds succeed, MSW fixtures checked in.
- CLI commands (`turbo dev`, `turbo storybook`) run cleanly.

## Deliverables

- Populated `apps/dashboard` with Vite config, entry points, layout scaffold, and Storybook/MSW setup.
- README/WHAT_WE_DID updates describing workflows.

## Dependencies

- **Depends on**: `M1-PA-T1`, `M1-PA-T2`.
- **Blocking**: `M1-PD-T1`, `M1-PD-T2`, `M1-PD-T5`, `M1-PE-T4`, `M1-PE-T5`.
