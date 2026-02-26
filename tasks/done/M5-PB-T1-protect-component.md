# M5-PB-T1 — Protect Component & RBAC Helpers for Next.js

- **Phase**: Milestone 5 — Phase B (Advanced Next.js Integration)
- **Plan Reference**: PLAN.md › Phase B Task 1
- **Status**: Completed

## Objective

Implement high-level RBAC helpers for Next.js, including a `<Protect />` component and a `has` permission helper, to match Clerk's authorization developer experience.

## Scope

- Implement `<Protect />` component in `@blerp/nextjs`.
- `<Protect />` should support:
  - `permission` prop (e.g., `permission="org:write"`)
  - `role` prop (e.g., `role="admin"`)
  - `fallback` prop for unauthorized state.
- Implement `has()` helper for use in Server Components and Middleware.
- Integrate with the existing `useAuth` hook to access role/permission data.
- Support active organization context within the auth state.

## Related User Stories

- Monite SDK Integration Parity (RBAC enforcement).

## Acceptance & Definition of Done Alignment

- Components correctly hide/show content based on user permissions.
- Helpers work in both Client and Server environments.
- Conforms to DoD: Storybook stories and unit tests for RBAC helpers.

## Deliverables

- `<Protect />` component.
- `has()` permission helper.
- Updated `useAuth` hook with role/permission data.
- Updated docs/status logs.
