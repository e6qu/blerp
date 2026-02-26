# M2-PA-T4 — Dashboard Organization UI

- **Phase**: Milestone 2 — Phase A (Organizations & RBAC)
- **Plan Reference**: PLAN.md › Phase A Task 4
- **Status**: Completed

## Objective

Update the Dashboard SPA with Organization switcher, member lists, and role management UIs.

## Scope

- Implement an Organization Switcher component in the sidebar or header.
- Create an "Organizations" management page to list and create organizations.
- Implement "Members" and "Invitations" tabs within the organization view.
- Support role assignment and invitation revocation from the UI.
- Use TanStack Query for data fetching and optimistic updates.

## Related User Stories

- (#28) EndUser switches orgs, views sessions/devices.
- (#2) Dev triggers signup/signin flows (invitations).

## Acceptance & Definition of Done Alignment

- Dashboard UI allows switching between organizations.
- Members and invitations are visible and manageable via the UI.
- Conforms to DoD: UI components tested via Storybook, integration with API verified.

## Deliverables

- Organization switcher, member list, and invitation UI components.
- Updated Dashboard routing and state management.
- Storybook stories for new components.
- Updated docs/status logs.

## Dependencies

- **Depends on**: `M2-PA-T1`, `M2-PA-T2`, `M2-PA-T3`.
- **Blocking**: Milestone 2 Phase B.
