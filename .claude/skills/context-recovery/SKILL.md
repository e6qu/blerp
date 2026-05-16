---
name: context-recovery
description: Rebuild project state after context compaction, fresh session, or model handoff. Use immediately when the conversation has just compacted, when you're picking up an in-flight task without recent history, or when the user says "continue" / "resume" / "what were we doing." Fights the amnesia that silently rewrites prior decisions. Pairs with avoid-vibe-slop and hidden-rot-audit.
---

# Context recovery (blerp)

Context compaction reliably preserves "what to do next" and the most recent tool outputs. It does **not** reliably preserve "why we did what we did," "what we already tried," or "what's in flight that you can't see." In a long-running multi-session repo like blerp, that gap is where bad decisions get re-made: the agent re-introduces a pattern we already rejected, re-implements something a sibling agent shipped yesterday, or claims a bug is fixed because the symptom matches a closed BUG-NN.

This skill is the protocol to rebuild enough state to keep continuity. It is short on purpose — run it, don't argue with it.

## When this skill applies (don't skip)

- The conversation just compacted (the system told you so, or your prior tool outputs vanished).
- You were re-invoked into an existing session and the last 10+ turns are summarized rather than verbatim.
- The user says "continue," "resume," "what were we doing," "where did we leave off."
- You're about to make a non-trivial change but don't remember the last 2–3 decisions on this surface.
- After every milestone close (so the next milestone starts on solid ground).
- NOT for: a fresh task on a fresh topic where prior context is genuinely irrelevant.

## The recovery protocol (5 reads, 1 verify, 1 plan)

Do these in order. Do all of them, even if you think you remember.

### 1. Read STATUS.md (tail)

```bash
tail -30 /Users/zardoz/projects/blerp/STATUS.md
```

Tells you: current milestone, what just landed, what's blocked. The most recent rows are load-bearing.

### 2. Read DO_NEXT.md

```bash
cat /Users/zardoz/projects/blerp/DO_NEXT.md
```

Tells you: prioritized backlog, blocked items, the "Current Status" header at the top. This is the operational truth — `PLAN.md` is historical.

### 3. Read WHAT_WE_DID.md (tail)

```bash
tail -60 /Users/zardoz/projects/blerp/WHAT_WE_DID.md
```

Tells you: detailed session logs with files touched and tests run. Distinguishes "claimed done" from "verified done."

### 4. Read BUGS.md (open section)

```bash
awk '/^## /{p=0} /^## .*Open/{p=1} p' /Users/zardoz/projects/blerp/BUGS.md
# or just:
head -80 /Users/zardoz/projects/blerp/BUGS.md
```

Tells you: open bugs by severity. Critical to know before claiming a fix.

### 5. Read the last 5 commits

```bash
git -C /Users/zardoz/projects/blerp log --oneline -5
git -C /Users/zardoz/projects/blerp log -1 --stat
```

Tells you: most recent merged work, files touched, divergence from prior assumptions.

### 6. Verify working tree is clean / aligned

```bash
git -C /Users/zardoz/projects/blerp status
git -C /Users/zardoz/projects/blerp branch --show-current
git -C /Users/zardoz/projects/blerp log --oneline origin/main..HEAD 2>/dev/null
```

Tells you: are we on `main` or a feature branch; are there uncommitted changes from the prior session; is the branch ahead of `origin`. **If there are uncommitted changes you didn't make, stop and ask.**

### 7. Re-state the plan in one paragraph and confirm

Before doing anything, write a 3–5 sentence recap:

- Current milestone / phase.
- What's done.
- What's next (the specific task from `DO_NEXT.md`).
- What's blocked, and on what.
- What you specifically intend to do in this turn.

Then proceed. If any of the above contradicts your prior context, trust the disk over your memory.

## Surface-specific re-reads (when picking up that surface)

If your next task is in a specific area, do an extra read pass:

| Area                        | Re-read                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `apps/api` controllers      | `openapi/blerp.v1.yaml` section for the relevant resource; sibling controller's `mapX()` pattern              |
| `apps/dashboard` components | `Layout.tsx`, sibling component's stories file, `index.css` for tokens                                        |
| `packages/nextjs` SDK       | The Clerk `@clerk/nextjs` reference for the helper you're touching                                            |
| `packages/backend` SDK      | The Clerk `@clerk/backend` reference for the method                                                           |
| Tests                       | `apps/dashboard/playwright.config.ts`, `apps/dashboard/tests/fixtures/`, last test you touched in that folder |
| OpenAPI spec                | `bun run openapi:lint` to confirm baseline is green before edits                                              |

## Anti-amnesia rules during the rest of the session

These survive compaction better than memory:

1. **After every meaningful step, append to `WHAT_WE_DID.md`.** Files touched, tests run, surprises. Future-you re-reads this.
2. **Update `STATUS.md` on phase transitions.** One row, date + status + notes.
3. **Update `DO_NEXT.md` when scope shifts.** Add / remove items as they emerge.
4. **Open a `BUGS.md` entry when you discover rot.** Even if you fix it the same turn — the record matters.
5. **Commit small.** Each commit is a recovery checkpoint that compaction can't lose.
6. **Re-verify after compaction.** Per `avoid-vibe-slop` Q26: re-grep the area you're about to edit, re-read the sibling pattern, re-run the last failing test before assuming current state.

## Common amnesia failure modes

- "I just fixed BUG-12" — but `git log` shows you didn't commit; the prior turn's tool ran but the conversation got compacted before the diff was applied. Re-check the file.
- "We decided to use approach X" — but `STATUS.md` and `DO_NEXT.md` show the team moved to approach Y three sessions ago. Trust the disk.
- "The Playwright tests pass on main" — but `BUGS.md` has an open entry on the e2e suite. Read it.
- "I'll just re-run the dev server" — but a prior session left a stale server on the port; check `lsof -i :3000 -i :3001 -i :6006` first.
- "Let me re-implement the user mapper" — `git grep mapUser apps/api/src` shows it's already implemented. Don't re-do; extend.

## Output

When this skill fires, do the 5 reads + 1 verify silently, then produce the one-paragraph recap (section 7) for the user. Then ask "proceed with <next task>?" if there's any ambiguity, or proceed if the path is obvious from the recap. Do not start the substantive work until the recap exists in this turn.
