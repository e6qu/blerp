# M1-PA-T4 — Express API Scaffold & Drizzle Integration

- **Phase**: Milestone 1 — Phase A (Project Scaffolding & Tooling)
- **Plan Reference**: PLAN.md › Phase A Task 4
- **Status**: Pending

## Objective
Create the Express 5 API application that serves REST endpoints and dashboard assets while integrating Drizzle ORM and baseline SQLite migration plumbing.

## Scope
- Configure Express app structure, routing, middleware (helmet placeholders, error handling), and static asset serving.
- Integrate Drizzle with SQLite adapters, environment configs, and placeholder migrations.
- Ensure TypeScript build outputs align with Turbo/CI expectations.

## Related User Stories
- (#1) Dev creates users via REST.
- (#2) Dev handles signup/signin flows via `/v1/auth/*`.
- (#3) Dev validates session tokens.
- (#16) SecOps cares about per-tenant storage patterns.

## Acceptance & Definition of Done Alignment
- Conforms to DoD/Acceptance Criteria: tests pass (even placeholder), documentation/logs updated, CLI workflows proven.
- Express server must run locally and serve placeholder routes + dashboard static files.

## Deliverables
- Scaffolded `apps/api` with Express 5 server, Drizzle integration, and build scripts.
- Updated README/dev docs showing how to run the API locally.

## Dependencies
- **Depends on**: `M1-PA-T1`, `M1-PA-T2`.
- **Blocking**: `M1-PA-T5`, `M1-PA-T6`, `M1-PA-T7`, `M1-PA-T8`, `M1-PB-T1`, `M1-PB-T2`, `M1-PB-T3`, `M1-PB-T4`, `M1-PB-T5`, `M1-PC-T1`, `M1-PC-T2`, `M1-PC-T3`, `M1-PC-T4`, `M1-PC-T5`, `M1-PE-T1`, `M1-PE-T2`, `M1-PE-T3`.
