# M2-PD-T2 — Audit Log Streaming & Viewer

- **Phase**: Milestone 2 — Phase D (Enterprise Connectivity)
- **Plan Reference**: PLAN.md › Phase D Task 2
- **Status**: Completed

## Objective

Implement a high-fidelity audit logging system that captures all security-relevant events and provides a streaming-ready architecture for enterprise export.

## Scope

- Implement `AuditLogService` in `apps/api/src/v1/services/audit.service.ts` to persist events from the bus to the database.
- Create a background consumer that listens to the `blerp_events` Redis Stream and writes to the `audit_logs` table.
- Define API endpoints for querying and filtering audit logs under `/v1/audit_logs`.
- Ensure audit logs are tenant-isolated and immutable once written.
- Update the Dashboard SPA with an Audit Log viewer component.

## Related User Stories

- (#16) SecOps needs high-fidelity event streams and residency guarantees.
- (#28) EndUser switches orgs, views sessions/devices (audit logs provide history).

## Acceptance & Definition of Done Alignment

- Actions like user creation, organization updates, and session events are captured in audit logs.
- Audit logs are accessible via the API and Dashboard.
- Conforms to DoD: integration tests for audit logging, UI viewer implemented.

## Deliverables

- Audit log service and controller.
- Event bus consumer for logging.
- Audit Log viewer component in Dashboard.
- Updated docs/status logs.

## Dependencies

- **Depends on**: `M2-PB-T1`.
- **Blocking**: Milestone 2 release readiness.
