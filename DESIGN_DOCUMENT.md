# Blerp Identity Service — Design Document

> **Related docs**: Feature list → `FEATURES.md` | Clerk/Monite parity → `GAP_ANALYSIS.md` | OpenAPI spec → `openapi/blerp.v1.yaml` | Execution status → `PLAN.md`

## 1. Context

Clerk is a widely used identity and authentication SaaS that exposes public APIs and React components. We are building **Blerp Identity Service (BIS)** as a clean-room reimplementation inspired only by publicly documented features and behaviors, not by internal code or assets. BIS must deliver drop-in functionality for modern SaaS and product teams via:

- A hosted backend offering user, session, organization, and security primitives.
- A React/Vite frontend kit and REST/JSON API that mirror Clerk-grade developer experience without copying their implementation.
- High performance, comprehensive auditability, and a compliance-friendly architecture.

## 2. Goals

1. Ship a production-ready authentication/identity platform with opinionated defaults.
2. Provide a REST+JSON API surface (with OpenAPI spec) covering: authentication flows, sessions, multifactor, organization memberships, OAuth/OIDC connections, and webhooks.
3. Offer Vite-based reference flows and templates developers can self-host or embed, plus guidance for pointing official Clerk SDKs at Blerp for validation.
4. Deliver strict security baseline (FIPS-grade crypto libraries, OWASP ASVS L2), observability, and multi-region availability.
5. Clean-room process: all assets authored from scratch, no reuse of Clerk proprietary code, layout, or textual content.

## 3. Non-goals

- Matching Clerk pricing, dashboard UI, or marketing site.
- Supporting legacy SOAP/SAML. Instead, we expose OpenID Connect (OIDC) and SCIM 2.0 provisioning.
- Building mobile SDKs in phase 1 (documented for later).

## 4. High-level Architecture

```
┌────────────────────────────────────────────────────────────┐
│ Blerp Service (Express 5 + TypeScript)                     │
│  • Serves REST API + React SPA static assets               │
│  • Hosts Customer DB Router (per-customer SQLite)          │
│  • Exposes SDK configuration + webhook delivery endpoints │
└───────────────┬────────────────────────────────────────────┘
                │
        ┌───────▼────────┐
        │ SQLite Files   │  (1 file/customer on EFS/local disk)
        └───────┬────────┘
                │
        ┌───────▼──────────────┐
        │ Redis 7 (cache +     │
        │ rate limit + queues) │
        └──────────────────────┘
```

- **Frontend stack**: Vite + React 18 + TypeScript, Tailwind CSS, React Router, and TanStack Query. The dashboard, docs, and starter templates run purely as SPAs that talk directly to the REST API. Storybook + MSW cover component development, and OpenAPI-generated type-safe clients (`openapi-fetch`) power all HTTP calls.
- **Backend stack**: A single Express 5 app (compiled with TSX/ESM) handles all HTTP traffic—no API gateway. Drizzle ORM targets SQLite 3 (one file per customer). Zod/Valibot validate payloads; Redis Streams/Lists provide native queue primitives; Redis 7 also powers caching and rate limiting; OpenTelemetry instrumentation is embedded directly.
- **Deployment**: One container image is produced via Docker. Locally we run docker-compose with the Express app, Redis, Mailpit, and mounted SQLite volumes. Cloud environments run the same image on AWS ECS Fargate (single service). Per-customer SQLite files live on EFS/EBS (or local disk) managed alongside the ECS service, keeping the stack simple and self-hostable.

### 4.1 Backend Stack Details

