# Specification — Milestone 1 Phase C: Auth & Session APIs

- **Plan Reference**: `PLAN.md` › Phase C Tasks 1-5
- **Task Briefs**: `tasks/to-do/M1-PC-T1` through `M1-PC-T5`
- **Primary Goal**: Validate authentication/session services, credential utilities, JWT/JWKS rotation, Redis session store, and end-to-end integration tests to guarantee API reliability.
- **Engineering Standards**: Enforce precise typing (no `any`/`object` escapes), keep indentation shallow via early exits/inverted conditionals, restrict try blocks to statements that may throw, favor functional/pure service helpers under an imperative shell, and run lint/type/vulnerability/SAST checks throughout implementation.

## Scope
1. Controllers/services for `/v1/auth/signups`, `/v1/auth/signins`, `/v1/tokens`, `/v1/jwks`, session revoke/refresh endpoints.
2. Credential primitives (Argon2, OTP, WebAuthn placeholders) with configuration + tests.
3. JWT signing + JWKS publishing + key rotation workflows.
4. Redis-backed session store and cookie helpers with security settings.
5. Integration test suites (Vitest + Supertest) for happy/error flows across multi-tenant contexts.

## Traceability
- **User Stories**: 2–6, 17–20, 26–30.
- **Acceptance Criteria**: AC §1 (spec + SDK parity), AC §2 (tests/validation), AC §3 (documentation updates), AC §5 (security review, lint/type checks).

## Validation Plan
1. **Controller Behavior**
   - Run contract tests invoking each endpoint; compare responses to OpenAPI examples.
   - Verify RFC 7807 error payloads include `request_id` and localized error codes.
2. **Credential Utilities**
   - Unit tests for Argon2 hashing/verification, OTP generation/expiry, WebAuthn mock flows.
   - Static analysis ensuring secrets pulled via env/config modules.
3. **JWT/JWKS**
   - Rotation script test: generate >1 signing key, rotate, confirm old JWKS entries expire gracefully.
   - Validate `GET /v1/jwks` caches/respects `Cache-Control` and `ETag` headers.
4. **Session Store + Cookies**
   - Integration test verifying Redis entries created, TTL refreshed, and revocation stops token refresh.
   - Cookie helper ensures `Secure`, `HttpOnly`, `SameSite=strict` (or env-specific) flags.
5. **Integration Suite**
   - `bunx turbo run test:auth` spins up API plus dependencies; tests cover signup/signin variations, MFA gating, invalid OTP, key rotation flows, device revocation, and must stay within the Bun toolchain (replace dependencies that insist on npm-only post-install scripts).
   - Coverage report stored/linked.
6. **SDK Smoke**
   - Run minimal Clerk SDK harness scenario (even before Phase D harness) to prove endpoints usable.

## Evidence to Capture
- Test run outputs with command references.
- Notes on cryptographic parameter review (Argon2 memory/time cost) in WHAT_WE_DID.
- Documented rotation schedule & script references appended to DO_NEXT when adjustments needed.
