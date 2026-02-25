# M1-PB-T5 — Multi-Tenant Data Layer Tests

- **Phase**: Milestone 1 — Phase B (Identity Data Model & Storage)
- **Plan Reference**: PLAN.md › Phase B Task 5
- **Status**: Pending

## Objective

Create unit tests covering data constraints and lifecycle events (soft delete, metadata, tenancy isolation) across multiple SQLite databases to harden the persistence layer.

## Scope

- Write Vitest (or chosen framework) suites that spin up multiple tenant DB files via the router and validate CRUD + constraints.
- Cover audit logging triggers, API key rotation, and metadata update behavior.
- Integrate tests into Turbo/CI workflows with documented fixtures.

## Related User Stories

- (#1) Dev user creation flows need reliable persistence.
- (#2) Dev signup/signin flows rely on session data constraints.
- (#16) SecOps requires tenant isolation guarantees.
- (#18) SecOps wants rate-limit friendly data patterns validated.

## Acceptance & Definition of Done Alignment

- Must satisfy DoD/Acceptance Criteria: tests added, run locally/CI, docs/logs updated, no flaky behavior.
- Provide coverage reports or summary in WHAT_WE_DID.md.

## Deliverables

- Test files + helper utilities for spinning up tenant databases and verifying constraints.

## Dependencies

- **Depends on**: `M1-PB-T1`, `M1-PB-T2`, `M1-PB-T3`, `M1-PB-T4`.
- **Blocking**: `M1-PC-T1`, `M1-PC-T5`.