- **Database-per-customer**: A **DB Router** module (Express middleware + Drizzle connection helper) maps tenant IDs to dedicated SQLite files. Files live on standard storage (AWS EFS, gp3 volumes, or local disk) and are accessed with short-lived connections (connection pooling disabled). This mirrors ENT Stack’s “one project per database” mindset while keeping persistence simple and isolated.
- **Redis Cache & Queue**: Redis is the sole ancillary service. Hashes store session lookups, sorted sets enforce rate limits, Streams/Lists act as queue primitives for webhooks, transactional emails, and audit fan-out. Eliminating BullMQ/Kafka keeps operational complexity low.
- **Services**: Express routers encapsulate auth, session, organization, and project logic. Shared request context injects the DB router + authenticated actor so each HTTP request or job operates within the proper tenant scope. The same code powers REST endpoints and (optionally) internal tRPC procedures for internal tooling.

### 4.2 Frontend Stack Details

- **Admin/Dashboard**: Vite + React SPA with Tailwind CSS and React Router. Production bundles are emitted as static assets and served by Express. TanStack Query consumes the JSON REST API directly with clients generated from OpenAPI (`openapi-fetch`); MSW + Storybook provide rapid UI iteration.
- **SDK Packages**: `@blerp/nextjs` provides server-side auth (`auth()`, `currentUser()`), middleware (`blerpMiddleware`), and pre-built UI components for Next.js apps. `@blerp/backend` provides a server-side `blerpClient()` with `clerkClient()` parity. `@blerp/testing` provides Playwright helpers. The API also targets Clerk schema compatibility so official Clerk SDKs can be pointed at Blerp for validation.
- **Docs+Templates**: VitePress (or plain Vite SPA) for docs plus simple Vite templates that showcase raw REST consumption. Tooling focuses on onboarding but defers to official Clerk SDKs/flows for compatibility checks.

### 4.3 Simplifying Assumptions

- Single AWS region (us-east-1) and single ECS cluster for launch; replication/failover is a later milestone.
- No background worker service—everything runs inside the primary Express deployment (with Redis queues when needed).
- Only Redis (cache + queue) is assumed beyond the Express container and SQLite files; if Redis is unavailable, the API can degrade to direct SQLite reads with limited webhook throughput.
- No API gateway, SSR framework, service mesh, or CDN. HTTPS termination happens at the AWS Application Load Balancer, which routes straight to the Express tasks, and the SPA consumes JSON directly.
- Background tasks are processed inline or via simple Redis-triggered handlers inside the main service; no separate worker containers or schedulers.

## 5. Functional Overview

### 5.1 Tenancy Model

- Each **Project** owns API keys, environments (Development, Staging, Production), and configuration (SSO providers, appearance, allowed origins).
- **Organizations**: grouped under projects, support roles (owner/admin/member). Users can belong to multiple organizations across projects.
- **Sessions**: short-lived session tokens bound to devices + refresh tokens.
- **Applications**: frontends/backends created by end-developers integrate using publishable keys, secret keys, and session tokens.
- **Storage isolation**: every customer (workspace) is mapped to a dedicated SQLite database file stored on disk; there is no shared multi-tenant database layer.

### 5.2 Authentication Flows

1. **Email/password** with Argon2id hashing.
2. **Magic links** and **OTP codes** (email).
3. **Social providers** via OAuth 2.0/OIDC (Google, GitHub). Additional providers (Microsoft, Apple) planned.
4. **Passwordless Passkeys/WebAuthn**.
5. **MFA**: TOTP, backup codes. SMS MFA planned (see `DO_NEXT.md`).

### 5.3 User Management

- CRUD via dashboard or API.
- Metadata separation: public (client-visible), private (server-only), verification state.
- Blocking, deletion (soft delete), GDPR export.

### 5.4 Session + Token Strategy

- JWT access tokens (RS256) with 15 min expiry; refresh tokens 30 days rolling.
- Session cookies (HttpOnly, Secure, SameSite=Lax) for browser flows.
- `__blerp_session` cookie referencing opaque session ID stored in Redis for quick lookup.

### 5.5 Webhooks & Events

