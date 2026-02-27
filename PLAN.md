# Blerp Identity Service — Execution Plan

> **Tooling note**: All package management and script commands MUST run via Bun in npm-compatible mode—use `bun install` for deps, `bun run <script>` for package scripts, and `bunx <binary>` (e.g., Turbo, Spectral) for direct CLI execution. Never use `npm`, `pnpm`, or `yarn` in this project.

> **Engineering standards**: Commit to absolute type safety. NEVER use `any`, `object`, or type ignores (`@ts-ignore`, `eslint-disable`). Type casts (`as`) should be avoided and used only as a documented last resort. Prefer optional properties (`?`) and unions over `null`, prefer shallow indentation via early exits and inverted conditionals, isolate only exception-throwing statements inside try blocks, and build an imperative shell around functional/pure cores when practical.

## Milestones Overview

| Milestone | Description                           | Status             |
| --------- | ------------------------------------- | ------------------ |
| M1        | Core Platform Foundations             | ✅ Complete        |
| M2        | Enterprise & Ecosystem Expansion      | ✅ Complete        |
| M3        | Experience & Scale                    | ✅ Complete        |
| M4        | Framework Adapters (Next.js Parity)   | ✅ Complete        |
| M5        | Monite SDK Parity & Advanced Metadata | 🔄 Phase D pending |
| M6        | Monite SDK Full Feature Parity        | ✅ Complete        |
| M7        | Clerk SDK Parity                      | 📋 Planned         |
| M8        | E2E Testing & Quality Assurance       | 📋 Planned         |
| M9        | Production Infrastructure             | 📋 Planned         |
| M10       | Multi-Language SDK Support            | 📋 Planned         |
| M11       | Advanced Security & Compliance        | 📋 Planned         |

---

## Completed Milestones (Summary)

### Milestone 1 — Core Platform Foundations ✅

- OpenAPI schema baseline with Spectral/Redocly linting
- TurboRepo monorepo with shared configs
- Express 5 API with Drizzle ORM + SQLite multi-tenancy
- Vite + React dashboard with Storybook/MSW
- Docker-compose stack, GitHub Actions CI/CD
- AWS ECR/ECS infrastructure (Terraform)

### Milestone 2 — Enterprise & Ecosystem Expansion ✅

- Organization CRUD with per-tenant isolation
- RBAC permissions engine (owner/admin/member)
- Redis Streams event bus + webhook delivery
- OAuth 2.0 social providers (GitHub, Google)
- OIDC Discovery and Provider configuration
- SCIM 2.0 provisioning endpoints
- Audit log streaming to external sinks

### Milestone 3 — Experience & Scale ✅

- Redis caching for JWKS and organization metadata
- SQLite indexes for high-volume tables
- Enhanced `blerp` CLI with tenant management
- Quota management system + Stripe placeholders
- Load testing and security audit

### Milestone 4 — Framework Adapters (Next.js Parity) ✅

- `@blerp/nextjs` package with `BlerpProvider`, `auth()`, `currentUser()`
- `blerpMiddleware` for Edge-compatible route protection
- Pre-built UI components: `SignUp`, `SignIn`, `UserButton`, `OrganizationSwitcher`
- Example apps validating Clerk tutorial compliance

### Milestone 5 — Monite SDK Parity & Advanced Metadata ✅ (Phase D pending)

- `@blerp/backend` with `blerpClient` (clerkClient parity)
- Private/public/unsafe metadata endpoints
- `Protect` component and `has` permission helper
- `OrganizationProfile`, `CreateOrganization` components
- Webhook handler middleware

### Milestone 6 — Monite SDK Full Feature Parity ✅

- Deep-merge strategy for nested metadata (`entities` object)
- Query users by metadata values
- Organization Domains REST API with verification
- Verified domain auto-enrollment
- Full `@monite/sdk-react` integration example
- Clerk-to-Blerp mapping documentation

---

## Milestone 5 — Remaining Tasks

### Phase D — E2E Testing Helpers

1. [ ] Implement `@blerp/testing` package with token minting helpers for Playwright.
2. [ ] Implement `global.setup.ts` pattern for monorepo E2E tests.

