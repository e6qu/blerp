# Blerp Identity Service — Execution Plan

> **Tooling note**: All package management and script commands MUST run via Bun in npm-compatible mode—use `bun install` for deps, `bun run <script>` for package scripts, and `bunx <binary>` (e.g., Turbo, Spectral) for direct CLI execution. Never use `npm`, `pnpm`, or `yarn` in this project, even if a package claims it needs a post-install script; choose an alternate dependency or disable the script while staying on Bun.
>
> **Engineering standards**: Favor strongly-typed code (avoid `any`, `object`, or hand-waving types), prefer shallow indentation via early exits and inverted conditionals, isolate only exception-throwing statements inside try blocks, and build an imperative shell around functional/pure cores when practical (logging allowed when necessary). Always run industry-standard linting, formatting, vulnerability scans, and SAST tooling as part of the workflow.

## Milestones Overview

1. **Milestone 1 — Core Platform Foundations**  
   Ship the initial backend, SPA flows, and infrastructure scaffolding with working authentication/user flows as defined in `DESIGN_DOCUMENT.md`.
2. **Milestone 2 — Enterprise & Ecosystem Expansion**  
   Deliver advanced features: organizations, RBAC customization, audit log streaming, inbound webhooks, and SCIM/OIDC enhancements.
3. **Milestone 3 — Experience & Scale**  
   Focus on performance tuning, observability automation, developer tooling polish, pricing/billing hooks, and readiness for GA launch.

The remainder of this plan details Milestone 1. All phases are scoped to remain well below 100k tokens of cumulative implementation + planning effort.

---

## Milestone 1 — Core Platform Foundations

### Phase 0 — OpenAPI Schema Baseline (Gating)

_Objective_: finalize and validate the complete OpenAPI document locally before deeper implementation planning proceeds.

Tasks:

1. [x] Author `openapi/blerp.v1.yaml` covering every endpoint defined in `DESIGN_DOCUMENT.md`, including schemas, security schemes, examples, and error responses.
2. [x] Run spectral/Redocly linters locally to ensure the spec is syntactically correct and style-compliant.
3. [x] Generate HTML/Markdown previews and share internally for review; capture approval in repo.
4. [x] Wire Makefile/Turbo tasks to regenerate SDK clients from this spec so later phases can depend on a frozen contract.

### Phase A — Project Scaffolding & Tooling

_Objective_: establish mono-repo structure, CI, type tooling, and local developer experience.

Tasks:

1. [x] Initialize TurboRepo workspace with packages (`apps/api`, `apps/dashboard`, `packages/config`, `packages/shared`).
2. [x] Configure shared ESLint, Prettier (or Biome), TypeScript base configs, and lint-staged hooks.
3. [x] Set up Vite + React SPA skeleton for the dashboard (ENT-style layout) plus Storybook/MSW for mocks.
4. [x] Scaffold Express 5 API (serving both REST endpoints and SPA static assets); integrate Drizzle ORM and basic database schema migration tooling targeting SQLite.
5. [x] Author docker-compose stack (SQLite volume mounts, Redis, Mailpit) and `blerp dev` CLI for bootstrapping.
6. [x] Create GitHub Actions workflow templates (lint, type-check, test, build).
7. [x] Provision AWS ECR repositories (dev/staging/prod) and ensure dashboard/static assets are baked into the same containers used locally—no CDN allowed.
8. [x] Define AWS ECS Fargate task/service definitions (API/dashboard container) with IaC (Terraform/CloudFormation) and hook GitHub Actions to perform blue/green ECS deployments—explicitly no Kubernetes stack.

### Phase B — Identity Data Model & Storage

_Objective_: implement per-customer SQLite schemas, migrations, and Drizzle data access layers for users, sessions, projects.

Tasks:

1. [x] Define Drizzle schema per `DESIGN_DOCUMENT.md` (users, sessions, projects, API keys, audit logs) targeting SQLite 3.
2. [x] Implement database-router abstraction that maps tenant IDs → dedicated SQLite file paths and handles creation/migrations per customer.
3. [x] Build migration + seeding pipeline that can run against every tenant database (turbo task iterating across DB files).
4. [x] Integrate Redis connection layer for optional cache/rate limit primitives plus Redis Streams-based queues.
5. [x] Create unit tests covering data constraints and lifecycle events (soft delete, metadata) across multiple tenant databases.

### Phase C — Auth & Session APIs

_Objective_: expose REST endpoints for sign-up, sign-in, session refresh/revoke, and token issuance.

Tasks:

1. [x] Implement controller + service modules for `/v1/auth/signups`, `/v1/auth/signins`, `/v1/tokens`.
2. [x] Add Argon2 password hashing, WebAuthn placeholder interfaces, OTP generator utilities.
3. Wire JWT signing (Jose library) with configurable key rotation support.
4. Build Redis-backed session store and cookie helpers complying with security requirements.
5. Write Vitest integration tests plus Supertest API coverage for happy paths and error cases.

### Phase D — Frontend Flows & SDK Compatibility

_Objective_: build SPA flows that hit the REST API directly and validate compatibility using the official Clerk SDKs.

Tasks:

1. Implement Vite + React SPA flows (sign-in/up, profile, organization management) consuming the JSON API directly via OpenAPI-generated clients.
2. Create Storybook/MSW coverage for these flows, mirroring Clerk’s documented UI behaviors.
3. Configure automated harnesses that run the official Clerk SDKs (ClerkJS, `@clerk/clerk-react`, server SDKs) against local Blerp instances to verify schema parity.
4. Document how to repoint the official SDKs to Blerp endpoints for validation.
5. Provide Vite demo apps/templates (no custom SDK) that developers can extend when integrating REST endpoints.

### Phase E — Observability, Security Hardening & Docs

_Objective_: establish minimum security/observability posture and developer documentation to unblock later milestones.

Tasks:

1. Integrate OpenTelemetry SDK in API, exporting traces/metrics to docker-compose collectors.
2. Add structured logger (Pino) with correlation IDs and HTTP access logs.
3. Implement rate limiting middleware and API key auth guards (publishable vs secret).
4. Harden HTTP headers (Helmet), CSRF safeguards for dashboard.
5. Draft initial docs: onboarding guide, API quickstart, component usage; host via VitePress/Storybook docs tab.

### Exit Criteria for Milestone 1

- Automated pipeline green (lint, type check, unit + integration tests).
- Local developer can run `blerp dev up`, create a project, sign up/sign in via demo app, and inspect sessions.
- API spec (OpenAPI draft) published covering implemented endpoints.
- Official Clerk SDK suites (ClerkJS, `@clerk/clerk-react`, server SDKs) run cleanly against the local environment.
- Security and observability baselines validated (linting, rate limits, OTEL traces).
