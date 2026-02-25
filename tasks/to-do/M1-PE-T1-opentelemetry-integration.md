# M1-PE-T1 — OpenTelemetry Integration

- **Phase**: Milestone 1 — Phase E (Observability, Security Hardening & Docs)
- **Plan Reference**: PLAN.md › Phase E Task 1
- **Status**: Pending

## Objective
Integrate the OpenTelemetry SDK into the API (and supporting services) to export traces/metrics to the docker-compose collector, establishing the baseline observability posture.

## Scope
- Configure OTEL SDK with Express instrumentation, database/Redis spans, and exporters pointing to local collector endpoints.
- Provide sampling, baggage propagation, and trace correlation with Request-Ids.
- Document how to view traces locally and wire future collectors in staging/prod.

## Related User Stories
- (#24) Ops wants traces/metrics/logs flowing to the observability stack.

## Acceptance & Definition of Done Alignment
- Meets DoD/Acceptance Criteria: instrumentation tested locally, docs/logs updated, CI ensures OTEL config doesn’t break builds.
- Integrates with `docker-compose` collector and supports toggling via env vars.

## Deliverables
- OTEL configuration code, collector config updates, documentation describing setup/verification steps.

## Dependencies
- **Depends on**: `M1-PA-T4`, `M1-PA-T5`, `M1-PC-T1`.
- **Blocking**: `M1-PE-T2`, `M1-PE-T3`, `M1-PE-T5`.
