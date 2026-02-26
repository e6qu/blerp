# M2-PB-T4 — Dashboard Webhook UI

- **Phase**: Milestone 2 — Phase B (Webhooks & Event System)
- **Plan Reference**: PLAN.md › Phase B Task 4
- **Status**: Completed

## Objective

Update the Dashboard SPA with a UI for managing webhook endpoints and monitoring event delivery.

## Scope

- Create a "Webhooks" management interface within the Organization view.
- Implement forms for creating and updating webhook endpoints (URL, event types).
- Display webhook secrets securely (masked by default).
- (Optional) Show recent delivery logs for each endpoint.
- Use TanStack Query for state management.

## Related User Stories

- (#14) Dev configures webhooks for user/session events.

## Acceptance & Definition of Done Alignment

- Users can create, view, and delete webhooks via the Dashboard.
- Secrets are generated and displayed correctly.
- Conforms to DoD: components covered by Storybook, integration with API verified.

## Deliverables

- Webhook management components.
- Updated Dashboard routing and state.
- Storybook stories for new components.
- Updated docs/status logs.

## Dependencies

- **Depends on**: `M2-PA-T4`, `M2-PB-T2`.
- **Blocking**: Milestone 2 release readiness.
