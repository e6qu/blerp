# M3-PB-T1 — CLI Enhancements & Tenant Management

- **Phase**: Milestone 3 — Experience & Scale
- **Plan Reference**: PLAN.md › Phase B Task 1
- **Status**: Completed

## Objective

Enhance the `blerp` CLI to provide powerful administrative tools for managing the monorepo, tenants, and system state.

## Scope

- Expand `scripts/blerp.ts` into a command-based CLI using `commander` or similar.
- Implement commands:
  - `tenant:create <id>`: Initialize a new tenant database.
  - `tenant:list`: List all active tenants.
  - `tenant:migrate`: Run migrations across all tenants.
  - `keys:rotate <tenantId>`: Rotate API keys or signing keys.
  - `logs:tail <tenantId>`: Stream audit logs for a specific tenant.
- Support environment-aware configuration loading.

## Related User Stories

- (#16) SecOps needs per-tenant SQLite storage and residency guarantees (CLI helps manage this).

## Acceptance & Definition of Done Alignment

- CLI provides clear help and usage information.
- Commands execute successfully and provide feedback.
- Conforms to DoD: CLI commands tested manually, documentation updated.

## Deliverables

- Enhanced CLI script.
- User guide for CLI commands.
- Updated docs/status logs.

## Dependencies

- **Depends on**: `M1-PA-T5`, `M1-PB-T2`.
- **Blocking**: GA readiness.
