# Blerp Identity Service — Execution Plan

> **Related docs**: Feature list → `FEATURES.md` | Architecture → `DESIGN_DOCUMENT.md` | Clerk/Monite parity → `GAP_ANALYSIS.md` | Next actions → `DO_NEXT.md` | Bug tracker → `BUGS.md`
>
> **Tooling note**: All package management and script commands MUST run via Bun in npm-compatible mode—use `bun install` for deps, `bun run <script>` for package scripts, and `bunx <binary>` (e.g., Turbo, Spectral) for direct CLI execution. Never use `npm`, `pnpm`, or `yarn` in this project.

> **Engineering standards**: Commit to absolute type safety. NEVER use `any`, `object`, or type ignores (`@ts-ignore`, `eslint-disable`). Type casts (`as`) should be avoided and used only as a documented last resort. Prefer optional properties (`?`) and unions over `null`, prefer shallow indentation via early exits and inverted conditionals, isolate only exception-throwing statements inside try blocks, and build an imperative shell around functional/pure cores when practical.

## Milestones Overview

| Milestone | Description                                                                           | Status              |
| --------- | ------------------------------------------------------------------------------------- | ------------------- |
| M1        | Core Platform Foundations                                                             | ✅ Complete         |
| M2        | Enterprise & Ecosystem Expansion                                                      | ✅ Complete         |
| M3        | Experience & Scale                                                                    | ✅ Complete         |
| M4        | Framework Adapters (Next.js Parity)                                                   | ✅ Complete         |
| M5        | Monite SDK Parity & Advanced Metadata                                                 | ✅ Complete         |
| M6        | Monite SDK Full Feature Parity                                                        | ✅ Complete         |
| M7        | Clerk SDK Parity                                                                      | ✅ Complete         |
| M8        | UI Flow E2E Testing                                                                   | ✅ Complete         |
| M9        | Production Infrastructure                                                             | ⏸️ Blocked          |
| M10       | Multi-Language SDK Support                                                            | 📋 Planned          |
| M11       | Advanced Security & Compliance                                                        | 📋 Planned          |
| M12       | Dashboard Feature Completion                                                          | ✅ Complete         |
| —         | Dashboard UI Gap Analysis (Clerk/Monite Parity)                                       | ✅ Complete (P0+P1) |
| —         | Monite SDK 100% Parity + Clerk P1 Quality                                             | ✅ Complete         |
| —         | P2 Production Polish Batch 1                                                          | ✅ Complete         |
| —         | P2 Production Polish Batch 2                                                          | ✅ Complete         |
| —         | P2/P3 Batch 3 (Dark Mode, Search, Shortcuts, Redirect URLs, Testing Tokens, Bulk Ops) | ✅ Complete         |
| —         | SDK Quality Hardening + Custom Roles (C13) + M2M Tokens (C5)                          | ✅ Complete         |

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

### Milestone 5 — Monite SDK Parity & Advanced Metadata ✅

- `@blerp/backend` with `blerpClient` (clerkClient parity)
- Private/public/unsafe metadata endpoints
- `Protect` component and `has` permission helper
- `OrganizationProfile`, `CreateOrganization` components
- Webhook handler middleware
- `@blerp/testing` package with Playwright helpers

### Milestone 6 — Monite SDK Full Feature Parity ✅

- Deep-merge strategy for nested metadata (`entities` object)
- Query users by metadata values
- Organization Domains REST API with verification
- Verified domain auto-enrollment
- Full `@monite/sdk-react` integration example
- Clerk-to-Blerp mapping documentation

### Milestone 7 — Clerk SDK Parity ✅

- User components: `<UserProfile />`, `<UserButton />`, `<UserAvatar />`
- Control components: `<SignedIn />`, `<SignedOut />`, redirects
- Auth flow components: `<TaskResetPassword />`, `<TaskSetupMFA />`
- User object enhancements: MFA fields, `locked`, `externalId`
- Hooks: `useUser()`, `useClerk()`, `useSignIn()`, `useSignUp()`
- Standardized error handling with `BlerpError` classes
- CI/CD optimization with parallel jobs and caching

### Milestone 8 — UI Flow E2E Testing ✅

