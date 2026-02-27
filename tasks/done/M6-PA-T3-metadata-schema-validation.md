# M6-PA-T3 — Metadata Schema Validation

- **Phase**: Milestone 6 — Phase A (Advanced Metadata Hardening)
- **Plan Reference**: PLAN.md › Milestone 6 Task 3
- **Status**: To Do

## Objective

Add server-side validation for metadata keys to ensure consistency and prevent data corruption in complex mappings like `entities`.

## Scope

- Implement a validation schema for the `entities` object in User private metadata.
- Add a middleware or service-level check for `updateUserMetadata`.
- Ensure malformed metadata updates return 400 Bad Request with clear error messages.

## Definition of Done

- [ ] Metadata updates are validated against a schema.
- [ ] Malformed data is rejected.
- [ ] Error messages follow RFC 7807 standards.
