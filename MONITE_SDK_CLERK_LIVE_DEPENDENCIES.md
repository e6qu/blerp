# Monite SDK Clerk Live Dependencies

This document outlines the specific Clerk features and services that the Monite SDK integration relies on for operation, as identified from the official `monite-sdk` source code.

## 1. Authentication & Session Management

- **Core Auth**: Relies on Clerk's session management (JWT-based) to verify user identity.
- **Next.js Integration**: Uses `auth()` and `currentUser()` helpers to access session state in Server Components.
- **Middleware**: Depends on Clerk/Blerp middleware for route protection and cookie handling (`__blerp_org` for active organization persistence).

## 2. Multi-tenancy (Organizations)

- **Organization Context**: Monite requires a stable tenant context, which it maps to Clerk Organizations (`orgId`).
- **Organization Switcher**: Uses the `<OrganizationSwitcher />` component to allow users to navigate between different Monite Entities.
- **Active Org Persistence**: Depends on Clerk's ability to track and persist the "active" organization across requests.

## 3. Role-Based Access Control (RBAC)

- **Permissions & Roles**: Uses Clerk's RBAC system to gate access to Monite features.
- **Protect Component**: Relies on the `<Protect />` component for conditional rendering of UI elements based on organization-level permissions (e.g., `org:write`).
- **JWT Claims**: Depends on `org_role` and `org_permissions` being included in the session JWT.

## 4. Metadata API

- **Server-side Management**: Requires the `organizations.getOrganization`, `organizations.updateOrganizationMetadata` and `users.updateUserMetadata` API endpoints.
- **Private Metadata**: Specifically depends on the availability of a "private" metadata tier for secure storage of Monite IDs (`entity_id`, `entities`).

## 5. Webhook System

- **Event-Driven Sync**: Relies on `organization.created` and `user.created` events to trigger background synchronization tasks.
- **Signature Verification**: Requires HMAC-SHA256 (or similar) signature verification to ensure the integrity of webhook payloads.

## 6. Organization Domains

- **Domain Management**: Relies on Clerk's Organization Domains feature to manage and verify domains for auto-enrollment and email-based routing.
- **Verified Domains**: Uses `verified_domains` in Organization metadata to store domain verification status and enrollment modes.

## 7. Frontend UI Components

- **Drop-in UI**: Uses Clerk's pre-built components (`<SignIn />`, `<SignUp />`, `<UserButton />`, `<OrganizationSwitcher />`, `<OrganizationProfile />`, `<CreateOrganization />`) to maintain a consistent user experience while managing complex auth/org flows.
