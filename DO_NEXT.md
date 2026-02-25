# Do Next

Maintain a prioritized list of upcoming actions. Update this file whenever new follow-ups are identified or existing ones are completed.

> All commands below assume Bun (npm-compatible) via `bun install`, `bun run <script>`, and `bunx <binary>`; never use npm/pnpm/yarn. Packages demanding post-install scripts are not a valid reason to switch—pick alternatives or strip those scripts while keeping Bun.
>
> Engineering reminders: prioritize specific typing (no `any`/`object` escape hatches), keep indentation shallow using early exits/inverted logic, isolate only exception-throwing statements inside try blocks, and keep most business logic functional/pure with an imperative shell. Ensure lint/type/vulnerability/SAST tooling runs clean before marking tasks done.

1. Execute `M1-P0-T3` planning by selecting the preview tooling workflow (Redoc/Stoplight or similar), generating HTML/Markdown artifacts, and defining the approval note template per `specs/M1-P0-openapi-schema.md`.
2. Stand up the SDK generation pipeline for `M1-P0-T4`, deciding on the generator + target package structure so `packages/shared` can emit deterministic clients from `openapi/blerp.v1.yaml`.
3. Share the updated spec for review (internal approval log) once lint/preview tasks are ready, ensuring reviewers can trace new invitations/audit/config endpoints back to DESIGN_DOCUMENT.md.

Replace the examples with actual next steps as the project evolves. Keep items concise and in priority order.
