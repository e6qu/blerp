# M3-PC-T1 — Quota & Usage Management

- **Phase**: Milestone 3 — Experience & Scale
- **Plan Reference**: PLAN.md › Phase C Task 1
- **Status**: Completed

## Objective

Implement a quota management system to enforce limits on resources (users, organizations, sessions) and track usage for future billing integration.

## Scope

- Implement a `QuotaService` in `apps/api/src/v1/services/quota.service.ts` to check and enforce limits.
- Define default quotas for different project tiers (e.g., Free, Pro).
- Add middleware to enforce quotas on resource creation endpoints.
- Integrate usage tracking with Redis for fast lookups.
- Create a "Usage" dashboard view in the Dashboard SPA.

## Related User Stories

- (#16) SecOps needs per-tenant SQLite storage and residency guarantees (quotas help manage density).

## Acceptance & Definition of Done Alignment

- API returns 403 Forbidden when resource quotas are exceeded.
- Usage is correctly tracked and visible in the Dashboard.
- Conforms to DoD: unit tests for quota enforcement, documentation updated.

## Deliverables

- Quota service and enforcement middleware.
- Usage tracking integration.
- Usage dashboard component.
- Updated docs/status logs.

## Dependencies

- **Depends on**: `M1-PB-T4`, `M2-PA-T1`.
- **Blocking**: GA readiness.
