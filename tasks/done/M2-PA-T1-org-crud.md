# M2-PA-T1 — Organization CRUD & Tenant Isolation

- **Phase**: Milestone 2 — Phase A (Organizations & RBAC)
- **Plan Reference**: PLAN.md › Phase A Task 1
- **Status**: Completed

## Objective

Implement CRUD operations for Organizations and ensure strict per-tenant isolation within the API and database layers.

## Scope

- Define API endpoints for creating, reading, updating, and deleting organizations under `/v1/organizations`.
- Implement organization slug management and uniqueness constraints within a tenant.
- Ensure all organization data is scoped to the tenant database provided by the `X-Tenant-Id` header.
- Add validation logic for organization names and slugs.

## Related User Stories

- (#28) EndUser switches orgs, views sessions/devices.
- (#16) SecOps needs per-tenant SQLite storage and residency guarantees.

## Acceptance & Definition of Done Alignment

- Conforms to DoD: endpoints tested via Vitest/Supertest, documentation updated, and OpenAPI spec remains the source of truth.
- Organizations are correctly isolated between different tenants.

## Deliverables

- Organization controller, service, and routes.
- Integration tests for organization CRUD and tenant isolation.
- Updated docs/status logs.

## Dependencies

- **Depends on**: `M1-PB-T2`, `M1-PC-T1`.
- **Blocking**: `M2-PA-T2`, `M2-PA-T4`.
