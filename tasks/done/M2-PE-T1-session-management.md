# M2-PE-T1 — Session Management & Multi-Device Revocation

- **Phase**: Milestone 2 — Phase E (Security Polish & Expansion)
- **Plan Reference**: PLAN.md › Phase E Task 1
- **Status**: Completed

## Objective

Provide users with visibility into their active sessions across different devices and enable them to revoke specific sessions or all other sessions for security.

## Scope

- Implement API endpoints for listing active sessions for the current user under `/v1/sessions`.
- Implement a session revocation endpoint under `/v1/sessions/{session_id}/revoke`.
- Enhance the `sessionStore` to support metadata like device type and location (placeholder).
- Create a "Sessions" management view in the Dashboard SPA.
- Support "Revoke All Other Sessions" functionality.

## Related User Stories

- (#28) EndUser switches orgs, views sessions/devices.

## Acceptance & Definition of Done Alignment

- Users can view a list of their active sessions with basic metadata.
- Revoking a session immediately invalidates the associated token.
- Conforms to DoD: integration tests for session management, UI viewer implemented.

## Deliverables

- Session management controller and routes.
- Updated session store with enhanced metadata support.
- Sessions viewer component in Dashboard.
- Updated docs/status logs.

## Dependencies

- **Depends on**: `M1-PC-T4`.
- **Blocking**: Milestone 2 release readiness.