- Deliver JSON payloads for lifecycle events (user.created, session.revoked, organization.member_added, identity.provider_linked, etc).
- HMAC-SHA256 signed using endpoint secret; retries with exponential backoff.

### 5.6 Admin Dashboard Features

- Configuration UI for providers, allowed origins, JWT templates, theme controls.
- User search with advanced filters.
- Audit log viewer with streaming to external sinks (Datadog, Splunk) via event bus.

### 5.7 Monite SDK Parity (Milestone 6)

- **Deep Metadata Merging**: Support for nested objects (e.g., `entities`) in user/org metadata.
- **Organization Domains**: Enterprise routing based on email domains, auto-enrollment, and domain discovery.
- **Multi-entity Mapping**: Ability to associate a single Clerk user with multiple Monite `entity_user_id`s across organizations.
- For full Monite parity status, see `GAP_ANALYSIS.md`.

## 6. API Surface (REST + JSON)

### 6.1 Authentication

| Method | Path                            | Description                                   | Request Body                              | Response                                 |
| ------ | ------------------------------- | --------------------------------------------- | ----------------------------------------- | ---------------------------------------- |
| POST   | `/v1/auth/signups`              | Create pending signup (email, phone, passkey) | `{ email?, phone?, password?, strategy }` | Signup object `{id,status,verification}` |
| POST   | `/v1/auth/signups/{id}/attempt` | Submit verification code/magic link token     | `{ code?, token? }`                       | `{ user, session? }`                     |
| POST   | `/v1/auth/signins`              | Begin sign-in flow                            | `{ identifier, strategy }`                | `{ id, status, next_step }`              |
| POST   | `/v1/auth/signins/{id}/attempt` | Complete sign-in                              | `{ password?, code?, webauthnResponse? }` | `{ session, tokens }`                    |
| DELETE | `/v1/sessions/{session_id}`     | Revoke session                                | —                                         | 204                                      |
| POST   | `/v1/sessions/revoke-all`       | Revoke all sessions for current user          | —                                         | 204                                      |

### 6.2 Users

- `GET /v1/users` w/ filters (email, created_before, metadata.\*).
- `POST /v1/users` body `{ email_addresses[], phone_numbers[], password?, public_metadata?, private_metadata? }`.
- `PATCH /v1/users/{id}` partial update.
- `DELETE /v1/users/{id}` soft delete; `POST /v1/users/{id}/restore`.
- `POST /v1/users/{id}/identities/oauth` to link OAuth provider.

### 6.3 Organizations

- `GET /v1/organizations`, `POST /v1/organizations`.
- `POST /v1/organizations/{id}/memberships` with `{ user_id, role }`.
- `PATCH /v1/organizations/{id}/roles` custom RBAC templates.
- `POST /v1/organizations/{id}/domains` verified domains for auto-join.

### 6.4 MFA & Security

- `POST /v1/users/{id}/mfa/totp` to enroll.
- `POST /v1/users/{id}/mfa/totp/verify`.
- `POST /v1/users/{id}/mfa/backup_codes/regenerate`.
- `POST /v1/users/{id}/mfa/webauthn` to register a device.

### 6.5 Webhooks

- `POST /v1/webhooks/endpoints`.
- `POST /v1/webhooks/endpoints/{id}/rotate_secret`.
- `GET /v1/events` for recent deliveries.

### 6.6 Dashboard + Config

- `GET/PUT /v1/projects/{id}` environment settings.
- `POST /v1/projects/{id}/jwks` rotate signing keys.
- `GET /v1/config/theme` etc.

### 6.7 Client SDK Helper Endpoints

- `GET /v1/client` (public) returns publishable key metadata (like enabled strategies).
- `POST /v1/client/sessions` create session for server-rendered flows (SSR).
- `GET /v1/client/user` for active session by session token cookie.

### 6.8 Resource Schemas (excerpt)

