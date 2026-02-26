# Blerp Identity Service Documents

This repository contains the planning and specification artifacts for the Blerp Identity Service (clean-room Clerk reimplementation). Start with the overview and follow links for deeper details:

- `DESIGN_DOCUMENT.md` — architecture, API surface, data models, security posture.
- `PLAN.md` — milestone/phase breakdown with the current execution order (including Milestone 6 — Monite SDK Full Parity).
- `FEATURES.md` — canonical feature list covering backend, frontend flows, security, DevEx.
- `USER_STORIES.md` — persona-based requirements (including Milestone 6 stories).
- `ACCEPTANCE_CRITERIA.md` — definition of “acceptable” outcomes per task.
- `DEFINITION_OF_DONE.md` — checklist every deliverable must satisfy before completion.
- `STATUS.md` — rolling status log (update as work progresses).
- `WHAT_WE_DID.md` — chronological notes about completed work.
- `DO_NEXT.md` — prioritized roadmap for next actions.
- `MONITE_SDK_CLERK_DATA.md` — detailed mapping of Monite metadata in Clerk.
- `MONITE_SDK_CLERK_LIVE_DEPENDENCIES.md` — specific Clerk features used by Monite.
- `AGENTS.md` — instructions for any automation/agent picking up the work.
- `openapi/blerp.v1.yaml` — authoritative REST contract.

_After each milestone, compress older entries in `PLAN.md`, `STATUS.md`, and `WHAT_WE_DID.md` so the history stays readable (retain only essential context)._

For quick navigation, `CLAUDE.md` points to `PLAN.md`, and the developer CLI/docs will reference these files to keep implementation aligned with the plan.

## Project Status

- **Current Goal**: Achieving 100% feature parity with the Monite SDK's integration of Clerk (Milestone 6).
- **Core Platform**: Milestone 1-3 complete. Foundations for multi-tenancy, auth, and dashboard are solid.
- **Frameworks**: Milestone 4-5 complete. `@blerp/nextjs` and `@blerp/backend` packages are operational.
- **Documentation**: Comprehensive guides for SDK repointing and Monite metadata mapping are available.

## Repository & Contact

- Canonical Git repository: [github.com/e6qu/blerp](https://github.com/e6qu/blerp)
- Primary contact for coordination: `adi11235@gmail.com`

## SDK Generation

The OpenAPI schema is used as the single source of truth to generate TypeScript SDK clients. To regenerate the SDK after updating the `openapi/blerp.v1.yaml` schema, run:

```bash
bun run sdk:generate
# or
make generate-sdk
```

The generated client is output to `packages/shared/src/schema.ts` and exported via `packages/shared/src/index.ts`.

## Workspace Structure

- `apps/api` — Express/Node.js backend service.
- `apps/dashboard` — React SPA dashboard.
- `packages/shared` — Shared TypeScript logic, types, and generated OpenAPI client.
- `packages/config` — Shared configuration (TSConfig, ESLint, etc.).
- `openapi/` — API specifications and documentation.

## Local Setup & Development

### Prerequisites

- [Bun](https://bun.sh) (v1.2.19+)

### Installation & Setup

```bash
# Clone and install dependencies
git clone git@github.com:e6qu/blerp.git
cd blerp
bun install
```

### Common Commands

| Command                | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `bun run build`        | Build all apps and packages in the monorepo using Turbo. |
| `bun run dev`          | Run all applications in development mode.                |
| `bun run lint`         | Run linters across the entire workspace.                 |
| `bun run test`         | Run the test suite across all packages.                  |
| `bun run openapi:lint` | Validate the OpenAPI specification.                      |
| `bun run sdk:generate` | Regenerate the shared SDK client from the OpenAPI spec.  |

### Adding Dependencies

To add a package to a specific workspace:

```bash
bun add <package> --filter @blerp/api
```

> **Note:** Do not use `npm`, `pnpm`, or `yarn`. This project is standardized on Bun. Use `bunx turbo <cmd>` if you need to run turbo commands directly outside of scripts.
