# Agent Operating Instructions

> **Tooling Mandate**: This repo is permanently Bun-first. Always use `bun install`, `bun run`, and `bunx`. Under no circumstance may you switch to npm/pnpm/yarn—even if a dependency claims to require post-install scripts. Instead, avoid or replace packages that need those scripts; skipping them is preferable to breaking the Bun mandate.
>
> **Engineering Standards**: Favor precise typing (no `any`, `object`, or implicit `unknown` escapes), keep indentation shallow via early exits/inverted conditionals, and isolate only exception-throwing statements inside try blocks. Strive for an imperative shell with a functional/pure core (allow logging when needed) and run industry-standard lint/security tooling (formatters, type-check, vuln scans, SAST) before shipping.

**Project Coordinates**
- Repository: `git@github.com:e6qu/blerp.git`
- Primary contact: `adi11235@gmail.com`

1. **Entry Point**
   - Read `PLAN.md` and locate the first phase/task marked `pending`.
   - Review `STATUS.md`, `WHAT_WE_DID.md`, and `DO_NEXT.md` for context before acting.

2. **Execution Loop**
   - Pick up the next pending task from `PLAN.md` and work through it.
   - After each task is completed, perform a `git commit` with a concise summary of the work.
   - After each meaningful step, update:
     - `PLAN.md` (task status via `update_plan` tooling).
     - `STATUS.md` (new row with date, summary, blockers).
     - `WHAT_WE_DID.md` (detailed notes, tests run).
     - `DO_NEXT.md` (add/remove items based on new follow-ups).
   - If scope changes, sync `FEATURES.md`/`DESIGN_DOCUMENT.md` as needed.

3. **Validation**
   - Run applicable tests/linters.
   - **Error Handling**: Treat all lint warnings as errors that must be resolved; high/critical vulnerabilities found by security scanners are considered blocking errors and must be fixed.
   - Execute official Clerk SDK compatibility checks when touching API behavior.
   - Confirm acceptance criteria (`ACCEPTANCE_CRITERIA.md`) and Definition of Done (`DEFINITION_OF_DONE.md`) are satisfied before marking work complete.

4. **Handoff**
   - When pausing, append a “next actions” note to `DO_NEXT.md`.
   - Ensure `STATUS.md` reflects current state (`pending`, `in_progress`, `blocked`, `completed`).
   - Never leave tasks without context; future agents rely on these docs to continue seamlessly.
   - After each milestone is complete, summarize/compress historical entries in `PLAN.md`, `STATUS.md`, and `WHAT_WE_DID.md` to keep logs concise.

5. **Ambiguity Handling**
   - If requirements are unclear, conflicting, or unknown, stop and ask the user for clarification.
   - Do not make assumptions—wait for the user’s response before proceeding.
   - Never invent project coordinates (domains, contacts), authorship, or configuration details; if information is missing, explicitly request it before making changes.
