# M4-PB-T1 — Extract UI Components to @blerp/nextjs

- **Phase**: Milestone 4 — Framework Adapters (Next.js Parity)
- **Plan Reference**: PLAN.md › Phase B Task 1
- **Status**: Completed

## Objective

Extract and polish the functional UI components (`SignUp`, `OrganizationSwitcher`, etc.) from the dashboard into the `@blerp/nextjs` package to provide a zero-config UI experience matching Clerk.

## Scope

- Port `SignUp`, `SignIn` (placeholder), `UserButton` (placeholder), and `OrganizationSwitcher` to `@blerp/nextjs`.
- Ensure components are "Client Components" compatible with Next.js App Router.
- Decouple components from dashboard-specific logic (e.g., hardcoded tenant IDs).
- Add support for an `appearance` prop for basic styling customization.
- Export components from the main `@blerp/nextjs` entry point.

## Related User Stories

- Developer Quickstart Parity.

## Acceptance & Definition of Done Alignment

- Components can be imported and rendered in a fresh Next.js app.
- Components interact correctly with the `BlerpProvider`.
- Conforms to DoD: Storybook stories for the exported components.

## Deliverables

- Exported React components in `@blerp/nextjs`.
- Storybook stories in `@blerp/nextjs` (optional, or verified via dashboard).
- Updated docs/status logs.