### Phase C — Remaining

1. [ ] Configure Terraform/DNS logic placeholders for custom domains.

---

## Milestone 7 — Clerk SDK Parity

_Objective_: Achieve full API and component parity with Clerk's SDK offerings.

### Phase A — User Components & Hooks ✅ COMPLETE

Tasks:

1. [x] Implement `<UserProfile />` component with full tab support (Account, Security, Connected Accounts).
2. [x] Implement `<UserButton />` component with dropdown menu and actions.
3. [x] Implement `<UserAvatar />` component.
4. [x] Add `useUser()` hook with full User object access.
5. [x] Add `useClerk()` hook exposing full Blerp client.
6. [x] Add `useSession()` and `useSessionList()` hooks.

### Phase B — Control & Navigation Components ✅ COMPLETE

Tasks:

1. [x] Implement `<SignedIn />` and `<SignedOut />` conditional rendering components.
2. [x] Implement `<ClerkLoaded />` and `<ClerkLoading />` loading state components.
3. [x] Implement `<RedirectToSignIn />`, `<RedirectToSignUp />`, `<RedirectToUserProfile />` components.
4. [x] Implement `<RedirectToOrganizationProfile />`, `<RedirectToCreateOrganization />` components.
5. [x] Implement `<AuthenticateWithRedirectCallback />` for OAuth flows.
6. [ ] Add `buildSignInUrl()`, `buildSignUpUrl()`, `buildUserProfileUrl()` methods.

### Phase C — Auth Flow Components & Hooks

Tasks:

1. [ ] Implement `<TaskResetPassword />` component.
2. [ ] Implement `<TaskSetupMFA />` component.
3. [ ] Implement `<TaskChooseOrganization />` component.
4. [ ] Implement `<GoogleOneTap />` component.
5. [ ] Implement `<Waitlist />` component for pre-launch signups.
6. [ ] Add `useSignIn()` and `useSignUp()` hooks with full flow control.
7. [ ] Add `useReverification()` hook for step-up auth.

### Phase D — Organization Components

Tasks:

1. [ ] Implement `<OrganizationList />` component.
2. [ ] Add `useOrganizationList()` hook.
3. [ ] Add `useOrganizationCreationDefaults()` hook.
4. [ ] Implement organization-related redirect components.

### Phase E — User Object Enhancements

Tasks:

1. [ ] Add `externalId` field for external system ID mapping.
2. [ ] Add MFA-related fields: `totpEnabled`, `backupCodeEnabled`, `twoFactorEnabled`.
3. [x] Add `locked` and `lockout` fields for account lock management.
4. [ ] Add `legalAcceptedAt` field for legal compliance tracking.
5. [ ] Add `locale` field for user language preference.
6. [ ] Add `web3Wallets` array for crypto wallet addresses.

### Phase F — Testing Tokens & Sign-in Tokens

Tasks:

1. [ ] Implement Testing Tokens API for E2E test bot detection bypass.
2. [ ] Implement Sign-in Tokens API for passwordless authentication.
3. [ ] Add `createSignInToken()` and `revokeSignInToken()` to backend client.
4. [ ] Add `createTestingToken()` to backend client.

### Phase G — Allowlist & Redirect URLs

Tasks:

1. [ ] Implement Allowlist Identifiers API (restrict signups by email/phone).
2. [ ] Implement Redirect URLs API for whitelisted OAuth redirects.
3. [ ] Add backend client methods for allowlist management.
4. [ ] Add backend client methods for redirect URL management.

### Phase H — SAML SSO (Enterprise)

Tasks:

1. [ ] Implement SAML Connections API for organizations.
2. [ ] Add `samlAccounts` to User object.
3. [ ] Implement SAML SSO sign-in flow.
4. [ ] Add SAML connection management to OrganizationProfile component.

---

## Milestone 8 — E2E Testing & Quality Assurance

_Objective_: establish comprehensive testing infrastructure for production confidence.

### Phase A — Testing Package

1. [ ] Create `@blerp/testing` package with Playwright utilities.
2. [ ] Implement token minting helpers for authenticated E2E flows.
3. [ ] Create mock fixtures for users, organizations, and sessions.
4. [ ] Add visual regression testing with Playwright snapshots.

