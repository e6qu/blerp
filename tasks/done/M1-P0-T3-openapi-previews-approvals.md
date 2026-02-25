# M1-P0-T3 — OpenAPI Previews & Internal Approval

- **Phase**: Milestone 1 — Phase 0 (OpenAPI Schema Baseline)
- **Plan Reference**: PLAN.md › Phase 0 Task 3
- **Status**: Completed

## Objective
Generate human-friendly HTML/Markdown previews of the OpenAPI spec, circulate them for internal review, and capture written approval so the contract is frozen before deeper engineering.

## Scope
- Use Redocly/Stoplight/Swagger UI tooling to create shareable previews checked into the repo (e.g., `openapi/preview/`).
- Document review feedback and sign-off, linking to `WHAT_WE_DID.md` entries.
- Ensure previews match the latest linted spec (no drift).

## Related User Stories
- (#2) Dev flows rely on accurate API references.
- (#6) Dev wants to verify Clerk SDK compatibility via readable docs.
- (#7) Dev building dashboards needs to understand API payloads.
- (#8) Dev depends on consistent schemas for generated clients.

## Acceptance & Definition of Done Alignment
- Complies with DoD/Acceptance Criteria: previews stored under version control, review outcomes logged in STATUS/WHAT_WE_DID, and no pending lint errors.
- Approval artifact (note in repo) proves stakeholders agreed on the contract.

## Deliverables
- Generated HTML/Markdown preview assets in the repo.
- Review/approval notes linked in `WHAT_WE_DID.md` and cross-referenced in `STATUS.md`.

## Dependencies
- **Depends on**: `M1-P0-T1`, `M1-P0-T2`.
- **Blocking**: `M1-P0-T4`.
