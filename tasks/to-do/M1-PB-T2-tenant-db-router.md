# M1-PB-T2 — Tenant Database Router

- **Phase**: Milestone 1 — Phase B (Identity Data Model & Storage)
- **Plan Reference**: PLAN.md › Phase B Task 2
- **Status**: Pending

## Objective
Implement the database-router abstraction that maps tenant IDs to dedicated SQLite file paths, lazily creates new DB files, and applies migrations per customer.

## Scope
- Determine directory layout/naming for tenant SQLite files and ensure secure permissions.
- Build router module with caching, migrations, and error handling for missing tenants.
- Provide instrumentation/hooks for observability and future residency controls.

## Related User Stories
- (#16) SecOps needs per-tenant SQLite storage and residency guarantees.
- (#18) SecOps wants rate limit/routing config exposed cleanly (router underpins it).

## Acceptance & Definition of Done Alignment
- Aligns with DoD/Acceptance Criteria: unit tests for router logic, docs/logs updated, integration into API boot sequence proven.
- Router must recover gracefully from partially migrated tenants and log actions with Request-Id context.

## Deliverables
- Router module + tests, configuration docs, and README notes describing tenant storage layout.

## Dependencies
- **Depends on**: `M1-PB-T1`.
- **Blocking**: `M1-PB-T3`, `M1-PB-T5`, `M1-PC-T1`.
