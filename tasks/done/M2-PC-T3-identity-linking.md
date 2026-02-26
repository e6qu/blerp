# M2-PC-T3 — Identity Linking & Multiple Identities

- **Phase**: Milestone 2 — Phase C (Social Auth & OIDC)
- **Plan Reference**: PLAN.md › Phase C Task 3
- **Status**: Completed

## Objective

Enable users to link multiple external identities (OAuth accounts) and email addresses to a single BIS account, providing a unified view of their authentication methods.

## Scope

- Implement `IdentityService` in `apps/api/src/v1/services/identity.service.ts` for linking and unlinking OAuth accounts.
- Create API endpoints for managing user identities under `/v1/users/{user_id}/identities`.
- Update `AuthService` to handle auto-linking of identities based on verified email addresses.
- Support multiple email address management (add, delete, set primary) for users.
- Update the Dashboard SPA "User Profile" or "Settings" view to display and manage linked identities.

## Related User Stories

- (#28) EndUser switches orgs, views sessions/devices.
- (#2) Dev triggers signup/signin flows.

## Acceptance & Definition of Done Alignment

- Users can successfully link/unlink OAuth providers.
- Multiple email addresses are correctly stored and managed per user.
- Conforms to DoD: integration tests for identity linking, UI updated.

## Deliverables

- Identity management service, controller, and routes.
- Updated Dashboard UI for user identity management.
- Integration tests for identity linking flows.
- Updated docs/status logs.

## Dependencies

- **Depends on**: `M2-PC-T1`, `M2-PC-T2`.
- **Blocking**: Milestone 2 release readiness.
