# M2-PC-T1 — Social Auth (OAuth 2.0) Integration

- **Phase**: Milestone 2 — Phase C (Social Auth & OIDC)
- **Plan Reference**: PLAN.md › Phase C Task 1
- **Status**: Completed

## Objective

Integrate OAuth 2.0 social providers (GitHub, Google) into the authentication flow, allowing users to sign up and sign in using external identities.

## Scope

- Implement OAuth 2.0 redirect and callback handlers in `apps/api/src/v1/controllers/oauth.controller.ts`.
- Create `OAuthService` to handle provider-specific logic and token exchange.
- Update `AuthService` to support linking OAuth identities to user accounts.
- Store external identity metadata in the `oauth_accounts` table.
- Implement a mock OAuth flow for local development.
- Add social login buttons to the Dashboard SPA `SignUp` component.

## Related User Stories

- (#2) Dev triggers signup/signin flows.
- (#3) BIS emits JWTs for BIS-managed users.

## Acceptance & Definition of Done Alignment

- Users can initiate OAuth flows for supported providers.
- External identities are successfully linked to BIS users.
- Conforms to DoD: integration tests for OAuth flows, UI updated.

## Deliverables

- OAuth service, controller, and routes.
- Updated Dashboard `SignUp` component.
- Integration tests for OAuth flows.
- Updated docs/status logs.

## Dependencies

- **Depends on**: `M1-PC-T1`, `M1-PC-T2`.
- **Blocking**: `M2-PC-T2`, `M2-PC-T3`.
