# M2-PD-T1 — SCIM 2.0 Provisioning Endpoints

- **Phase**: Milestone 2 — Phase D (Enterprise Connectivity)
- **Plan Reference**: PLAN.md › Phase D Task 1
- **Status**: Completed

## Objective

Implement SCIM 2.0 standard provisioning endpoints to enable automated user and group management from external IDPs (e.g., Okta, Azure AD).

## Scope

- Implement SCIM 2.0 standard endpoints under `/v2/scim`.
- Support `GET /v2/scim/Users` for listing and filtering users.
- Support `POST /v2/scim/Users` for creating users.
- Support `PATCH /v2/scim/Users/{id}` for partial updates.
- Support `DELETE /v2/scim/Users/{id}` for deprovisioning.
- Map SCIM user attributes to BIS internal user and email models.
- Ensure strict multi-tenant isolation for SCIM operations.

## Related User Stories

- (#16) SecOps needs per-tenant SQLite storage and residency guarantees (SCIM flows must respect this).

## Acceptance & Definition of Done Alignment

- BIS responds to standard SCIM 2.0 requests with correct JSON structure.
- Users created via SCIM are visible and manageable within BIS.
- Conforms to DoD: integration tests for SCIM flows, documentation updated.

## Deliverables

- SCIM service, controller, and routes.
- SCIM schema mapping utilities.
- Integration tests for SCIM provisioning.
- Updated docs/status logs.

## Dependencies

- **Depends on**: `M1-PB-T2`, `M2-PA-T3`.
- **Blocking**: `M2-PD-T2`, Milestone 2 release readiness.
