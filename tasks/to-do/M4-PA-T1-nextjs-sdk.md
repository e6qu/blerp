# M4-PA-T1 — Initialize @blerp/nextjs SDK

- **Phase**: Milestone 4 — Framework Adapters (Next.js Parity)
- **Plan Reference**: PLAN.md › Phase A Task 1, 2, 3, 4
- **Status**: Pending

## Objective

Implement a drop-in Next.js SDK that achieves feature parity with `@clerk/nextjs`.

## Scope

- Initialize `packages/nextjs` workspace.
- Implement `blerpMiddleware` for Edge-compatible route protection, session verification, and automatic token refresh.
- Implement `BlerpProvider` context wrapper for the React tree.
- Implement `auth()` and `currentUser()` server-side helpers leveraging Next.js App Router cookies.

## Related User Stories

- Developer Quickstart Parity.

## Acceptance & Definition of Done Alignment

- The package exposes standard Next.js hooks and middleware.
- Conforms to DoD: integration tests covering middleware and hooks.

## Deliverables

- `@blerp/nextjs` package in monorepo.
- Middleware, Context Provider, and Server Helpers.
- Updated docs/status logs.
