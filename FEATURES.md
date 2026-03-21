# Blerp Identity Service — Feature Specification

> **Related docs**: Architecture & API surface → `DESIGN_DOCUMENT.md` | Clerk/Monite parity → `GAP_ANALYSIS.md` | Execution status → `PLAN.md` | Bug tracker → `BUGS.md`

## 1. Core Principles

- **Clean-room parity with Clerk**: replicate behavior only from publicly documented APIs and flows.
- **Single TypeScript stack**: Express 5 + Vite + React + SQLite per tenant + Redis; no API gateway.
- **SDK packages**: `@blerp/nextjs`, `@blerp/backend`, `@blerp/testing` (see §3.2 and `DESIGN_DOCUMENT.md` §4.2).
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
- Sign-in flow: two-step email→password verification with session creation.
- OTP/magic link (email) pipelines with throttling.
- Social OAuth (Google, GitHub) via OAuth 2.0/OpenID Connect. Additional providers (Microsoft, Apple) planned.
- Passkeys/WebAuthn registration, assertion, and deletion.
- MFA: TOTP enrollment with QR code, backup code generation/regeneration, enforcement policies per project/organization.

### 2.3 API Surface (REST/JSON only)

- `/v1/auth/signups` and `/v1/auth/signins` endpoints for signup/signin attempts with multi-step verification.
- `/v1/auth/signins/{id}/attempt` for password verification and session token issuance.
- `/v1/auth/webauthn/passkeys/{id}` DELETE for passkey removal.
- `/v1/uploads/avatar` for base64 image upload and storage.
- `/v1/users`, `/v1/organizations`, `/v1/memberships`, `/v1/projects`, `/v1/webhooks`, `/v1/events`.
- RFC 7807 error payloads, Request-Id headers, redis-backed rate limiting.
- Full endpoint list: see `openapi/blerp.v1.yaml` and `DESIGN_DOCUMENT.md` §6.
- Security schemes: Bearer secret keys (`sk_*`), publishable keys (`pk_*`), session tokens (`sess_*`).

### 2.4 Data Storage & Processing

- Per-customer SQLite DBs (plain files) managed via a DB router (Express middleware + Drizzle).
- Redis 7 for caching, rate limiting, and native Streams/List queues for jobs (webhooks, emails, audits).
- No dedicated worker service—Redis-triggered tasks are processed within the main Express app or via lightweight scripts.
- Backups handled through periodic snapshots/uploads (e.g., rsync to S3); no built-in SQLite encryption layer.

## 3. Frontend/SDK Features

### 3.1 Admin Dashboard SPA

- Vite + React + Tailwind CSS, React Router for navigation, TanStack Query for data fetching.
- Direct JSON API consumption (OpenAPI-generated clients via `openapi-fetch`).
- Sign-in and sign-up pages with OAuth support (GitHub, Google).
- User profile management: edit name/username, email management, connected accounts (OAuth), password change, 2FA enrollment, backup codes, passkey management, avatar upload.
- Organization management: CRUD, member roles, invitations, domains, webhooks, org deletion with type-to-confirm.
- Admin user management page (`/admin/users`) with search, status filter, and pagination.
- Account deletion with confirmation modal and session cleanup.
- Configuration panels: project settings, API key management, audit log viewer.
- UI infrastructure: toast notification system, loading skeletons, pagination component, avatar upload with initials fallback.

### 3.2 SDK Packages & Clerk Compatibility

- **`@blerp/nextjs`**: Client and server components (`BlerpProvider`, `SignIn`, `SignUp`, `UserButton`, `OrganizationSwitcher`), middleware (`blerpMiddleware`, `createRouteMatcher`), hooks (`useAuth`, `useUser`, `useSignIn`, `useSignUp`), and server-side helpers (`auth()`, `currentUser()`).
- **`@blerp/backend`**: Server-side SDK with `blerpClient()` providing `clerkClient()` parity for organizations, users, and sessions.
- **`@blerp/testing`**: Playwright test helpers for E2E validation.
- The API targets Clerk schema compatibility — official Clerk SDKs can also be pointed at Blerp endpoints for validation.

### 3.3 Templates & Docs

- VitePress documentation includes guides, REST references generated from `openapi/blerp.v1.yaml`, and instructions for using official Clerk SDKs as a test harness.
- Developer CLI `blerp dev` spins up docker-compose environments, seeds tenants, and aids compatibility testing.

## 4. Security & Compliance Features

- Rate limiting (Redis sliding window), IP allow/deny lists, audit logging per request.
- JWT signing with JOSE, JWKS publishing, request tracing via `Request-Id`.
- Session tokens validated via JWT claims or Redis lookups; CSRF protection for dashboard.
- Secrets via environment variables (dotenv for local, platform secrets in production), OTEL tracing/logging/metrics.
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

### 6.1 Monite SDK Specifics (Milestone 6)

- Deep-merge updates for `private_metadata`.
- Organization Domains management (REST + UI).
- Domain-based auto-enrollment and discovery flows.
- Multi-entity user mapping support.
