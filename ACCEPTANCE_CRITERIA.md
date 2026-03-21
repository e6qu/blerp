# Acceptance Criteria

Use the following criteria to decide whether a task/phase is acceptable. All items must be satisfied unless the plan explicitly overrides them.

1. **Spec Compliance**
   - Implementation matches the behavior described in `DESIGN_DOCUMENT.md`, `FEATURES.md`, and `openapi/blerp.v1.yaml`.
   - `@blerp/nextjs` SDK and `@blerp/testing` package validate Clerk-compatible behavior. Official Clerk SDKs can also be pointed at Blerp for additional validation.

2. **Tests & Validation**
   - Unit/integration tests exist (or are updated) for new logic, passing locally.
   - Spectral/Redocly validation passes when OpenAPI changes occur.
   - MSW/Storybook scenes updated for SPA flows touched.

3. **Documentation**
   - `PLAN.md` progress updated (phase/task status).
   - `STATUS.md`, `WHAT_WE_DID.md`, `DO_NEXT.md` updated with concise notes.
   - Any new behavior documented in relevant markdown files (design/features/user stories) if scope changed.

4. **Operational Readiness**
   - Docker/Turbo tasks run cleanly; `docker-compose` succeeds for touched services.
   - ECS/IaC configs updated if infra changes.

5. **Quality Gates**
   - Code formatted (Prettier/ESLint or applicable tool).
   - **Strict Typing**: Zero usage of `any`, `object`, or type ignores (`@ts-ignore`, `eslint-disable`). Type casts (`as`) are permitted only exceptionally when no other type-safe path exists and must be documented.
   - **Null-Safety**: Minimize usage of `null` in favor of TypeScript optional properties (`?`) or union types (e.g., `string | undefined`).
   - No critical lint/type errors.
   - Security-sensitive changes reviewed for secrets exposure, auth checks, and rate limiting.

If any criterion fails, the task is not accepted: document the blocker in `STATUS.md` and queue follow-up work in `DO_NEXT.md`.
