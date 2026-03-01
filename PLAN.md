# Blerp Identity Service — Execution Plan

> **Tooling note**: All package management and script commands MUST run via Bun in npm-compatible mode—use `bun install` for deps, `bun run <script>` for package scripts, and `bunx <binary>` (e.g., Turbo, Spectral) for direct CLI execution. Never use `npm`, `pnpm`, or `yarn` in this project.

> **Engineering standards**: Commit to absolute type safety. NEVER use `any`, `object`, or type ignores (`@ts-ignore`, `eslint-disable`). Type casts (`as`) should be avoided and used only as a documented last resort. Prefer optional properties (`?`) and unions over `null`, prefer shallow indentation via early exits and inverted conditionals, isolate only exception-throwing statements inside try blocks, and build an imperative shell around functional/pure cores when practical.

## Milestones Overview

| Milestone | Description                           | Status         |
| --------- | ------------------------------------- | -------------- |
| M1        | Core Platform Foundations             | ✅ Complete    |
| M2        | Enterprise & Ecosystem Expansion      | ✅ Complete    |
| M3        | Experience & Scale                    | ✅ Complete    |
| M4        | Framework Adapters (Next.js Parity)   | ✅ Complete    |
| M5        | Monite SDK Parity & Advanced Metadata | ✅ Complete    |
| M6        | Monite SDK Full Feature Parity        | ✅ Complete    |
| M7        | Clerk SDK Parity                      | ✅ Complete    |
| M8        | UI Flow E2E Testing                   | ✅ Complete    |
| M9        | Production Infrastructure             | ⏸️ Blocked     |
| M10       | Multi-Language SDK Support            | 📋 Planned     |
| M11       | Advanced Security & Compliance        | 📋 Planned     |
| M12       | Dashboard Feature Completion          | 🔄 In Progress |

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

## Milestone 8 — UI Flow E2E Testing ✅

_Objective_: Implement comprehensive Playwright E2E tests for all UI flows to ensure production readiness.

### Phase A — Authentication Flow Tests

1. [x] **Sign Up Flow**
   - Test: User can create account with email
   - Test: User sees validation errors for invalid inputs
   - Test: User can verify email (if enabled)
   - File: `tests/auth/signup.spec.ts`

2. [x] **Sign In Flow**
   - Test: User can sign in with valid credentials
   - Test: User sees error for invalid credentials
   - Test: Redirect after successful sign in
   - File: `tests/auth/signin.spec.ts`

3. [x] **Sign Out Flow**
   - Test: User can sign out
   - Test: Session is cleared after sign out
   - Test: Protected routes redirect after sign out
   - File: `tests/auth/signout.spec.ts`

4. [x] **Password Reset Flow**
   - Test: User can request password reset
   - Test: User receives reset email (mocked)
   - Test: User can set new password
   - File: `tests/auth/password-reset.spec.ts`

### Phase B — User Profile Tests

5. [x] **Profile Management**
   - Test: User can view their profile
   - Test: User can update name and username
   - Test: User can upload avatar
   - File: `tests/user/profile.spec.ts`

6. [x] **Session Management**
   - Test: User can view active sessions
   - Test: User can revoke a session
   - Test: Revoked session is invalidated
   - File: `tests/user/sessions.spec.ts`

7. [x] **Security Settings**
   - Test: User can view security settings
   - Test: User can enable TOTP MFA
   - Test: User can generate backup codes
   - File: `tests/user/security.spec.ts`

### Phase C — Organization Flow Tests

8. [x] **Organization CRUD**
   - Test: User can create organization
   - Test: Organization appears in switcher after creation
   - Test: User can update organization name
   - Test: User can delete organization
   - File: `tests/organizations/crud.spec.ts`

9. [x] **Organization Switching**
   - Test: User can switch between organizations
   - Test: Active org is persisted across page reloads
   - Test: Data is isolated per organization
   - File: `tests/organizations/switching.spec.ts`

10. [x] **Member Management**
    - Test: Owner can invite members
    - Test: Invitee receives invitation
    - Test: Member can accept invitation
    - Test: Owner can change member role
    - Test: Owner can remove member
    - File: `tests/organizations/members.spec.ts`

11. [x] **Organization Domains**
    - Test: Admin can add domain
    - Test: Domain verification flow
    - Test: Verified domain shows in org list
    - File: `tests/organizations/domains.spec.ts`

### Phase D — Access Control Tests

12. [x] **Protected Routes**
    - Test: Unauthenticated user redirected to sign in
    - Test: Authenticated user can access protected routes
    - Test: Role-based access control works
    - File: `tests/access/protected-routes.spec.ts`

13. [x] **Permission Checks**
    - Test: `<SignedIn>` / `<SignedOut>` rendering
    - Test: `has()` permission helper
    - Test: Organization role permissions
    - File: `tests/access/permissions.spec.ts`

### Phase E — Test Infrastructure

14. [x] **Shared Fixtures**

- Create reusable test fixtures for users, orgs, sessions
- File: `tests/fixtures/index.ts`

15. [ ] **Test Data Seeding**

- Implement seed script for consistent test data
- File: `tests/seed.ts`

16. [ ] **Visual Regression Setup**

- Configure Playwright snapshots for key pages
- File: `tests/visual/*.spec.ts`

### Phase F — CI Integration

17. [x] **E2E in CI Pipeline**

- Run E2E tests in GitHub Actions
- Upload Playwright reports as artifacts
- Fail CI on E2E test failures

### Phase G — Critical Path E2E Tests ✅

18. [x] **Authentication Tests** (Enhanced)
    - Sign up form validation and submission
    - OAuth button redirects (GitHub, Google)
    - Sign out flow (button, API call, redirect)
    - Loading/error states
    - File: `tests/auth/signup.spec.ts`, `tests/auth/signout.spec.ts`

19. [x] **Organization CRUD Tests**
    - Create org modal (from page and switcher)
    - Form validation (name required, slug auto-gen)
    - Submit creates org, appears in list
    - Cancel/close modal behavior
    - Loading/error states
    - File: `tests/organizations/crud.spec.ts`

20. [x] **Organization Switching Tests**
    - Dropdown open/close behavior
    - Org selection updates UI
    - Create org from dropdown
    - File: `tests/organizations/switching.spec.ts`

21. [x] **Member Management Tests**
    - Members list loads for selected org
    - Edit role dropdown (owner/admin/member)
    - Save updates role via API
    - Delete member with confirmation
    - Loading/disabled states
    - File: `tests/organizations/members.spec.ts`

22. [x] **Navigation & Access Tests**
    - Sidebar navigation to all pages
    - Active state highlighting
    - Tab navigation within pages
    - File: `tests/access/navigation.spec.ts`

### Phase H — Future E2E Tests (Lower Priority)

23. [ ] **Invitations Tests** (requires invitation creation UI)
24. [ ] **Webhooks Tests** (requires webhook creation UI)
25. [ ] **Domains Tests** (requires domain creation UI)
26. [ ] **Sessions Tests** (enhanced with revoke)
27. [ ] **Settings Tests** (enhanced with actual settings)
28. [ ] **Visual Regression Tests** (snapshots)

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

4. [ ] **2FA Enrollment**
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

## Future Considerations (Not Currently Planned)

- **Billing Components**: `<PricingTable />`, `<CheckoutButton />`
- **M2M Tokens**: Machine-to-machine authentication
- **OAuth Applications**: Blerp as an OAuth provider
- **Web3 Authentication**: MetaMask, Coinbase Wallet, Solana wallets
- **Native Mobile SDKs**: iOS (Swift), Android (Kotlin)