- Auth flow tests: signup, signin, signout, password-reset
- User profile tests: profile, sessions, security
- Organization tests: crud, switching, members, domains
- Access control tests: protected-routes, permissions
- CI integration: E2E tests run on every PR with artifact upload

---

## Milestone 9 — Production Infrastructure ⏸️

> **Blocked**: Requires AWS credentials and infrastructure access. Resume when available.

_Objective_: Deploy Blerp to production infrastructure.

### Phase A — Infrastructure Setup

1. [ ] Create `infra/task-definition.json` for ECS
2. [ ] Create ECR repository
3. [ ] Configure Route 53 domain
4. [ ] Set up SSL certificates via ACM

### Phase B — Deployment

5. [ ] Tag v1.0.0 release
6. [ ] Configure AWS secrets
7. [ ] Deploy to ECS
8. [ ] Verify production health

---

## Milestone 10 — Multi-Language SDK Support

_Objective_: Provide official SDKs for major programming languages.

1. [ ] Generate Python SDK from OpenAPI
2. [ ] Generate Go SDK from OpenAPI
3. [ ] Set up package publishing (npm, PyPI, Go modules)

---

## Milestone 11 — Advanced Security & Compliance

_Objective_: Achieve enterprise-grade security posture.

1. [ ] Complete security audit
2. [ ] Implement GDPR endpoints
3. [ ] Add rate limiting per API key
4. [ ] Configure anomaly detection

---

## Milestone 12 — Dashboard Feature Completion 🔄

_Objective_: Implement placeholder features in the dashboard UI.

### Phase A — User Profile Features

1. [x] **Profile Editing**
   - Edit first name, last name, username
   - Form validation and submission
   - File: `UserProfile.tsx`

2. [x] **Email Management**
   - List email addresses
   - Add/remove emails
   - Email verification flow
   - File: `UserProfile.tsx`

3. [x] **Password Change**
   - Current password verification
   - New password form
   - Password strength indicator
   - File: `UserProfile.tsx`

4. [x] **2FA Enrollment**
   - TOTP QR code display
   - Verification code input
   - Backup codes generation
   - File: `UserProfile.tsx`

### Phase B — Settings Features

5. [x] **Project Settings**
   - Project name editing
   - Domain configuration
   - File: `SettingsPage.tsx`

6. [x] **API Key Management**
   - List keys (secret + publishable)
   - Create new keys
   - Revoke keys
   - File: `SettingsPage.tsx`

7. [x] **Project Deletion**
   - Confirmation dialog
   - Type project name to confirm
   - Cascade delete all data
   - File: `SettingsPage.tsx`

### Phase C — Organization Features ✅

8. [x] **Invitation Creation**
   - Invite by email form
   - Role selection
   - Resend invitation
   - File: `OrganizationInvitations.tsx`

9. [x] **Webhook Creation**
   - Add webhook endpoint form
   - Event selection
   - Secret generation
   - File: `WebhookList.tsx`

10. [x] **Domain Management**
    - Add domain form
    - DNS verification instructions
    - Verification check
    - File: `OrganizationDomains.tsx`

---

## Dashboard UI Gap Analysis (Clerk/Monite Parity) ✅

_Objective_: Close critical UI gaps identified in `GAP_ANALYSIS.md` to reach Clerk production quality.

### Completed — P0 + P1 (2026-03-19)

| Phase | Feature                                                  | Status      |
| ----- | -------------------------------------------------------- | ----------- |
| 1     | Sign In Page (backend + frontend two-step flow)          | ✅ Complete |
| 2     | Org Deletion + Account Deletion (type-to-confirm modals) | ✅ Complete |
| 3     | Connected Accounts (OAuth identity connect/disconnect)   | ✅ Complete |
| 4     | Pagination (reusable component + hook)                   | ✅ Complete |
| 5     | Toast Notification System (context-based, auto-dismiss)  | ✅ Complete |
| 6     | Loading Skeletons (10 components upgraded)               | ✅ Complete |
| 7     | Session Info + Backup Codes + Passkey Delete             | ✅ Complete |
| 8     | Admin User Management Page (/admin/users)                | ✅ Complete |
| 9     | Avatar Upload (backend + frontend)                       | ✅ Complete |

### Completed — Monite SDK 100% Parity + Clerk P1 (2026-03-19)

