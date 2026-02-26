# M2-PE-T2 — WebAuthn & Passkey Support

- **Phase**: Milestone 2 — Phase E (Security Polish & Expansion)
- **Plan Reference**: PLAN.md › Phase E Task 2
- **Status**: Completed

## Objective

Implement WebAuthn and Passkey support to provide users with modern, phishing-resistant authentication methods.

## Scope

- Implement WebAuthn registration and authentication challenge/response logic in `apps/api/src/v1/services/webauthn.service.ts`.
- Add API endpoints for WebAuthn under `/v1/auth/webauthn`.
- Store public key credentials in a new `passkeys` table in the Drizzle schema.
- Create a "Security" management view in the Dashboard SPA to register and manage passkeys.
- Support passkeys as a primary or secondary authentication factor.

## Related User Stories

- (#2) Dev triggers signup/signin flows.
- (#16) SecOps needs high-fidelity event streams.

## Acceptance & Definition of Done Alignment

- Users can register a passkey via the Dashboard.
- Users can sign in using a registered passkey.
- Conforms to DoD: integration tests for WebAuthn flows, UI implemented.

## Deliverables

- WebAuthn service, controller, and routes.
- Updated Drizzle schema with `passkeys` table.
- Passkey management component in Dashboard.
- Updated docs/status logs.

## Dependencies

- **Depends on**: `M1-PC-T1`, `M1-PC-T2`.
- **Blocking**: Milestone 2 release readiness.
