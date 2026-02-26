# M1-PA-T7 — AWS ECR Repos & Image Packaging

- **Phase**: Milestone 1 — Phase A (Project Scaffolding & Tooling)
- **Plan Reference**: PLAN.md › Phase A Task 7
- **Status**: Completed

## Objective

Provision AWS ECR repositories for dev/staging/prod and ensure dashboard/static assets are bundled with the API into a single Docker image matching local builds.

## Scope

- Define repository naming/versioning strategy and IaC (Terraform/CloudFormation) for ECR.
- Update Dockerfiles/build scripts so SPA assets are baked into the API container and match compose builds.
- Document push workflows and environment variable requirements.

## Related User Stories

- (#21) Ops wants a single Docker image for simple ECS deployments.
- (#23) Ops needs CI/CD steps that publish container artifacts consistently.

## Acceptance & Definition of Done Alignment

- Meets DoD/Acceptance Criteria: IaC checked in, docker build validated locally/CI, docs/logs updated.
- Image push commands tested (dry-run) with credentials or mocked flows.

## Deliverables

- IaC definitions for ECR, updated Dockerfiles/scripts wiring dashboard assets, and README instructions.

## Dependencies

- **Depends on**: `M1-PA-T4`, `M1-PA-T5`, `M1-PA-T6`.
- **Blocking**: `M1-PA-T8`, `M1-PE-T5`.
