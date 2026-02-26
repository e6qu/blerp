# M1-PE-T3 — Rate Limiting & API Key Guards

- **Phase**: Milestone 1 — Phase E (Observability, Security Hardening & Docs)
- **Plan Reference**: PLAN.md › Phase E Task 3
- **Status**: Completed

## Objective

Implement rate limiting middleware (per IP/key) and API key auth guards (publishable vs secret) leveraging Redis/Drizzle so the platform enforces baseline security controls.

## Scope

- Build configurable rate limiter primitives with Redis counters and instrumentation.
- Implement middleware that validates API keys, enforces scopes, and routes publishable vs secret keys appropriately.
- Provide admin configuration surfaces/hooks for future dashboards.

## Related User Stories

- (#18) SecOps wants rate limiting rules that can be tuned via config.
- (#20) SecOps needs audit/webhook exports to external SIEMs (guards facilitate secure data access).

## Acceptance & Definition of Done Alignment

- Follows DoD/Acceptance Criteria: middleware tested (unit/integration), documentation/logs updated, acceptance requirements validated alongside Clerk SDK harnesses when applicable.
- Works with docker-compose Redis and surfaces metrics via OTEL/logs.

## Deliverables

- Rate limiter + API key guard modules, config docs, and tests.

## Dependencies

- **Depends on**: `M1-PE-T1`, `M1-PE-T2`, `M1-PB-T4`, `M1-PC-T1`, `M1-PC-T2`, `M1-PC-T3`.
- **Blocking**: `M1-PE-T5`.
