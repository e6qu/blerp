# M1-PB-T1 — Drizzle Schema Definition

- **Phase**: Milestone 1 — Phase B (Identity Data Model & Storage)
- **Plan Reference**: PLAN.md › Phase B Task 1
- **Status**: Pending

## Objective
Define Drizzle ORM schemas for users, sessions, projects, API keys, and audit logs targeting SQLite 3, reflecting the multi-tenant requirements from the design doc.

## Scope
- Model columns, constraints (soft delete, metadata JSON, unique keys), and relations per tenant.
- Capture migrations that initialize the schema for new tenant databases.
- Annotate schema types for use in API/service layers and generated clients.

## Related User Stories
- (#1) Dev can create users with metadata via REST.
- (#2) Dev runs signup/signin flows backed by sessions.
- (#11) Admin configures auth strategies per project.
- (#13) Admin rotates API keys/JWKS.
- (#15) Admin views audit logs.
- (#16) SecOps needs per-tenant SQLite storage with data residency.

## Acceptance & Definition of Done Alignment
- Satisfies DoD/Acceptance Criteria: migrations tested, docs/logs updated, tests proving schema constraints added.
- Schema definitions must align with OpenAPI spec fields and design documents.

## Deliverables
- Drizzle schema files and initial migrations checked into `apps/api` (or shared package).
- Notes in WHAT_WE_DID/STATUS summarizing test coverage and schema decisions.

## Dependencies
- **Depends on**: `M1-PA-T4`, `M1-PA-T5`.
- **Blocking**: `M1-PB-T2`, `M1-PB-T3`, `M1-PB-T5`, `M1-PC-T1`, `M1-PC-T2`, `M1-PC-T3`, `M1-PC-T5`.
