# M1-PD-T1 — SPA Auth Flows via Generated Clients

- **Phase**: Milestone 1 — Phase D (Frontend Flows & SDK Compatibility)
- **Plan Reference**: PLAN.md › Phase D Task 1
- **Status**: Completed

## Objective

Implement sign-in/sign-up/profile/organization flows in the dashboard SPA using the OpenAPI-generated clients to exercise the REST API end-to-end.

## Scope

- Hook SPA routes/components to the auth/session endpoints, including error messaging and MFA UX placeholders.
- Ensure state management, theming, and responsive layouts cover the flows listed in the user stories.
- Wire flows to local dev environment via `blerp dev` with environment toggles.

## Related User Stories

- (#7) Dev wants React SPA flows hitting the JSON API directly.
- (#8) Dev relies on generated clients for consistency.
- (#26) EndUser signs up/signs in with various methods.
- (#27) EndUser manages MFA and backup codes.
- (#28) EndUser switches orgs, views sessions/devices.
- (#29) EndUser expects branded hosted components.
- (#30) EndUser wants magic links/passkeys for quick auth.

## Acceptance & Definition of Done Alignment

- Meets DoD/Acceptance Criteria: flows demo-able locally, Storybook docs updated, tests (unit/e2e) added as feasible, logs/docs recorded.
- Generated clients remain source of truth (no handwritten duplications) and Clerk SDK expectations validated manually.

## Deliverables

- SPA components/hooks/pages implementing flows plus documentation/Storybook references.

## Dependencies

- **Depends on**: `M1-PA-T3`, `M1-PC-T1`, `M1-PC-T2`, `M1-PC-T3`, `M1-PC-T4`, `M1-PC-T5`.
- **Blocking**: `M1-PD-T2`, `M1-PD-T3`, `M1-PD-T4`, `M1-PD-T5`, `M1-PE-T4`, `M1-PE-T5`.
