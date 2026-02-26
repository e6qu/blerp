# Blerp Identity Service — Execution Plan

> **Tooling note**: All package management and script commands MUST run via Bun in npm-compatible mode—use `bun install` for deps, `bun run <script>` for package scripts, and `bunx <binary>` (e.g., Turbo, Spectral) for direct CLI execution. Never use `npm`, `pnpm`, or `yarn` in this project, even if a package claims it needs a post-install script; choose an alternate dependency or disable the script while staying on Bun.

> **Engineering standards**: Favor strongly-typed code (avoid `any`, `object`, or hand-waving types), prefer shallow indentation via early exits and inverted conditionals, isolate only exception-throwing statements inside try blocks, and build an imperative shell around functional/pure cores when practical (logging allowed when necessary). Always run industry-standard linting, formatting, vulnerability scans, and SAST tooling as part of the workflow.

## Milestones Overview

1. **Milestone 1 — Core Platform Foundations**  
   Ship the initial backend, SPA flows, and infrastructure scaffolding with working authentication/user flows as defined in `DESIGN_DOCUMENT.md`.
2. **Milestone 2 — Enterprise & Ecosystem Expansion**  
   Deliver advanced features: organizations, RBAC customization, audit log streaming, inbound webhooks, and SCIM/OIDC enhancements.
3. **Milestone 3 — Experience & Scale**  
   Focus on performance tuning, observability automation, developer tooling polish, pricing/billing hooks, and readiness for GA launch.

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
3. [x] Wire JWT signing (Jose library) with configurable key rotation support.
4. [x] Build Redis-backed session store and cookie helpers complying with security requirements.
5. [x] Write Vitest integration tests plus Supertest API coverage for happy paths and error cases.

### Phase D — Frontend Flows & SDK Compatibility

_Objective_: build SPA flows that hit the REST API directly and validate compatibility using the official Clerk SDKs.

Tasks:

1. [x] Implement Vite + React SPA flows (sign-in/up, profile, organization management) consuming the JSON API directly via OpenAPI-generated clients.
2. [x] Create Storybook/MSW coverage for these flows, mirroring Clerk’s documented UI behaviors.
3. [x] Configure automated harnesses that run the official Clerk SDKs (ClerkJS, `@clerk/clerk-react`, server SDKs) against local Blerp instances to verify schema parity.
4. [x] Document how to repoint the official SDKs to Blerp endpoints for validation.
5. [x] Provide Vite demo apps/templates (no custom SDK) that developers can extend when integrating REST endpoints.

### Phase E — Observability, Security Hardening & Docs

_Objective_: establish minimum security/observability posture and developer documentation to unblock later milestones.

Tasks:

1. [x] Integrate OpenTelemetry SDK in API, exporting traces/metrics to docker-compose collectors.
2. [x] Add structured logger (Pino) with correlation IDs and HTTP access logs.
3. [x] Implement rate limiting middleware and API key auth guards (publishable vs secret).
4. [x] Harden HTTP headers (Helmet), CSRF safeguards for dashboard.
5. [x] Draft initial docs: onboarding guide, API quickstart, component usage; host via VitePress/Storybook docs tab.

---

## Milestone 2 — Enterprise & Ecosystem Expansion

### Phase A — Organizations & RBAC

_Objective_: implement multi-tenant organization support and custom role-based access control.

Tasks:

1. [x] Implement Organization CRUD, slug management, and per-tenant isolation in API.
2. [x] Build Membership management service (roles: owner, admin, member) and invitation flows.
3. [x] Define custom RBAC permissions engine mapping capability keys to roles.
4. [x] Update Dashboard SPA with Organization switcher, member lists, and role management UIs.

### Phase B — Webhooks & Event System

_Objective_: enable real-time event delivery to customer applications via Redis Streams.

Tasks:

1. [x] Implement Redis Streams-based event bus emitting user, organization, and session events.
2. [x] Build Webhook Endpoint management (URLs, secrets, event filtering) in API and DB.
3. [x] Author Webhook delivery worker with HMAC signing, retries, and backoff.
4. [x] Create Webhook monitoring and log viewer in the Dashboard SPA.

### Phase C — Social Auth & OIDC

_Objective_: expand authentication strategies to include social providers and OIDC.

Tasks:

1. [x] Integrate OAuth 2.0 social providers (GitHub, Google) into the auth flow.
2. [x] Implement OIDC Discovery and Provider configuration for BIS.
3. [x] Support linking/unlinking multiple identities and verification states per user.

### Phase D — Enterprise Connectivity

_Objective_: support enterprise-grade provisioning and audit features.

Tasks:

1. [x] Implement SCIM 2.0 provisioning endpoints for automated user/group management.
2. [x] Build Audit Log streaming service to export events to external sinks (S3, Datadog).
3. [x] Implement verified domain logic for automatic organization discovery and joining.

### Phase E — Security Polish & Expansion

