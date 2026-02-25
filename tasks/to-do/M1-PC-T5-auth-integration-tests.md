# M1-PC-T5 — Auth & Session Integration Tests

- **Phase**: Milestone 1 — Phase C (Auth & Session APIs)
- **Plan Reference**: PLAN.md › Phase C Task 5
- **Status**: Pending

## Objective
Write Vitest + Supertest integration suites covering happy paths and error cases for signup, signin, token issuance, session revocation/refresh, and JWKS endpoints.

## Scope
- Spin up the Express app (with docker-compose dependencies) during tests, exercising multi-tenant databases and Redis.
- Cover positive and negative cases (invalid OTP, expired token, missing MFA) mirroring official Clerk behaviors.
- Export fixtures/logs to support future Clerk SDK harnesses.

## Related User Stories
- (#2) Dev runs signup/signin flows via `/v1/auth/*`.
- (#3) Dev validates tokens programmatically.
- (#18) SecOps expects rate-limit friendly error responses.
- (#19) SecOps wants RFC 7807 errors and Request-Id headers for investigations.
- (#26) EndUser needs reliable auth experiences.
- (#27) EndUser manages MFA/backups.
- (#30) EndUser wants passwordless/passkey options validated.

## Acceptance & Definition of Done Alignment
- Fully satisfies DoD/Acceptance Criteria: tests passing locally/CI, logs/docs updated, Clerk SDK compatibility considerations captured.
- Include coverage summary or pointer in WHAT_WE_DID.md.

## Deliverables
- Integration test suites + fixtures, CI wiring, and documentation describing commands to run them.

## Dependencies
- **Depends on**: `M1-PC-T1`, `M1-PC-T2`, `M1-PC-T3`, `M1-PC-T4`.
- **Blocking**: `M1-PD-T1`, `M1-PD-T3`, `M1-PE-T3`, `M1-PE-T5`.
