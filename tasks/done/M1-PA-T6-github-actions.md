# M1-PA-T6 — GitHub Actions CI Templates

- **Phase**: Milestone 1 — Phase A (Project Scaffolding & Tooling)
- **Plan Reference**: PLAN.md › Phase A Task 6
- **Status**: Completed

## Objective

Create GitHub Actions workflows that lint, type-check, test, and build the monorepo so every future change runs through the same CI gates.

## Scope

- Author workflows for lint/type/test/build, leveraging Turbo caching where possible.
- Include OpenAPI lint validation and docker image build/test steps.
- Document secrets/permissions requirements and how workflows tie into release deployments.

## Related User Stories

- (#23) Ops wants automated pipelines from lint through deployment.
- (#24) Ops expects observability hooks validated in CI (smoke tests).

## Acceptance & Definition of Done Alignment

- Aligns with DoD/Acceptance Criteria: workflows stored under `.github/workflows`, logs updated, tests proven locally before pushing.
- CI must cover at least lint + type-check + unit tests for API/SPAs and provide artifacts for later deployment jobs.

## Deliverables

- One or more workflow YAML files plus README notes describing triggers and usage.
- STATUS/WHAT_WE_DID entries summarizing coverage and gaps.

## Dependencies

- **Depends on**: `M1-PA-T1`, `M1-PA-T2`, `M1-PA-T4`, `M1-PA-T5`.
- **Blocking**: `M1-PA-T7`, `M1-PA-T8`, `M1-PE-T5`.