_Objective_: finalize advanced security features and documentation for GA.

Tasks:

1. [x] Implement Session introspection and multi-device revocation UI in Dashboard.
2. [x] Harden WebAuthn/Passkey registration and login flows with full attestation.
3. [x] Finalize Enterprise onboarding guides, API reference updates, and deployment blueprints.

---

## Milestone 3 — Experience & Scale

### Phase A — Performance & Optimization

_Objective_: optimize hot paths and ensure database efficiency for multi-tenant workloads.

Tasks:

1. [x] Implement Redis-based caching for frequent API lookups (public JWKS, organization metadata).
2. [x] Optimize Drizzle queries and add necessary SQLite indexes for high-volume tables (audit logs, sessions).
3. Implement connection pooling and lifecycle management for tenant databases.

### Phase B — Developer Tooling & CLI

_Objective_: enhance the `blerp` CLI to improve local development and management workflows.

Tasks:

1. [x] Expand `scripts/blerp.ts` into a full-featured CLI with commands for tenant management, key rotation, and log tailing.
2. Build an "API Playground" in the Dashboard SPA or integrated into the documentation.
3. Automate SDK generation and distribution for multiple languages (Node, Go, Python).

### Phase C — Billing & Monetization Primitives

_Objective_: establish hooks for pricing, quotas, and billing integration.

Tasks:

1. [x] Define a Quota management system (users per organization, rate limits per project).
2. Implement Stripe integration placeholders for subscription and usage-based billing.
3. Build a "Usage" dashboard view for customers to monitor their consumption.

### Phase D — Production Readiness & GA

_Objective_: finalize security, stability, and documentation for General Availability.

Tasks:

1. [x] Conduct automated load testing and benchmarking for core auth and organization flows.
2. [x] Perform a final security audit focusing on session hijacking and IDOR prevention.
3. [x] Finalize all public documentation, including migration guides from Clerk.
4. [x] Ship the first "v1.0.0" release candidate containers to ECR.

---

## Milestone 4 — Framework Adapters (Next.js Parity)

### Phase A — `@blerp/nextjs` Package

_Objective_: implement a drop-in Next.js SDK that achieves feature parity with `@clerk/nextjs`.

Tasks:

1. [x] Initialize `packages/nextjs` workspace.
2. [x] Implement `blerpMiddleware` for Edge-compatible route protection, session verification, and automatic token refresh.
3. [x] Implement `BlerpProvider` context wrapper for the React tree.
4. [x] Implement `auth()` and `currentUser()` server-side helpers leveraging Next.js App Router cookies.

### Phase B — Pre-built UI Components

_Objective_: provide polished, zero-config React components matching Clerk DX.

Tasks:

1. [x] Extract `SignUp`, `SignIn`, `UserButton`, and `OrganizationSwitcher` from the Dashboard into a reusable UI package or export them from `@blerp/nextjs`.
2. Ensure components support customization via a `appearance` prop.

### Phase C — Next.js Quickstart Testing

_Objective_: validate 100ompliance with Clerk Next.js tutorials.

Tasks:

1. [x] Create `examples/nextjs-quickstart` following the exact steps in the Clerk tutorial.
2. [x] Configure Playwright to run against this example, verifying routing, redirects, and rendering.
3. [x] Create `examples/nextjs-custom-sign-in` following the custom sign-in page guide.

---

## Milestone 5 — Monite SDK Parity \& Advanced Metadata

### Phase A — Server-side Client \& Metadata API

_Objective_: implement a robust server-side client and metadata management matching Clerk APIs.

Tasks:

1. [x] Implement `blerpClient` for Node.js (parity with `clerkClient`) with `organizations.getOrganization`, `users.getUser`, etc.
2. [x] Implement `privateMetadata` read/write endpoints for users and organizations in the API.
3. [x] Add support for `publicMetadata` and `unsafeMetadata` updates via the API.

### Phase B — Advanced Next.js Integration

_Objective_: deliver high-level components and hooks for complex organization/permission flows.

Tasks:

1. [x] Implement `Protect` component and `has` permission helper for Next.js (Clerk RBAC parity).
2. [x] Implement `OrganizationProfile` and `CreateOrganization` components.
3. [x] Implement `OrganizationSwitcher` with active organization state management.

### Phase C — Webhook Handlers \& monite-sdk Parity

_Objective_: validate parity with the Monite SDK integration patterns.

Tasks:

1. [x] Implement `blerp-webhook-handler` middleware for Next.js.
2. [x] Build `examples/monite-sdk-parity` mirroring the Monite SDK Next.js demo.
3. Configure Terraform/DNS logic placeholders for custom domains.

### Phase D — E2E Testing Helpers

_Objective_: provide testing utilities for seamless E2E automation.

Tasks:

1. Implement `@blerp/testing` package with token minting helpers for Playwright.
2. Implement `global.setup.ts` pattern for monorepo E2E tests.
