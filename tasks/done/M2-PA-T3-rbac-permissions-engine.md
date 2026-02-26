# M2-PA-T3 — RBAC Permissions Engine

- **Phase**: Milestone 2 — Phase A (Organizations & RBAC)
- **Plan Reference**: PLAN.md › Phase A Task 3
- **Status**: Completed

## Objective

Define and implement a custom RBAC permissions engine that maps capability keys to roles and enforces access control across API endpoints.

## Scope

- Define standard permission keys (e.g., `org:read`, `org:write`, `members:read`, `members:write`).
- Create a mapping between roles (`owner`, `admin`, `member`) and these permission keys.
- Implement middleware to enforce permission checks on routes based on the current user's role in the active organization.
- Support custom role definitions stored in the tenant database.

## Related User Stories

- (#18) SecOps wants rate limit/routing config exposed cleanly (RBAC governs who can see/edit this).
- (#28) EndUser switches orgs, views sessions/devices (access depends on role).

## Acceptance & Definition of Done Alignment

- Satisfies DoD: permissions engine covered by unit tests, documentation updated.
- Access is correctly denied when permissions are missing.

## Deliverables

- Permissions configuration/engine module.
- RBAC middleware.
- Unit tests for the permissions engine and middleware.
- Updated docs/status logs.

## Dependencies

- **Depends on**: `M2-PA-T2`.
- **Blocking**: `M2-PA-T4`.
