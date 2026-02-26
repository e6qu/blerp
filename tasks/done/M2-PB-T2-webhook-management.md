# M2-PB-T2 — Webhook Endpoint Management

- **Phase**: Milestone 2 — Phase B (Webhooks & Event System)
- **Plan Reference**: PLAN.md › Phase B Task 2
- **Status**: Completed

## Objective

Implement CRUD operations for Webhook Endpoints, allowing customers to register and manage destination URLs for event delivery.

## Scope

- Define API endpoints for creating, listing, retrieving, updating, and deleting webhook endpoints under `/v1/webhooks`.
- Implement secret generation for webhook signing.
- Support filtering by event types during endpoint registration.
- Ensure strict tenant isolation for webhook configurations.

## Related User Stories

- (#14) Dev configures webhooks for user/session events.

## Acceptance & Definition of Done Alignment

- Customers can register multiple webhook endpoints per tenant.
- Endpoints are correctly isolated between tenants.
- Conforms to DoD: integration tests for webhook CRUD, docs updated.

## Deliverables

- Webhook controller, service, and routes.
- Integration tests for webhook management.
- Updated docs/status logs.

## Dependencies

- **Depends on**: `M1-PB-T2`, `M2-PA-T3`.
- **Blocking**: `M2-PB-T3`.
