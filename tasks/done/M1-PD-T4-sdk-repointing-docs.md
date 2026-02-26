# M1-PD-T4 — SDK Repointing Documentation

- **Phase**: Milestone 1 — Phase D (Frontend Flows & SDK Compatibility)
- **Plan Reference**: PLAN.md › Phase D Task 4
- **Status**: Completed

## Objective

Document the steps required to repoint official Clerk SDKs to Blerp endpoints, covering environment variables, proxies, and any caveats discovered while running the compatibility harnesses.

## Scope

- Produce developer-facing docs (README/guide) showing how to configure each Clerk SDK flavor to hit Blerp.
- Include troubleshooting tips, error catalogs, and references to the OpenAPI spec.
- Keep instructions versioned with the repo and referenced in `DO_NEXT`/status logs when updates are needed.

## Related User Stories

- (#6) Dev wants to run Clerk SDKs unmodified against Blerp.
- (#8) Dev expects clear documentation for generated clients and SDK mapping.

## Acceptance & Definition of Done Alignment

- Meets DoD/Acceptance Criteria: docs reviewed, linked in STATUS/WHAT_WE_DID, acceptance validation recorded, no stale instructions.
- Provide evidence screenshots/logs or test results showing docs were followed successfully.

## Deliverables

- Markdown guide(s) plus updates to README/FEATURES as appropriate.

## Dependencies

- **Depends on**: `M1-PD-T3`.
- **Blocking**: `M1-PE-T5`.
