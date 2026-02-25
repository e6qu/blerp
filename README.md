# Blerp Identity Service Documents

This repository contains the planning and specification artifacts for the Blerp Identity Service (clean-room Clerk reimplementation). Start with the overview and follow links for deeper details:

- `DESIGN_DOCUMENT.md` — architecture, API surface, data models, security posture.
- `PLAN.md` — milestone/phase breakdown with the current execution order.
- `FEATURES.md` — canonical feature list covering backend, frontend flows, security, DevEx.
- `USER_STORIES.md` — persona-based requirements.
- `ACCEPTANCE_CRITERIA.md` — definition of “acceptable” outcomes per task.
- `DEFINITION_OF_DONE.md` — checklist every deliverable must satisfy before completion.
- `STATUS.md` — rolling status log (update as work progresses).
- `WHAT_WE_DID.md` — chronological notes about completed work.
- `DO_NEXT.md` — queued follow-up actions.
- `AGENTS.md` — instructions for any automation/agent picking up the work.
- `openapi/blerp.v1.yaml` — authoritative REST contract.

_After each milestone, compress older entries in `PLAN.md`, `STATUS.md`, and `WHAT_WE_DID.md` so the history stays readable (retain only essential context)._

For quick navigation, `CLAUDE.md` points to `PLAN.md`, and the developer CLI/docs will reference these files to keep implementation aligned with the plan.

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
