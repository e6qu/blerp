# M1-PA-T5 — Docker Compose Stack & `blerp dev` CLI

- **Phase**: Milestone 1 — Phase A (Project Scaffolding & Tooling)
- **Plan Reference**: PLAN.md › Phase A Task 5
- **Status**: Completed

## Objective

Author a docker-compose stack (SQLite volumes, Redis, Mailpit) and a `blerp dev` CLI command that bootstraps the entire environment for local parity.

## Scope

- Compose services for API, dashboard, Redis, Mailpit, and supporting volumes/networks.
- Implement `blerp dev up/down` (Node CLI or Make/Turbo wrapper) orchestrating compose, migrations, and environment setup.
- Document troubleshooting steps and environment variables.

## Related User Stories

- (#21) Ops wants a single Docker image for the service.
- (#22) Ops requires docker-compose parity for developers.
- (#25) Ops expects Redis-backed queues to be available locally.

## Acceptance & Definition of Done Alignment

- Satisfies DoD/Acceptance Criteria: compose stack documented, CLI commands tested, logs updated, lint/tests run.
- Running the CLI spins up usable API/dashboard containers with seeded data placeholders.

## Deliverables

- `docker-compose.yml`, supporting scripts, and `blerp dev` CLI source.
- README/WHAT_WE_DID instructions covering usage.

## Dependencies

- **Depends on**: `M1-PA-T4`.
- **Blocking**: `M1-PA-T7`, `M1-PB-T1`, `M1-PB-T2`, `M1-PB-T3`, `M1-PB-T4`, `M1-PB-T5`, `M1-PC-T1`, `M1-PC-T2`, `M1-PC-T3`, `M1-PC-T4`, `M1-PC-T5`, `M1-PE-T1`, `M1-PE-T2`, `M1-PE-T3`.