| Resource             | Core fields (type)                                                                                                                                                                                                                                                                                                                                                   | Notes                                                                                                                                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **User**             | `id: uuid`, `primary_email_id: uuid?`, `email_addresses: EmailAddress[]`, `phone_numbers: PhoneNumber[]`, `status: enum("active","inactive","banned")`, `password_digest`, `passkeys: PasskeyCredential[]`, `public_metadata: json`, `private_metadata: json`, `unsafe_metadata: json`, `created_at`, `updated_at`, `deleted_at?`, `last_sign_in_at`, `external_id?` | `EmailAddress` includes `id`, `email`, `verification {status, strategy, attempts}`, `linked_to_session_id?`. Passkeys store credential ID, public key, transports, attestation format, signature counter. |
| **Session**          | `id: uuid`, `user_id`, `organization_id?`, `active_at`, `expires_at`, `abandoned_at?`, `status: enum("active","revoked","expired")`, `ip_address`, `user_agent`, `refresh_token_hash`, `latest_activity`, `actor: {type:"user"                                                                                                                                       | "api_key", id}`, `first_factor: enum`, `second_factor?`, `last_rotated_at`                                                                                                                                | Session tokens map to this record; `refresh_token_hash` stored using Argon2id and scoped per device. |
| **Project**          | `id`, `owner_user_id`, `name`, `slug`, `environments: ("development","staging","production")[]`, `default_auth_strategies: string[]`, `allowed_origins: string[]`, `jwt_template`, `branding`, `created_at`, `updated_at`, `feature_flags json`                                                                                                                      | API keys belong to environments; `jwt_template` stores claims map + TTL, signing key reference.                                                                                                           |
| **Organization**     | `id`, `project_id`, `name`, `slug`, `logo_url?`, `metadata_public`, `metadata_private`, `created_at`, `domains[] {domain,status,verified_at}`, `settings {allow_invites, default_role, mfa_policy}`                                                                                                                                                                  | Domain `status` values: `pending`, `verified`, `rejected`.                                                                                                                                                |
| **Membership**       | `id`, `organization_id`, `user_id`, `role`, `permissions[]`, `invited_by?`, `created_at`, `last_active_at`, `status: enum("active","revoked","pending_invite")`                                                                                                                                                                                                      | Custom RBAC uses `permissions[]` referencing capability keys.                                                                                                                                             |
| **Signup**           | `id`, `identifier`, `strategy: enum("password","magic_link","otp","passkey","oauth")`, `status: enum("needs_identifier","needs_verification","complete","abandoned")`, `attempts`, `expires_at`, `verification {channel, code, issued_at}`, `created_session_id?`                                                                                                    | Used by `/v1/auth/signups`; TTL 30 minutes.                                                                                                                                                               |
| **Signin Attempt**   | `id`, `identifier`, `strategy`, `status: enum("needs_first_factor","needs_second_factor","complete","locked")`, `mfa_required: boolean`, `available_strategies[]`, `created_session_id?`                                                                                                                                                                             | Multi-step statuses surface to SDK for customizing UI.                                                                                                                                                    |
| **API Key**          | `id`, `project_id`, `environment`, `type: enum("publishable","secret")`, `scopes[]`, `last_used_at`, `hashed_secret`, `prefix`, `created_at`, `rotated_at?`, `status`                                                                                                                                                                                                | Keys rotated via `/v1/projects/{id}/keys`. Secrets hashed with Argon2id.                                                                                                                                  |
| **Webhook Endpoint** | `id`, `url`, `secret`, `project_id`, `events[]`, `status`, `headers`, `delivery_stats {success, failure, last_failure}`, `created_at`                                                                                                                                                                                                                                | `status` includes `active`, `paused`, `failed`; delivery stats maintained via Redis Streams.                                                                                                              |
| **Event Delivery**   | `id`, `event_id`, `endpoint_id`, `attempt`, `response_code`, `duration_ms`, `error?`, `signature`, `created_at`, `delivered_at?`                                                                                                                                                                                                                                     | Retry logic handled by Redis queues within the main service.                                                                                                                                              |