### Phase B — Integration Test Suite

1. [ ] Implement `global.setup.ts` pattern for monorepo E2E tests.
2. [ ] Add API integration tests for all auth flows.
3. [ ] Add webhook delivery verification tests.
4. [ ] Create load testing harness with k6 or Artillery.

### Phase C — Quality Gates

1. [ ] Configure mutation testing (Stryker) for critical paths.
2. [ ] Add security scanning (Snyk, Trivy) to CI pipeline.
3. [ ] Implement coverage thresholds (80% minimum).
4. [ ] Add bundle size monitoring for frontend packages.

---

## Milestone 9 — Production Infrastructure

_Objective_: harden infrastructure for production deployment.

### Phase A — Infrastructure Hardening

1. [ ] Implement blue/green deployment automation.
2. [ ] Configure SSL/TLS certificates via AWS ACM.
3. [ ] Set up CloudFront CDN for static assets.
4. [ ] Implement secrets management via AWS Secrets Manager.

### Phase B — Observability

1. [ ] Integrate Datadog/New Relic for APM.
2. [ ] Configure log aggregation (CloudWatch Logs or Datadog).
3. [ ] Set up alerting for critical metrics (error rate, latency).
4. [ ] Implement distributed tracing across services.

### Phase C — Disaster Recovery

1. [ ] Implement automated backup for SQLite databases.
2. [ ] Configure multi-region failover (Route 53 health checks).
3. [ ] Document runbooks for common incident scenarios.
4. [ ] Conduct chaos engineering exercises.

---

## Milestone 10 — Multi-Language SDK Support

_Objective_: provide official SDKs for major programming languages.

### Phase A — SDK Generation

1. [ ] Configure OpenAPI Generator for TypeScript (existing).
2. [ ] Generate Python SDK client.
3. [ ] Generate Go SDK client.
4. [ ] Generate Ruby SDK client.

### Phase B — SDK Publishing

1. [ ] Set up npm publishing for `@blerp/*` packages.
2. [ ] Set up PyPI publishing for `blerp-python`.
3. [ ] Set up Go module publishing.
4. [ ] Configure versioning and changelog automation.

### Phase C — SDK Documentation

1. [ ] Generate API reference docs from OpenAPI spec.
2. [ ] Create language-specific quickstart guides.
3. [ ] Add code examples for common use cases.
4. [ ] Create interactive API playground.

---

## Milestone 11 — Advanced Security & Compliance

_Objective_: achieve enterprise-grade security posture.

### Phase A — Security Enhancements

1. [ ] Implement rate limiting per API key with configurable limits.
2. [ ] Add IP allowlisting for enterprise customers.
3. [ ] Implement API key rotation with zero-downtime.
4. [ ] Add anomaly detection for suspicious login patterns.

### Phase B — Compliance

1. [ ] Complete SOC 2 Type I assessment preparation.
2. [ ] Implement GDPR data export/deletion endpoints.
3. [ ] Add audit log retention policies.
4. [ ] Document security whitepaper.

### Phase C — Penetration Testing

1. [ ] Engage third-party security audit.
2. [ ] Remediate all critical/high findings.
3. [ ] Implement security headers validation in CI.
4. [ ] Add dependency vulnerability scanning with blocking.

---

## Phase F — Engineering Standards (Ongoing)

1. [ ] Standardize error handling across all services.
2. [ ] Optimize GitHub Actions workflows for faster feedback.
3. [ ] Implement consistent logging patterns.
4. [ ] Add pre-commit hooks for security scanning.

---

## Future Considerations (Not Currently Planned)

The following features exist in Clerk but are not currently prioritized:

- **Billing Components**: `<PricingTable />`, `<CheckoutButton />`, etc. (Beta in Clerk)
- **M2M Tokens**: Machine-to-machine authentication (Beta in Clerk)
- **OAuth Applications**: Blerp as an OAuth provider
- **Web3 Authentication**: MetaMask, Coinbase Wallet, Solana wallets
- **Native Mobile SDKs**: iOS (Swift), Android (Kotlin)
