# M6-PB-T3 — Verified Domain Auto-enrollment

- **Phase**: Milestone 6 — Phase B (Organization Domains & Discovery)
- **Plan Reference**: PLAN.md › Milestone 6 Task 3
- **Status**: To Do

## Objective

Enable automatic organization enrollment for users whose email domain matches a verified organization domain.

## Scope

- Update `AuthService.signUp` logic to check for verified domains.
- Automatically create a `Membership` for users with matching domains.
- Implement "Domain Discovery" logic to suggest organizations during signup.

## Definition of Done

- [ ] Users are auto-enrolled based on verified domains.
- [ ] Enrollment logic is tenant-safe.
- [ ] End-to-end signup tests verify the flow.
