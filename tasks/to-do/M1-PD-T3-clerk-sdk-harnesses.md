# M1-PD-T3 — Clerk SDK Compatibility Harnesses

- **Phase**: Milestone 1 — Phase D (Frontend Flows & SDK Compatibility)
- **Plan Reference**: PLAN.md › Phase D Task 3
- **Status**: Pending

## Objective
Configure automated harnesses that run the official Clerk SDKs (`@clerk/clerk-react`, ClerkJS, server SDKs) against local Blerp instances to verify API/schema parity.

## Scope
- Script environment setup that points Clerk SDKs to the local Blerp endpoints using generated clients/auth flows.
- Add automated smoke tests (Vitest/Playwright) capturing success/failure of SDK flows.
- Integrate harnesses into CI with documented troubleshooting steps.

## Related User Stories
- (#6) Dev needs to run Clerk SDKs unmodified against Blerp.
- (#8) Dev wants generated clients that match SDK expectations.

## Acceptance & Definition of Done Alignment
- Complies with DoD/Acceptance Criteria: harness scripts committed, tests executed locally/CI, documentation/logs updated, acceptance success criteria recorded.
- Failures should break CI and produce actionable logs.

## Deliverables
- Harness scripts/config, CI integration, and README instructions for running compatibility checks.

## Dependencies
- **Depends on**: `M1-PD-T1`, `M1-PD-T2`, `M1-PC-T5`.
- **Blocking**: `M1-PD-T4`, `M1-PE-T5`.
