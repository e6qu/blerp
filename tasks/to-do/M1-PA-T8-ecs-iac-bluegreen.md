# M1-PA-T8 — AWS ECS Fargate IaC & Blue/Green Deployments

- **Phase**: Milestone 1 — Phase A (Project Scaffolding & Tooling)
- **Plan Reference**: PLAN.md › Phase A Task 8
- **Status**: Pending

## Objective
Define ECS Fargate task/service definitions (including blue/green deployments) via IaC and connect GitHub Actions workflows to promote images through dev/staging/prod without Kubernetes.

## Scope
- Author Terraform/CloudFormation stacks for ECS clusters, task definitions, load balancers, and deployment policies.
- Integrate GitHub Actions with the IaC to perform blue/green deploys referencing ECR images.
- Document rollback paths, environment variables, and secrets handling.

## Related User Stories
- (#21) Ops wants ECS/Fargate deployments without Kubernetes.
- (#23) Ops expects automated pipelines from build to deploy.
- (#22) Ops requires local parity with production deployments.

## Acceptance & Definition of Done Alignment
- Fully aligned with DoD/Acceptance Criteria: IaC lint/tests run, deployment scripts documented, logs updated, and security considerations captured.
- Blue/green behavior validated via staging smoke test or documented simulation.

## Deliverables
- IaC files plus CI workflow updates that trigger deployments.
- Operational docs describing promotion steps and monitoring/rollback.

## Dependencies
- **Depends on**: `M1-PA-T6`, `M1-PA-T7`.
- **Blocking**: `M1-PE-T5`, Milestone 1 release readiness.