### 6.9 Request / Response Examples

**Sign-up initiation**

```http
POST /v1/auth/signups
Authorization: Bearer sk_test_xxx
Content-Type: application/json

{
  "email": "dev@example.com",
  "password": "s3cret!",
  "strategy": "password"
}
```

```json
{
  "id": "sig_01hxyz",
  "status": "needs_verification",
  "identifier": "dev@example.com",
  "strategy": "password",
  "verification": {
    "channel": "email_code",
    "expires_at": "2024-05-24T15:10:00Z"
  }
}
```

**Session refresh**

```http
POST /v1/tokens/refresh
Authorization: Bearer sk_test_xxx
Content-Type: application/json

{ "refresh_token": "rt_abc123" }
```

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900,
  "session_id": "sess_123",
  "issued_at": "2024-05-24T14:30:00Z"
}
```

**Standard error payload**

```json
{
  "error": {
    "code": "invalid_request",
    "message": "strategy is required for password signups",
    "doc_url": "https://docs.blerp.dev/errors#invalid_request",
    "request_id": "req_01hzy5"
  }
}
```

### 6.10 Authentication, Authorization & Versioning

- Server-to-server requests use **secret keys** (`sk_live_*`), client-side requests use **publishable keys** (`pk_live_*`). Each key carries scopes: `users:read`, `sessions:write`, etc.
- HTTP versioning default `v1` via URI; breaking changes require `/v2`.
- Rate limiting: sliding window (5 requests/sec baseline) with bursts allowed for login flows; responses include `X-RateLimit-*` headers.
- OAuth/OIDC endpoints follow RFC 6749; OIDC discovery document served from `/.well-known/openid-configuration`.
- All endpoints return RFC 7807-compatible errors (see example above) and include `Request-Id` header for tracing.

## 7. Frontend Flows & SDK Compatibility

- **Internal SPA flows**: The dashboard ships Vite/React flows (sign-in/up, user management, organization management) that call the REST API directly.
- **SDK packages**: `@blerp/nextjs` provides server-side auth, middleware, and pre-built UI components. `@blerp/backend` provides `blerpClient()` with `clerkClient()` parity. The API targets Clerk schema compatibility so official Clerk SDKs can also be pointed at Blerp for validation.
- **Templates & Docs**: Developer templates show raw REST usage; docs explain how to configure the official Clerk SDKs to point at Blerp endpoints for acceptance testing.

## 8. Data Model Highlights

- `users`: id (UUID text), email_addresses (child table), phone_numbers, password_digest, passkey credentials, public/private/unsafe metadata (stored as JSON text), status, created_by.
- `sessions`: id, user_id, org_id?, refresh_token_hash, active_at, expires_at, ip_fingerprint, user_agent, revoked_reason.
- `organizations`: id, project_id, name, slug, metadata (JSON text).
- `memberships`: id, org_id, user_id, role, invited_by.
- `projects`: id, owner_user_id, name, slug, default_auth_strategies (JSON text), rate_limit_policy.
- `oauth_identities`: provider, provider_user_id, user_id, access_token, refresh_token, scopes, expires_at.
- `webhook_endpoints`, `webhook_deliveries`.
- `audit_log_entries`.

All tables include row-level version + audit fields. Per-tenant SQLite files can be snapshotted periodically (e.g., rsync/S3 uploads) for backup or external analytics; no dedicated aggregation service is provided.

## 9. Security & Compliance

- Zero trust network segmentation, TLS everywhere.
- Secrets managed via environment variables (dotenv for local, platform secrets in production).
- Rate limiting, IP allow/deny lists, automated threat detection.
- Data at rest stored in plain SQLite files; rely on underlying disk/volume encryption (EFS/EBS) or infrastructure controls if additional protection is required.
- SOC2/GDPR readiness: data residency selection, data retention policies, DPA templates.
- Pen-test program; automated dependency scanning (Snyk).
- Input validation via Zod; output typing ensures type-safe clients via OpenAPI generator.

## 10. Observability

- OpenTelemetry traces, metrics, and logs; configured via environment-specific backends.
- Structured log schema (Pino) includes correlation IDs (request, session, user) and audit_event_id.
- Synthetic monitors for OAuth providers and mail/SMS channels.

## 11. Scalability & Performance

- Stateless API nodes, autoscaling based on CPU + RPS.
- Redis caching for session lookup (<3 ms target). Hot path stored as `session:{id}` JSON.
- Redis Streams handle webhook fan-out and job retries within the main service.
- Background jobs for email deliverability, SMS, WebAuthn attestation verification, analytics fan-out.

## 12. Testing Strategy

- Unit tests (Vitest/Jest) for Express routers/services, React hooks/components.
- Contract tests using Dredd/OpenAPI to ensure endpoints follow spec.
- Integration tests orchestrated with docker-compose (SQLite volumes, Redis) in CI.
- Load tests using k6 in nightly pipeline.
- Security tests: dependency checks, OWASP ZAP baseline, custom fuzzers for auth endpoints.

## 13. Deployment, Hosting & DevEx

- GitHub Actions pipeline:
  - Lint (ESLint, Biome).
  - Type check (TypeScript strict).
  - Tests (unit/integration).
  - Build Docker images (multi-arch).
  - Push artifacts to AWS ECR (per environment).
  - Deploy via AWS ECS Fargate using blue/green deployments (AWS CodeDeploy or the GitHub `amazon-ecs-deploy-action`). Fargate services sit behind an Application Load Balancer; no CDN layer is permitted so dashboards and SDK assets are served straight from the ECS tasks.
- Feature environments per pull request use short-lived ECS Fargate services (namespaced per PR) or docker-compose with the same images.
- Local development uses `docker-compose` (Express app, Redis, Mailpit, OTEL collector) with mounted SQLite volumes, ensuring the stack is fully self-hostable without any services beyond AWS primitives when desired.
- Developer CLI `blerp dev` for local stack (TurboRepo workspace, docker-compose for infra). CLI wraps Compose for local workflows and `aws ecs`/`aws ecr` commands for Fargate deployments to keep parity without Kubernetes.

## 14. Roadmap Considerations

- ~~Phase 2: SCIM 2.0 provisioning endpoints~~ — ✅ Implemented (Milestone 2).
- Phase 2: Native mobile SDKs (React Native, Swift, Kotlin).
- Phase 3: Policy engine (Rego) integration for ABAC.
- Phase 3: Marketplace for extensions (custom OTP providers, analytics).

## 15. References (Public Knowledge)

- Clerk REST API docs (public) describing resources such as `/v1/users`, `/v1/organizations`.
- Clerk React SDK documentation that lists components like `<SignIn />`, `<UserButton />`.
- Industry standards: OAuth 2.0, OIDC, WebAuthn, SCIM 2.0, OWASP ASVS, SOC2 criteria.

All references are used solely for high-level feature parity; no proprietary assets copied.

## 16. OpenAPI Specification Source of Truth

- Location: `openapi/blerp.v1.yaml` (OpenAPI 3.1). This file MUST exist locally and pass spectral linting before any milestone planning or implementation work proceeds.
- Coverage: includes every endpoint described above (auth flows, users, organizations, MFA, webhooks, projects, client helpers) with schemas, examples, and RFC 7807-compliant errors.
- Distribution: served via the documentation site, bundled with the repo, and used for SDK generation (React, Node, Go). Stored artifacts are versioned and tagged alongside application releases.
- Tooling: CI validates spec with `@redocly/cli` + Spectral; Make targets emit TypeScript types, server stubs, and Markdown reference tables consumed by docs.
