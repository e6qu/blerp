# M6-PB-T2 — Domain Verification Logic

- **Phase**: Milestone 6 — Phase B (Organization Domains & Discovery)
- **Plan Reference**: PLAN.md › Milestone 6 Task 2
- **Status**: To Do

## Objective

Implement the logic for verifying organization domains via DNS or Email flows.

## Scope

- Implement `POST /v1/organizations/:id/domains/:domain_id/verify`.
- Implement mock verification handlers that simulate DNS record checking.
- Update domain status to `verified` upon success.

## Definition of Done

- [ ] Domain verification flow is implemented.
- [ ] Status transitions work correctly.
- [ ] Integration tests cover verification happy/unhappy paths.
