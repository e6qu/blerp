# M1-PC-T2 — Credential Utilities (Argon2, WebAuthn, OTP)

- **Phase**: Milestone 1 — Phase C (Auth & Session APIs)
- **Plan Reference**: PLAN.md › Phase C Task 2
- **Status**: Pending

## Objective
Add Argon2 password hashing, placeholder WebAuthn interfaces, and OTP generators/validators to back the auth controllers with secure primitives.

## Scope
- Integrate Argon2id with configurable parameters and secret rotation support.
- Define WebAuthn service interfaces to be implemented later while exposing mock behavior.
- Provide OTP utilities (email/SMS/TOTP) with rate limiting hooks and tests.

## Related User Stories
- (#2) Dev requires multi-strategy signup/signin support.
- (#17) SecOps wants MFA enforcement via TOTP/SMS/backups.
- (#26) EndUser signs in with various authentication modes.
- (#27) EndUser manages MFA enrollment and backup codes.
- (#30) EndUser expects passkey/passwordless capabilities.

## Acceptance & Definition of Done Alignment
- Conforms to DoD/Acceptance Criteria: cryptographic dependencies vetted, tests verifying hashing/OTP flows included, docs/logs updated.
- Security review performed for parameter choices; secrets pulled from env/config safely.

## Deliverables
- Credential utility modules + unit tests, wiring into auth services, and documentation referencing usage.

## Dependencies
- **Depends on**: `M1-PC-T1`.
- **Blocking**: `M1-PC-T5`, `M1-PD-T1`, `M1-PD-T3`, `M1-PE-T3`.
