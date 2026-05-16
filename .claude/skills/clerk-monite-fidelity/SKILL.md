---
name: clerk-monite-fidelity
description: Verify a blerp change against its real reference SDK — Clerk (auth/users/orgs/sessions/JWT) or Monite (entities/payables/receivables). Use whenever editing API controllers under apps/api/src/v1/, routes, SDK packages under packages/{backend,nextjs,shared,api}, or dashboard components that imitate Clerk/Monite UI. Catches drift between what we ship and what the real SDKs do.
---

# Clerk / Monite fidelity check

Blerp is a clean-room re-implementation of Clerk (auth surface) and an integration target for the Monite SDK (B2B payments). Every surface you touch has a **real reference**: either the official Clerk REST + JS SDK + Next.js SDK, or the Monite SDK + Monite REST API. Treat that reference as the spec. If our implementation drifts, our customers' SDK code breaks.

## When this skill applies

| Area                                                                     | Reference                                                                  |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| `apps/api/src/v1/controllers/user.controller.ts`                         | Clerk `/users` REST + `clerkClient.users.*`                                |
| `apps/api/src/v1/controllers/organization.controller.ts`                 | Clerk `/organizations` + `clerkClient.organizations.*`                     |
| `apps/api/src/v1/controllers/membership.controller.ts`                   | Clerk `/organizations/{id}/memberships`                                    |
| `apps/api/src/v1/controllers/invitation.controller.ts`                   | Clerk `/invitations` + `/organizations/{id}/invitations`                   |
| `apps/api/src/v1/controllers/session.controller.ts`                      | Clerk `/sessions` + JWT claims contract                                    |
| `apps/api/src/v1/controllers/webhook.controller.ts`                      | Clerk `/webhooks` + Svix signing                                           |
| `apps/api/src/v1/controllers/domain.controller.ts`                       | Clerk `/organizations/{id}/domains`                                        |
| `apps/api/src/v1/controllers/oauth.controller.ts`                        | OAuth 2.0 RFC 6749 + Clerk's grant subset                                  |
| `apps/api/src/v1/controllers/scim.controller.ts`                         | SCIM 2.0 RFC 7644 + Clerk's enterprise impl                                |
| `apps/api/src/v1/controllers/m2m.controller.ts`                          | OAuth `client_credentials` per Clerk's M2M                                 |
| `packages/backend/src/*`                                                 | `@clerk/backend` API parity (already expanded per recent PR #46)           |
| `packages/nextjs/src/*`                                                  | `@clerk/nextjs` API parity (auth(), middleware, SignedIn, SignedOut, etc.) |
| `packages/shared/src/*`                                                  | OpenAPI-derived types and lightweight SDK shape                            |
| `apps/dashboard/src/components/auth/*`                                   | Clerk dashboard UX (sign-in, sign-up, user-button, org-switcher)           |
| Monite SDK integration (e.g., Payables, Receivables, Counterparts views) | Monite REST API + `@monite/sdk-react`                                      |

References on disk:

- `GAP_ANALYSIS.md` — feature-by-feature comparison vs Clerk + Monite.
- `MONITE_SDK_CLERK_DATA.md` — data shape mapping.
- `MONITE_SDK_CLERK_LIVE_DEPENDENCIES.md` — runtime dependency map.
- `openapi/blerp.v1.yaml` — our public REST contract.
- `FEATURES.md`, `DESIGN_DOCUMENT.md` — design intent.

## The check (six steps)

Before you commit any change to a wire-facing handler, SDK package export, or Clerk/Monite-imitating UI:

### 1. Identify the reference shape the real SDK uses

Look at Clerk's public docs / SDK source, or Monite's docs / SDK source, for the operation you're touching:

- **Clerk REST**: `https://clerk.com/docs/reference/backend-api` (read in your head; the structure is stable). For each op: method, path, query params, request body, response body, error codes.
- **Clerk JS / Next.js SDK**: `clerkClient.users.getUser(id)`, `clerkClient.organizations.createOrganization({ name, slug, createdBy })`, etc. The method signature is the spec for the SDK shape.
- **Monite REST**: `https://docs.monite.com/api/`. For each op: same fields as above.
- **Monite SDK React components**: prop signatures, slots, event callbacks, theme contract.

Copy the exact path + method + query + body + response. This is the spec — not what the model "remembers."

### 2. Diff against the blerp implementation

Open the corresponding controller / SDK file / component and compare field-by-field:

- **Path & method** — case-sensitive; `/v1/users` vs `/users`.
- **Query params** — `limit` / `offset` vs `page_size` / `cursor` (Clerk uses both depending on endpoint).
- **Request body shape** — snake_case (Clerk REST) vs camelCase (JS SDK input). Blerp REST uses snake_case; mappers translate.
- **Response shape** — every field name, type, optional vs nullable, nested object shape. **The most common bug class in this repo is BUG-3-style camelCase leakage**: Drizzle returns camelCase, the response forgot the `mapX()` step, and the dashboard renders empty/broken data.
- **Status codes** — 422 vs 400 for validation; 409 vs 422 for conflict; 401 vs 403 for permission failures. Clerk has specific choices; match them.
- **Error envelope** — Clerk: `{ errors: [{ code, message, long_message, meta }] }`. Match it.
- **Pagination shape** — Clerk: `{ data: [...], total_count: N }`. Match it.

If any of these differs from the reference, that's a real bug. File it in `BUGS.md` before fixing, per `CLAUDE.md` § 7.

### 3. Round-trip through a real test

A test that doesn't drive the real surface doesn't count. Examples that DO count:

- `apps/api/src/**/*.test.ts` against real Express + real SQLite (`better-sqlite3`).
- `apps/dashboard/tests/**/*.spec.ts` — Playwright against running `apps/api` + `apps/dashboard`.
- `packages/backend/src/**/*.test.ts` — drives `@blerp/backend` exports against a running API.
- `packages/nextjs/src/**/*.test.ts` — drives `@blerp/nextjs` middleware/auth helpers in a Next.js-shaped harness.

Tests that DON'T count:

- Mocked Drizzle / mocked Express request-response.
- Unit tests that import a controller, hand-craft a `req`/`res` shape, and call the function directly.
- Snapshot tests that re-snapshot whenever the snapshot drifts.

### 4. Check the cross-package invariant

If you found a bug in one place, check the same shape in:

- The sibling controller (auth ↔ users ↔ orgs share patterns).
- The same operation in `packages/backend` (server SDK).
- The same operation in `packages/nextjs` (Next.js helpers wrap server SDK).
- The dashboard's consumer code (`apps/dashboard/src/components/`) — does it deserialize the field correctly?
- The OpenAPI spec (`openapi/blerp.v1.yaml`) — does it document the wrong shape?

Fix all in the same PR.

### 5. Confirm the change preserves the contract

After your edit, re-run the real test (step 3) AND the relevant Playwright spec. The reference adaptors are:

- For Clerk REST contract: `apps/api/src/**/*.test.ts` + `apps/dashboard/tests/**/*.spec.ts`.
- For `@blerp/backend` SDK contract: tests under `packages/backend`.
- For `@blerp/nextjs` middleware contract: tests under `packages/nextjs`.
- For Monite SDK integration: the Monite demo path under `apps/dashboard/tests/` (Monite SDK demo is end-to-end per recent PR #47-#49).

### 6. Document the contract

- Update `openapi/blerp.v1.yaml` if the wire shape changed. Then `bun run openapi:lint` must pass.
- Update `GAP_ANALYSIS.md` if a Clerk/Monite feature changed status.
- Update `MONITE_SDK_CLERK_DATA.md` / `MONITE_SDK_CLERK_LIVE_DEPENDENCIES.md` if the data mapping changed.
- Update the relevant `*.stories.tsx` if a UI prop changed.

## Failure modes this skill catches

- "I'll guess the Clerk pagination shape" — it's not `{ items, next }`, it's `{ data, total_count }`. Verify.
- "Drizzle returns rows directly; I'll `res.json(rows)`" — that's BUG-3 again. Always map.
- "I changed the API response; the dashboard will adapt" — the SDK consumers (`packages/backend`, `packages/nextjs`) and external customers won't. The contract is load-bearing.
- "The unit test mocks the DB and asserts the controller returns 200" — proves nothing about the wire contract.
- "The Storybook story renders fine" — the story uses MSW mocks; the real backend might return a different shape.
- "The Next.js SDK doesn't need a test because it just wraps backend" — the wrapping itself has bugs (session detection, cookie naming, middleware ordering).
- "Monite UI looks right" — Monite's contract is opinionated; props that look optional are required for some flows. Read the SDK reference.

## Compile-time guardrails

Where possible, enforce the contract in types:

- **OpenAPI types** — `packages/shared` already generates types from `openapi/blerp.v1.yaml`. Use them in both controllers (request validation) and dashboard (`openapi-fetch` typed client) so the compiler enforces the wire shape.
- **Branded IDs** — `type UserId = string & { __brand: "UserId" }`, `OrganizationId`, `SessionId`, `InvitationId`. Compiler rejects passing a session id where a user id was expected.
- **Discriminated `ApiResult<T>`** instead of nullable returns.
- **Zod/valibot validators at controller entry** — types alone don't survive `JSON.parse`.

## Quick references

- `apps/api/src/v1/controllers/` — every controller; copy a sibling's `mapX()` pattern.
- `apps/api/src/v1/middleware/csrf.ts` (and `helmet`, `cors`) — required on every mutation.
- `apps/api/src/lib/jwt.ts` (or equivalent) — JWT claims contract that the dashboard expects.
- `packages/shared/src/openapi/` — generated wire types.
- `packages/backend/src/` — server-SDK parity with `@clerk/backend`.
- `packages/nextjs/src/` — `@clerk/nextjs` parity (`auth()`, `currentUser()`, `<SignedIn>`, `<SignedOut>`, middleware).
- `openapi/blerp.v1.yaml` — authoritative REST contract.

## Output

When this skill fires, name the reference (`Clerk REST /users.list` / `@clerk/backend users.getUser` / `Monite POST /payables`), the validation entry point (file path of the test you'll run), and what you're about to verify. Then verify. Don't proceed to writing code until step 1 (real reference shape) is captured.
