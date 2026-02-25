# Specification — Milestone 1 Phase A: Project Scaffolding & Tooling

- **Plan Reference**: `PLAN.md` › Phase A Tasks 1-8
- **Task Briefs**: `tasks/to-do/M1-PA-T1` through `M1-PA-T8`
- **Primary Goal**: Provide a reproducible mono-repo, tooling stack, container workflows, and CI/CD/IaC foundations validated end-to-end.
- **Engineering Standards**: Enforce strong typing everywhere (no `any`/`object`), keep indentation shallow with early exits/inverted conditions, isolate only exception-raising statements in try blocks, structure code as an imperative shell with a functional/pure core, and run all industry-standard lint/format/vuln/SAST tooling within Turbo tasks.

## Scope
1. Repo scaffolding (Turbo workspaces, shared configs) with deterministic installs.
2. Tooling (ESLint/Prettier/Biome, lint-staged, Storybook/MSW foundation) shared across packages.
3. API + Dashboard scaffolds with Express/Drizzle integration and Vite shell.
4. Docker Compose + `blerp dev` CLI parity for SQLite, Redis, Mailpit.
5. GitHub Actions templates and AWS ECR/ECS IaC with blue/green deploy wiring.

## Traceability
- **User Stories**: 7–10 (frontend dev workflow), 21–23 (Ops), 25 (Redis queues).
- **Acceptance Criteria**: AC §2 (tests + lint), AC §4 (operational readiness), AC §5 (quality gates).

## Validation Plan
1. **Repo Bootstrap**
   - Run `bun install` (npm-compatible mode) and `bunx turbo run lint --dry-run` to confirm graph integrity; packages requiring post-install scripts must be replaced or patched—do not reach for npm/pnpm/yarn.
   - Ensure baseline `apps/api` and `apps/dashboard` build commands succeed.
2. **Tooling Enforcement**
   - Execute `bunx turbo run lint`, `bunx turbo run typecheck`, `bunx turbo run format` (if configured) with zero errors; attach summary to WHAT_WE_DID.
   - Validate lint-staged/husky hooks by simulating staged changes (`bunx lint-staged --debug`) while maintaining the Bun-only toolchain.
3. **Local Stack Readiness**
   - `blerp dev up` brings up docker-compose stack; verify API + dashboard accessible and logs recorded in STATUS.
   - Confirm migration placeholders run automatically (or manual script) without error.
4. **CI Coverage**
   - GitHub Actions workflow dry-run locally via `act` or `bunx nx run ci` (if simulated) to ensure lint/type/test jobs reference Turbo tasks—if a dependency demands npm scripts, rework or replace it instead of switching.
   - Document secrets or AWS credentials prerequisites.
5. **Containerization & IaC**
   - Build Docker image bundling dashboard assets: `docker build -t blerp/app:dev .` and run sample container.
   - Validate Terraform/CloudFormation plan output snapshots stored (or plan text) for ECR/ECS definitions.
6. **Deployment Automation**
   - Provide sample blue/green deployment command (GitHub workflow or script) and confirm Step Functions or ECS deployment config references matching image tags.

## Evidence to Capture
- CLI outputs proving `blerp dev` success and docker images built.
- Links to CI workflow files and IaC stacks noted in WHAT_WE_DID.
- Screenshots/log notes verifying ECS/ECR resources created (real or mocked) captured within repo docs.
