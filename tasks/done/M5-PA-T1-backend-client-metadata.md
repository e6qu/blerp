# M5-PA-T1 — Server-side Client & Metadata API

- **Phase**: Milestone 5 — Monite SDK Parity & Advanced Metadata
- **Plan Reference**: PLAN.md › Phase A Task 1, 2, 3
- **Status**: Completed

## Objective

Implement a robust server-side client (`blerpClient`) and metadata management endpoints to match Clerk's backend capabilities, specifically supporting Monite SDK's metadata-heavy workflows.

## Scope

- Implement `@blerp/backend` package or extend `packages/shared` to provide `blerpClient`.
- `blerpClient` must support:
  - `organizations.getOrganization(id)`
  - `organizations.updateOrganizationMetadata(id, { publicMetadata, privateMetadata })`
  - `users.getUser(id)`
  - `users.updateUserMetadata(id, { publicMetadata, privateMetadata, unsafeMetadata })`
- Implement API endpoints:
  - `PATCH /v1/organizations/{organization_id}/metadata`
  - `PATCH /v1/users/{user_id}/metadata`
- Ensure all metadata operations are properly authorized (Secret Key required).
- Add support for JSON-based metadata filtering in list endpoints.

## Related User Stories

- Monite SDK Integration Parity.

## Acceptance & Definition of Done Alignment

- `blerpClient` can be used in a Node.js/Next.js environment to read and write metadata.
- Private metadata is never exposed to the client-side SDK.
- Conforms to DoD: integration tests for metadata management.

## Deliverables

- `blerpClient` implementation.
- Metadata management API endpoints.
- Integration tests for metadata flows.
- Updated docs/status logs.
