# Blerp Identity Service — Feature Specification

## 1. Core Principles
- **Clean-room parity with Clerk**: replicate behavior only from publicly documented APIs and flows.
- **Single TypeScript stack**: Express 5 + Vite + React + SQLite per tenant + Redis; no SSR, no API gateway.
- **Strict typing**: OpenAPI-driven JSON schemas, TypeScript strict mode, Zod/Valibot validation.
- **Self-hostable**: docker-compose locally, AWS ECS Fargate in production, no CDN dependencies.

## 2. Backend Capabilities
### 2.1 Identity Resources
- Users: CRUD, metadata (public/private/unsafe), multiple emails/phones, OAuth identities, passkeys, profile images.
- Sessions: creation via auth flows, JWT issuance, refresh/revoke, device metadata (IP, UA), per-organization scoping.
- Organizations: create/update, domain allowlists, memberships with roles/permissions, org switcher support.
- Projects/API keys: environments (dev/staging/prod), publishable vs secret keys, JWKS rotation, rate-limit policy.
- Webhooks: Svix-compatible endpoints, event delivery tracking, HMAC-SHA256 signatures, retries/backoff.

### 2.2 Authentication Flows
- Email/password using Argon2id, password strength policies.
- OTP/magic link (email + SMS) pipelines with throttling.
- Social OAuth (Google, GitHub, Microsoft, Apple) via OAuth 2.0/OpenID Connect.
- Passkeys/WebAuthn registration + assertion placeholders.
- MFA: TOTP, SMS backup codes, enforcement policies per project/organization.

### 2.3 API Surface (REST/JSON only)
- `/v1/auth/*` endpoints for signup/signin attempts, session refresh, session revoke.
- `/v1/users`, `/v1/organizations`, `/v1/memberships`, `/v1/projects`, `/v1/webhooks`, `/v1/events`.
- Client helper endpoints (`/v1/client`, `/v1/client/sessions`, `/v1/client/user`) for publishable-key integrations.
- RFC 7807 error payloads, Request-Id headers, redis-backed rate limiting.
- Security schemes: Bearer secret keys (`sk_*`), publishable keys (`pk_*`), session tokens (`sess_*`).

### 2.4 Data Storage & Processing
- Per-customer SQLite DBs (plain files) managed via a DB router (Express middleware + Drizzle).
- Redis 7 for caching, rate limiting, and native Streams/List queues for jobs (webhooks, emails, audits).
- No dedicated worker service—Redis-triggered tasks are processed within the main Express app or via lightweight scripts.
- Backups handled through periodic snapshots/uploads (e.g., rsync to S3); no built-in SQLite encryption layer.

## 3. Frontend/SDK Features
### 3.1 Admin Dashboard SPA
- Vite + React + Tailwind + Radix UI, TanStack Router/Query for client-side navigation/data fetching.
- Direct JSON API consumption (OpenAPI-generated clients), no SSR/hydration tricks.
- Configuration panels: auth strategies, OAuth providers, theme controls, API keys, webhooks.
- User/org management views, audit log explorer, rate-limit dashboards, environment toggles.

### 3.2 Compatibility with Official Clerk SDKs
- We do **not** ship a custom SDK. Instead, automated suites run the official Clerk SDKs (ClerkJS, `@clerk/clerk-react`, server SDKs) against Blerp to guarantee schema parity.
- Documentation explains how to point those SDKs at Blerp endpoints for validation; any deviation is treated as a defect in our backend implementation.

### 3.3 Templates & Docs
- `create-blerp-app` scaffolds Vite SPAs that call REST endpoints directly (no SDK abstraction), showcasing JSON usage.
- VitePress documentation includes guides, REST references generated from `openapi/blerp.v1.yaml`, and instructions for using official Clerk SDKs as a test harness.
- Developer CLI `blerp dev` spins up docker-compose environments, seeds tenants, and aids compatibility testing.

## 4. Security & Compliance Features
- Rate limiting (Redis sliding window), IP allow/deny lists, audit logging per request.
- JWT signing with JOSE, JWKS publishing, request tracing via `Request-Id`.
- Session tokens validated via JWT claims or Redis lookups; CSRF protection for dashboard.
- Secrets via HashiCorp Vault (or dotenv for local), OTEL tracing/logging/metrics.
- Compliance levers: data residency (per-tenant DB location), retention policies, SOC2-ready audit trails.

## 5. Deployment & DevEx
- Single Docker image for the Express service; Compose stack (Express, Redis, Mailpit).
- AWS ECS Fargate tasks pulling from AWS ECR; blue/green deploys, ALB termination; no Kubernetes, no CDN.
- GitHub Actions pipelines: lint, typecheck, test, build, image push, ECS deploy, Spectral/OpenAPI validation.
- Feature environments via Compose/ECS namespacing to mirror prod.

## 6. Observability & Testing
- OpenTelemetry integration emitting traces/metrics/logs; Pino structured logging with correlation IDs.
- Vitest/Jest for Express services and React hooks; Playwright for SPA flows; MSW for mocking.
- Contract tests based on OpenAPI; integration tests via docker-compose (SQLite volumes, Redis).
- k6 load tests (nightly) and security scans (OWASP ZAP baseline, dependency audit).
