# M4-PC-T1 — Next.js Compliance & Quickstart Verification

- **Phase**: Milestone 4 — Framework Adapters (Next.js Parity)
- **Plan Reference**: PLAN.md › Phase C Task 1, 2, 3
- **Status**: Completed

## Objective

Validate 100% compliance with Clerk Next.js tutorials by implementing a replica of the Clerk Quickstart and Custom Auth Page guides using Blerp.

## Scope

- Create `examples/nextjs-quickstart` monorepo workspace.
- Implement `middleware.ts` using `blerpMiddleware`.
- Implement `layout.tsx` using `BlerpProvider`.
- Create a protected route using `auth()` in a Server Component.
- Create a custom sign-in/up page using Blerp components.
- Verify everything with Playwright E2E tests.

## Related User Stories

- Developer Quickstart Parity.

## Acceptance & Definition of Done Alignment

- The example app follows the exact same structure as the Clerk tutorial.
- Authentication and route guarding work identically to Clerk.
- Conforms to DoD: Playwright tests pass against the example app.

## Deliverables

- `examples/nextjs-quickstart` application.
- Playwright test suite for compliance verification.
- Final Milestone 4 closure and documentation.
