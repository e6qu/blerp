# M5-PB-T2 — Organization Management Components

- **Phase**: Milestone 5 — Phase B (Advanced Next.js Integration)
- **Plan Reference**: PLAN.md › Phase B Task 2
- **Status**: Completed

## Objective

Implement high-level organization management components (`OrganizationProfile`, `CreateOrganization`) matching Clerk's UI and functional capabilities.

## Scope

- Implement `<CreateOrganization />` component in `@blerp/nextjs`.
  - Form for organization name and slug.
  - Integration with `useCreateOrganization` hook.
- Implement `<OrganizationProfile />` component in `@blerp/nextjs`.
  - Tabs for General (metadata, details), Members, and Invitations.
  - Support for updating organization details and metadata.
- Ensure components are "Client Components" and properly handle loading/error states.
- Export components from the main `@blerp/nextjs` entry point.

## Related User Stories

- Monite SDK Integration Parity (Org management).

## Acceptance & Definition of Done Alignment

- Users can create organizations and manage their profiles via drop-in components.
- Components interact correctly with the backend APIs.
- Conforms to DoD: Storybook stories for the new components.

## Deliverables

- `<CreateOrganization />` component.
- `<OrganizationProfile />` component.
- Updated docs/status logs.
