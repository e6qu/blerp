# M6-PA-T1 — Deep Metadata Merging & Schema Validation

- **Phase**: Milestone 6 — Phase A (Advanced Metadata Hardening)
- **Plan Reference**: PLAN.md › Milestone 6 Task 1
- **Status**: To Do

## Objective

Implement deep merging for `updateUserMetadata` and `updateOrganizationMetadata` to correctly handle the nested `entities` mapping and other complex structures discovered in the Monite SDK.

## Scope

- Update `AuthService` and `OrganizationService` to use deep merging instead of shallow object spreads for metadata.
- Add validation logic to ensure `entities` mapping follows the `{ [entity_id]: { entity_user_id, organization_id } }` structure.
- Add unit tests for deep metadata merges.

## Definition of Done

- [ ] Deep merging works for nested metadata objects.
- [ ] Validation prevents malformed `entities` data.
- [ ] Unit tests pass.
