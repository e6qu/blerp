# M1-PC-T3 — JWT Signing & Key Rotation

- **Phase**: Milestone 1 — Phase C (Auth & Session APIs)
- **Plan Reference**: PLAN.md › Phase C Task 3
- **Status**: Pending

## Objective

Wire JOSE-based JWT signing for access/session tokens with configurable key rotation, JWKS publishing, and server-side validation helpers.

## Scope

- Implement signing utilities (asymmetric keys), JWKS endpoint exposure, and rotation workflows.
- Support multiple key sets (secret vs publishable) tied to projects/tenants.
- Provide hooks for revocation lists and future introspection endpoints.

## Related User Stories

- (#3) Dev wants to validate session tokens via JWKS.
- (#18) SecOps expects configurable rate limits and key handling policies.

## Acceptance & Definition of Done Alignment

- Satisfies DoD/Acceptance Criteria: tests ensure signing/verification correctness, documentation/logs updated, security review recorded.
- JWKS output matches OpenAPI contract and caches/respects ETag headers.

## Deliverables

- JWT/JWKS modules, rotation scripts, and necessary config entries.

## Dependencies

- **Depends on**: `M1-PC-T1`.
- **Blocking**: `M1-PC-T5`, `M1-PD-T1`, `M1-PD-T3`, `M1-PE-T3`.
