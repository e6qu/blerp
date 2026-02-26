# M2-PB-T1 — Redis Event Bus Implementation

- **Phase**: Milestone 2 — Phase B (Webhooks & Event System)
- **Plan Reference**: PLAN.md › Phase B Task 1
- **Status**: Completed

## Objective

Implement a Redis Streams-based event bus to enable asynchronous event delivery within the system, specifically for webhooks and audit logging.

## Scope

- Implement an `EventBus` service in `apps/api/src/lib/events.ts` using Redis Streams (`XADD`).
- Define a standard schema for event payloads, including `type`, `timestamp`, `tenant_id`, and `data`.
- Instrument the `AuthService` and `OrganizationService` to emit events for core actions.
- Ensure event emission is non-blocking and handles Redis connection failures gracefully.

## Related User Stories

- (#14) Dev configures webhooks for user/session events.
- (#16) SecOps needs high-fidelity event streams.

## Acceptance & Definition of Done Alignment

- Events are successfully written to Redis Streams on core actions.
- Event structure follows the defined schema.
- Conforms to DoD: unit tests for event bus, instrumentation verified.

## Deliverables

- `EventBus` service module.
- Instrumented `AuthService` and `OrganizationService`.
- Unit tests for event emission.
- Updated docs/status logs.

## Dependencies

- **Depends on**: `M1-PB-T4`, `M2-PA-T1`, `M2-PA-T2`.
- **Blocking**: `M2-PB-T2`, `M2-PB-T3`.
