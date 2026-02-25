# M1-PE-T2 — Structured Logging with Correlation IDs

- **Phase**: Milestone 1 — Phase E (Observability, Security Hardening & Docs)
- **Plan Reference**: PLAN.md › Phase E Task 2
- **Status**: Completed

## Objective

Adopt a structured logger (Pino) emitting correlation IDs, HTTP access logs, and trace links so debugging and investigations remain consistent across services.

## Scope

- Configure logger middleware for Express, hooking into OTEL context and request IDs.
- Provide log serializers for user/session IDs while masking sensitive fields.
- Ensure logs are shipped/printed consistently in docker-compose, CI, and ECS deployments.

## Related User Stories

- (#19) SecOps wants RFC 7807 errors and Request-Id headers for investigations.
- (#24) Ops expects unified observability (logs + traces).

## Acceptance & Definition of Done Alignment

- Satisfies DoD/Acceptance Criteria: logging verified locally, documentation/logs updated, tests ensuring IDs propagate through request lifecycle.
- Works with existing log shipping strategies and does not leak secrets.

## Deliverables

- Logger configuration/utilities, middleware wiring, and documentation describing usage and correlation behavior.

## Dependencies

- **Depends on**: `M1-PE-T1`, `M1-PA-T4`.
- **Blocking**: `M1-PE-T3`, `M1-PE-T5`.
