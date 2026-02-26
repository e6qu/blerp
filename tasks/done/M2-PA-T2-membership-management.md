# M2-PA-T2 — Membership Management & Invitations

- **Phase**: Milestone 2 — Phase A (Organizations & RBAC)
- **Plan Reference**: PLAN.md › Phase A Task 2
- **Status**: Completed

## Objective

Build the membership management service and invitation flows to allow users to join organizations with specific roles.

## Scope

- Implement membership CRUD operations under `/v1/organizations/{organization_id}/memberships`.
- Support roles: `owner`, `admin`, and `member`.
- Implement invitation flows under `/v1/organizations/{organization_id}/invitations`.
- Handle invitation status transitions (`pending`, `accepted`, `revoked`).
- Ensure all membership data is scoped to the tenant and organization.

## Related User Stories

- (#28) EndUser switches orgs, views sessions/devices.
- (#2) Dev triggers signup/signin flows (invitations are a form of signup).

## Acceptance & Definition of Done Alignment

- Satisfies DoD: unit/integration tests for memberships and invitations, docs updated.
- Access controls ensure only authorized users can manage memberships/invitations.

## Deliverables

- Membership and Invitation controllers, services, and routes.
- Integration tests for membership and invitation flows.
- Updated docs/status logs.

## Dependencies

- **Depends on**: `M2-PA-T1`.
- **Blocking**: `M2-PA-T3`, `M2-PA-T4`.
