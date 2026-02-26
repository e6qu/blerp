# Specification — Milestone 1 Phase B: Identity Data Model & Storage

- **Plan Reference**: `PLAN.md` › Phase B Tasks 1-5
- **Task Briefs**: `tasks/to-do/M1-PB-T1` through `M1-PB-T5`
- **Primary Goal**: Validate that multi-tenant SQLite schemas, routing, migrations, Redis connectivity, and persistence tests uphold tenant isolation and lifecycle guarantees.
- **Engineering Standards**: Uphold precise typing (no `any`/`object`), minimize indentation depth via early exits and inverted conditionals, constrain try blocks to statements that may throw, favor functional/pure data utilities around an imperative shell, and ensure lint/type/vulnerability/SAST tooling is part of the workflow.

## Scope

1. Drizzle schema definitions + migrations for users, sessions, projects, API keys, audit logs.
2. Tenant database router abstraction with creation, migration orchestration, and observability hooks.
3. Turbo-driven migration + seeding pipeline covering all tenant DBs.
4. Redis connection pool + helper utilities for queues/rate limits.
5. Automated tests verifying constraints, soft deletes, metadata, and multi-tenant isolation.

## Traceability

- **User Stories**: 1–5 (backend flows), 11–18 (admin + SecOps), 25 (Redis job support).
- **Acceptance Criteria**: AC §1 (spec consistency), AC §2 (unit/integration tests), AC §4 (Docker/Turbo tasks), AC §5 (quality + security checks).

## Validation Plan

1. **Schema Review**
   - Compare Drizzle schema files to OpenAPI components; confirm field names/types align and metadata fields (JSON) have typed definitions.
   - Run `bunx turbo run drizzle:generate` or equivalent to ensure migrations compile; if a migration helper expects npm/pnpm, choose another helper or adapt it for Bun.
2. **Tenant Router**
   - Unit tests covering `getTenantDb(tenantId)` creation, caching, error handling.
   - Manual validation by provisioning two tenants and verifying file paths + migration status logs.
3. **Migration + Seeding Pipeline**
   - Execute `bunx turbo run db:migrate -- --all-tenants` and confirm idempotent re-run—do not install deps with npm even for post-install scripts.
   - Seeds produce deterministic data for demo/test tenants; output documented.
4. **Redis Layer**
   - Integration test connecting to docker-compose Redis verifying connection retries and instrumentation.
   - Document configuration (TLS/no TLS) and environment variables.
5. **Data Layer Tests**
   - `bunx turbo run test:data` (naming TBD) executes multi-tenant CRUD + constraint suites with coverage summary noted; swap out any packages that would require npm-exclusive hooks rather than switching managers.
   - Validate concurrency/resilience by simulating parallel migrations or connections.

## Evidence to Capture

- Path listing showing tenant DB files and migration versions.
- Test output (pass/fail) recorded in WHAT_WE_DID, referencing spec sections.
- Metrics/log screenshots stored in docs when verifying router instrumentation.
