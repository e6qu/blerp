# Milestone 1 Specification Suite

These specifications validate the implementation of the Blerp Identity Service for Milestone 1. Each spec ties concrete acceptance scenarios to plan tasks (`PLAN.md`), task briefs (`tasks/to-do/*.md`), and user stories (`USER_STORIES.md`).

| Spec                                                                           | Phase Coverage | Purpose                                                                                                                        |
| ------------------------------------------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [`M1-P0-openapi-schema.md`](M1-P0-openapi-schema.md)                           | Phase 0        | Validates the OpenAPI contract, linting, previews, and SDK generation hooks.                                                   |
| [`M1-PA-tooling.md`](M1-PA-tooling.md)                                         | Phase A        | Ensures repo scaffolding, tooling, docker stack, CI/CD scaffolds, and infra bootstraps behave as required.                     |
| [`M1-PB-identity-data-model.md`](M1-PB-identity-data-model.md)                 | Phase B        | Confirms multi-tenant SQLite schemas, router/migrations, Redis integration, and persistence tests.                             |
| [`M1-PC-auth-session-api.md`](M1-PC-auth-session-api.md)                       | Phase C        | Captures validation for auth/session controllers, credential utilities, JWT rotation, session stores, and integration testing. |
| [`M1-PD-frontend-sdk-compat.md`](M1-PD-frontend-sdk-compat.md)                 | Phase D        | Verifies SPA flows, Storybook/MSW coverage, Clerk SDK harnesses, SDK repointing docs, and demo templates.                      |
| [`M1-PE-observability-security-docs.md`](M1-PE-observability-security-docs.md) | Phase E        | Validates observability, logging, rate limits, security hardening, and developer documentation deliverables.                   |

## How to Use

1. Identify the task you are implementing (from `tasks/to-do`).
2. Open the matching spec and follow the "Validation Plan" checklist before marking the task complete.
3. Record outcomes (pass/fail, evidence artifacts) in `WHAT_WE_DID.md` and reference the spec section.
4. If scope changes, update the spec first so validation remains accurate.
