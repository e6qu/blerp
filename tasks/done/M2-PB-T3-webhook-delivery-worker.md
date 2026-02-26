# M2-PB-T3 — Webhook Delivery Worker

- **Phase**: Milestone 2 — Phase B (Webhooks & Event System)
- **Plan Reference**: PLAN.md › Phase B Task 3
- **Status**: Completed

## Objective

Implement a background worker that consumes events from Redis Streams and delivers them to registered webhook endpoints with secure signing and retry logic.

## Scope

- Implement a `WebhookWorker` in `apps/api/src/workers/webhook.worker.ts` using Redis consumer groups (`XREADGROUP`).
- Implement HMAC-SHA256 signing of webhook payloads using the endpoint secret.
- Support filtering events based on endpoint configuration.
- Implement exponential backoff retry logic for failed deliveries.
- Log delivery attempts and outcomes for monitoring.

## Related User Stories

- (#14) Dev configures webhooks for user/session events.
- (#16) SecOps needs high-fidelity event streams.

## Acceptance & Definition of Done Alignment

- Events emitted to the bus are delivered to matching webhook endpoints.
- Payloads are securely signed.
- Failed deliveries are retried.
- Conforms to DoD: unit tests for worker, delivery logic verified.

## Deliverables

- Webhook worker module.
- Background process configuration.
- Unit tests for delivery logic and signing.
- Updated docs/status logs.

## Dependencies

- **Depends on**: `M2-PB-T1`, `M2-PB-T2`.
- **Blocking**: `M2-PB-T4`, Milestone 2 release readiness.
