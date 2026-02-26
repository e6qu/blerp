# Specification — Milestone 1 Phase E: Observability, Security Hardening & Docs

- **Plan Reference**: `PLAN.md` › Phase E Tasks 1-5
- **Task Briefs**: `tasks/to-do/M1-PE-T1` through `M1-PE-T5`
- **Primary Goal**: Validate OpenTelemetry instrumentation, structured logging, rate limits/API key guards, HTTP hardening, and developer documentation deliverables so the platform is production-ready.
- **Engineering Standards**: Maintain strong typing (no `any`/`object`), design logic with shallow indentation and early exits, limit try blocks to statements that may throw, implement functional/pure telemetry helpers where feasible, and enforce lint/type/vulnerability/SAST tooling as part of acceptance.

## Scope

1. OTEL SDK integration with Express, Drizzle, Redis, Docker collector wiring, and sampling controls.
2. Structured logging (Pino) with correlation IDs, HTTP access logs, and masking of sensitive fields.
3. Rate limiting middleware + API key guard enforcement tied to Redis + Drizzle metadata.
4. HTTP hardening (Helmet, CSP) and dashboard CSRF protection.
5. Developer enablement docs (VitePress/Storybook) covering onboarding, observability, deployments, SDK repointing references.

## Traceability

- **User Stories**: 14, 18–25, 27–29.
- **Acceptance Criteria**: AC §1 (Behavior documented), AC §2 (tests + validations), AC §3 (docs/logs updated), AC §4 (operational readiness), AC §5 (security gates).

## Validation Plan

1. **OpenTelemetry**
   - Run `docker-compose up otel-collector` via `blerp dev` and confirm traces/metrics exported (use `otel-cli` or Jaeger UI screenshot).
   - Unit/integration tests ensure tracing middleware attaches Request-Ids/correlation IDs.
2. **Structured Logging**
   - Validate log format (JSON) includes `request_id`, `trace_id`, `span_id`, sanitized payload glimpses; run `bunx turbo run test:logging` or manual smoke, replacing any npm-only tooling instead of switching managers.
   - Confirm log sink works both locally and when shipping to ECS (simulate via docker log drivers if needed).
3. **Rate Limits & API Key Guards**
   - Automated tests hitting endpoints to trigger per-IP/key throttles and verifying RFC 7807 responses with `Retry-After` headers.
   - Admin configuration (config file/env) documented and tested.
4. **HTTP Hardening + CSRF**
   - Security regression tests verifying Helmet/CSP headers present; run OWASP zap baseline or `bunx playwright test security.spec.ts` and refuse npm fallbacks even if Playwright plugins request post-install scripts.
   - Dashboard CSRF tests ensure tokens rotate and integration with SPA fetch clients works.
5. **Documentation Publishing**
   - Build VitePress (or Storybook docs) via `bunx turbo run docs:build` and host preview; ensure content covers onboarding, API quickstart, harness instructions, troubleshooting, and keep Bun as the only package manager regardless of doc tooling quirks.
   - Link doc URLs inside README + DO_NEXT for future updates.

## Evidence to Capture

- Trace/log screenshots or JSON snippets included in WHAT_WE_DID.
- References to throttling test output and header captures.
- Documentation links recorded in STATUS when Phase E closes.
