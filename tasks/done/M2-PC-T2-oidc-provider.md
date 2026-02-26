# M2-PC-T2 — OIDC Discovery & UserInfo

- **Phase**: Milestone 2 — Phase C (Social Auth & OIDC)
- **Plan Reference**: PLAN.md › Phase C Task 2
- **Status**: Completed

## Objective

Implement OpenID Connect (OIDC) discovery and UserInfo endpoints to make Blerp a standard-compliant OIDC provider.

## Scope

- Implement the OIDC Discovery endpoint at `/.well-known/openid-configuration`.
- Implement the UserInfo endpoint at `/v1/userinfo` returning OIDC standard claims.
- Update the `jwt` library to include required OIDC claims (`sub`, `iss`, `aud`, `iat`, `exp`).
- Support `id_token` issuance during authentication flows.
- Ensure proper tenant-aware issuer URLs in the discovery document.

## Related User Stories

- (#3) BIS emits JWTs for BIS-managed users.
- (#16) SecOps needs high-fidelity event streams (OIDC is part of the audit trail).

## Acceptance & Definition of Done Alignment

- Discovery document is correctly formatted and accessible.
- UserInfo endpoint returns correct user data for valid tokens.
- Conforms to DoD: integration tests for OIDC discovery and UserInfo, documentation updated.

## Deliverables

- OIDC discovery and UserInfo controllers.
- Updated JWT signing logic.
- Integration tests for OIDC compliance.
- Updated docs/status logs.

## Dependencies

- **Depends on**: `M1-PC-T3`, `M2-PC-T1`.
- **Blocking**: `M2-PC-T3`, Milestone 2 release readiness.
