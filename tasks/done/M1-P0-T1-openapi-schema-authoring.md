# M1-P0-T1 — Author OpenAPI Baseline

- **Phase**: Milestone 1 — Phase 0 (OpenAPI Schema Baseline)
- **Plan Reference**: PLAN.md › Phase 0 Task 1
- **Status**: Completed

## Objective
Produce the initial `openapi/blerp.v1.yaml` spec that fully captures every endpoint, schema, security scheme, example, and error response promised in the design documents so downstream work can rely on a frozen contract.

## Scope
- Model all REST resources described in `DESIGN_DOCUMENT.md` and `FEATURES.md`, including auth, users, sessions, projects, API keys, and admin tools.
- Encode security requirements (JWT, API keys, publishable vs secret) plus RFC 7807 errors and Request-Id metadata expected by SecOps.
- Ensure examples align with the needs of SPA flows, Clerk SDK parity, and downstream client generation.

## Related User Stories
- (#1) Dev can create users through REST with metadata.
- (#2) Dev can trigger signup/signin flows via `/v1/auth/*`.
- (#3) Dev can validate session tokens using JWKS.
- (#6) Dev can run Clerk SDKs against Blerp without modifications.
- (#8) Dev wants OpenAPI-generated TypeScript clients.

## Acceptance & Definition of Done Alignment
- Must satisfy the repository Definition of Done and Acceptance Criteria, including documentation/log updates and spec compliance validation.
- Spec coverage must match the behavior in `DESIGN_DOCUMENT.md` with no dangling TODOs.
- Examples must cover happy/error paths referenced in the user stories above.

## Deliverables
- Updated `openapi/blerp.v1.yaml` committed with complete schemas, security sections, and examples.
- Notes in `WHAT_WE_DID.md` + references in `STATUS.md` documenting verification and any gaps.

## Completion Notes
- **2026-02-25**: Expanded `openapi/blerp.v1.yaml` to cover invitations, audit logs, project API key lifecycle, theme config, and OIDC discovery/JWKS endpoints alongside updated schemas; logs/status/docs updated with evidence and follow-ups for linting, previews, and SDK generation tasks.

## Dependencies
- **Depends on**: None.
- **Blocking**: `M1-P0-T2`, `M1-P0-T3`, `M1-P0-T4`.
