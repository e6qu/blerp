# M1-PC-T1 — Auth Controllers & Services

- **Phase**: Milestone 1 — Phase C (Auth & Session APIs)
- **Plan Reference**: PLAN.md › Phase C Task 1
- **Status**: Pending

## Objective

Implement controller and service modules for `/v1/auth/signups`, `/v1/auth/signins`, and `/v1/tokens`, covering happy paths and error handling per the OpenAPI contract.

## Scope

- Wire HTTP routing, validation, and DTO translation between Express and Drizzle models.
- Support email/password, OTP, and placeholder WebAuthn/OAuth flows as described in the design doc.
- Emit audit logs and events needed for downstream queues.

## Related User Stories

- (#2) Dev triggers signup/signin flows via `/v1/auth/*`.
- (#26) EndUser signs up/signs in with multiple strategies.
- (#30) EndUser wants passwordless/passkey options (placeholder flows handled here).

## Acceptance & Definition of Done Alignment

- Satisfies DoD/Acceptance Criteria: controllers covered by tests, docs/logs updated, OpenAPI spec stays compliant, Clerk SDK harness compatibility considered.
- Error responses follow RFC 7807 with `Request-Id` headers.

## Deliverables

- Controller/service modules, updated routing, and wiring within the Express app.
- Documentation/WHAT_WE_DID notes describing supported flows and test evidence.

## Dependencies

- **Depends on**: `M1-PB-T1`, `M1-PB-T2`, `M1-PB-T3`, `M1-PB-T5`, `M1-PA-T4`.
- **Blocking**: `M1-PC-T2`, `M1-PC-T3`, `M1-PC-T4`, `M1-PC-T5`, `M1-PD-T1`, `M1-PD-T3`, `M1-PE-T1`, `M1-PE-T3`.