| Item  | Feature                                                             | Status      |
| ----- | ------------------------------------------------------------------- | ----------- |
| M2+M3 | OrganizationSwitcher nav props (afterSelect/afterLeave/afterCreate) | ✅ Complete |
| M5    | `createRouteMatcher()` + callback-form `blerpMiddleware`            | ✅ Complete |
| M6    | `clerkClient()` async factory in `@blerp/backend`                   | ✅ Complete |
| C9    | User full-text search (`query` param)                               | ✅ Complete |
| C10   | User `orderBy` param                                                | ✅ Complete |
| C11   | Organization list pagination (`limit`/`offset`/`meta.total`)        | ✅ Complete |
| D1    | Audit log filtering (action, date range, server-side)               | ✅ Complete |
| D6    | Error boundaries (React ErrorBoundary wrapping Routes)              | ✅ Complete |

### Completed — P2 Production Polish Batch 1 (2026-03-19)

| Item | Feature                                                     | Status      |
| ---- | ----------------------------------------------------------- | ----------- |
| D2   | Passkey rename (inline edit UI + backend PATCH)             | ✅ Complete |
| C14  | User restore (undelete + soft-delete filter)                | ✅ Complete |
| D12  | Revoke all sessions (backend + UI with confirmation)        | ✅ Complete |
| U5   | Phone number CRUD (backend + hooks + PhoneNumberList UI)    | ✅ Complete |
| D3   | Leave organization (last-owner guard + confirmation modal)  | ✅ Complete |
| D4   | Org profile editing (EditOrganizationModal)                 | ✅ Complete |
| D5   | Responsive/mobile layout (hamburger menu + overlay sidebar) | ✅ Complete |
| D7   | Form validation (useFormValidation hook + adopted in forms) | ✅ Complete |

### Completed — P2 Production Polish Batch 2 (2026-03-19)

| Item  | Feature                                                                        | Status      |
| ----- | ------------------------------------------------------------------------------ | ----------- |
| C12   | Session IP/UA capture (DB columns + controller mapping + UI column)            | ✅ Complete |
| C1+C2 | Allowlist/blocklist identifiers (DB table + service + UI + signup enforcement) | ✅ Complete |
| U1    | OrganizationList component (extracted from OrganizationsPage)                  | ✅ Complete |
| C3    | Sign-in tokens / magic links (DB table + service + routes + SignIn UI)         | ✅ Complete |
| D11   | Webhook delivery logs (DB table + worker logging + service + UI)               | ✅ Complete |

### Completed — P2/P3 Batch 3 (2026-03-19)

| Item | Feature                                                          | Status      |
| ---- | ---------------------------------------------------------------- | ----------- |
| U2   | Dark mode (ThemeProvider + dark: variants on all 46+ components) | ✅ Complete |
| D8   | Global search (Cmd+K command palette, org query backend)         | ✅ Complete |
| D9   | Keyboard shortcuts (useKeyboardShortcuts hook)                   | ✅ Complete |
| C6   | Redirect URLs (DB + CRUD + OAuth validation + settings UI)       | ✅ Complete |
| C4   | Testing tokens (dev-only POST /auth/testing-tokens)              | ✅ Complete |
| D10  | Bulk operations (POST /users/bulk + multi-select UI)             | ✅ Complete |

### ✅ Resolved — All P0/P1 Security & Quality Issues (2026-03-20)

All SDK quality gaps (S1-S5), production stubs (BUG-18-20), and quality issues (Q1-Q7) resolved. See `BUGS.md` for details.

### Remaining — P2 (1 item)

- SAML connections (C7) — deferred, 4-6 week effort

### Remaining — P3 (6 items)

- Theming (D13), i18n (D14), email/SMS templates (C8), notification center (D15), appearance customization (U3), SMS MFA (U6)

**Test Results**: 49/49 API unit tests, 155/155 E2E tests, 16/16 Storybook tests — all passing. CI green.

---

## Future Considerations (Not Currently Planned)

- **Billing Components**: `<PricingTable />`, `<CheckoutButton />`
- **OAuth Applications**: Blerp as an OAuth provider
- **Web3 Authentication**: MetaMask, Coinbase Wallet, Solana wallets
- **Native Mobile SDKs**: iOS (Swift), Android (Kotlin)
