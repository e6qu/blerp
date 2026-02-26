# M5-PC-T1 — Webhook Handlers & monite-sdk Verification

- **Phase**: Milestone 5 — Phase C (Webhook Handlers & monite-sdk Parity)
- **Plan Reference**: PLAN.md › Phase C Task 1, 2
- **Status**: Completed

## Objective

Implement a standard-compliant webhook handler for Next.js and build a verification example that mirrors the Monite SDK integration patterns.

## Scope

- Implement `blerpWebhookHandler` in `@blerp/nextjs/server`.
- The handler should:
  - Verify HMAC-SHA256 signatures from Blerp.
  - Route events to user-defined callbacks.
  - Handle multi-tenant context correctly.
- Build `examples/monite-sdk-parity` (Next.js App Router).
  - Use `blerpClient` (Server) to read organization metadata (`entity_id`).
  - Use `blerpWebhookHandler` to sync organization metadata on `organization.created`.
  - Use `Protect` and `OrganizationSwitcher` for UI parity.
- Verify everything with Playwright E2E tests.

## Related User Stories

- (#14) Dev configures webhooks for user/session events.
- Monite SDK Integration Parity.

## Acceptance & Definition of Done Alignment

- The example app successfully exchanges Blerp metadata for mock Monite entities.
- Webhook signatures are correctly verified.
- Conforms to DoD: integration tests for webhooks, E2E verification of the full flow.

## Deliverables

- `blerpWebhookHandler` implementation.
- `examples/monite-sdk-parity` application.
- Documentation for webhook integration.
- Updated docs/status logs.
