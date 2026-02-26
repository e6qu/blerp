# M6-PA-T2 — Query Users by Metadata

- **Phase**: Milestone 6 — Phase A (Advanced Metadata Hardening)
- **Plan Reference**: PLAN.md › Milestone 6 Task 2
- **Status**: To Do

## Objective

Implement the ability to filter/query users by specific metadata keys and values, primarily to support resolving identities from Monite IDs.

## Scope

- Update `GET /v1/users` to support `metadata` query parameters (e.g., `private_metadata[monite_user_id]=mu_123`).
- Implement efficient SQLite JSON extraction for these queries.
- Add integration tests for metadata-based filtering.

## Definition of Done

- [ ] Users can be filtered by private/public metadata values.
- [ ] Performance remains acceptable on multi-tenant workloads.
- [ ] Integration tests pass.
