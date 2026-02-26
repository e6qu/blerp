# M6-PB-T1 — Organization Domains REST API

- **Phase**: Milestone 6 — Phase B (Organization Domains & Discovery)
- **Plan Reference**: PLAN.md › Milestone 6 Task 1
- **Status**: To Do

## Objective

Implement the REST endpoints for managing Organization Domains, matching Clerk's API structure.

## Scope

- Create `organization_domains` table in the Drizzle schema.
- Implement `GET /v1/organizations/:id/domains`.
- Implement `POST /v1/organizations/:id/domains`.
- Implement `DELETE /v1/organizations/:id/domains/:domain_id`.

## Definition of Done

- [ ] All domain management endpoints are functional.
- [ ] Data is correctly persisted in the tenant database.
- [ ] RBAC is applied to protect these endpoints.
