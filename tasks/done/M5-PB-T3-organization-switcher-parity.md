# M5-PB-T3 — Organization Switcher Parity

- **Phase**: Milestone 2 — Phase B (Advanced Next.js Integration)
- **Plan Reference**: PLAN.md › Phase B Task 3
- **Status**: Completed

## Objective

Implement a fully feature-parity `OrganizationSwitcher` component that manages the active organization state within the `BlerpProvider` context, matching Clerk's behavior.

## Scope

- Update `BlerpProvider` to support an `activeOrganizationId` state.
- Persist the active organization ID in a cookie (`__blerp_org`) to ensure server-side parity.
- Implement the `setActive` method within the auth context to switch between organizations.
- Update the `<OrganizationSwitcher />` component to use the new context methods.
- Support "Personal Account" (no organization) switching.

## Related User Stories

- (#28) EndUser switches orgs, views sessions/devices.

## Acceptance & Definition of Done Alignment

- Switching organizations updates the context globally across the app.
- The active organization ID is correctly propagated to the server via cookies.
- Conforms to DoD: integration tests for organization switching.

## Deliverables

- Updated `BlerpProvider` with organization state management.
- Polished `OrganizationSwitcher` component.
- Updated `useAuth` hook with organization switching support.
- Updated docs/status logs.
