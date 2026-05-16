# blerp `.claude/skills/`

Project-local Claude Code skills. Each subdirectory contains a single `SKILL.md` with YAML frontmatter (`name`, `description`) that Claude Code auto-loads when relevant.

These skills are **runtime checklists**, not docs. They fire before / during / after specific edits to keep the agent honest in a repo that grew fast under AI coding and has had minimal hands-on human testing.

## The skills

### Anti-slop

- [`avoid-vibe-slop`](avoid-vibe-slop/SKILL.md) — master pre-edit checklist for any non-trivial code change. Anchored in `CLAUDE.md` § 6–7 (Testing Philosophy + Zero Tolerance). Refuses fake/fallback/anemic patterns, silent catches, fake tests, and abandoned attempts.
- [`frontend-slop-check`](frontend-slop-check/SKILL.md) — kill generic AI-aesthetic UI (centered hero, purple gradient, emoji icons, "Welcome to your dashboard" copy, comprehensive-but-empty components). Fires before / after React/TSX edits.
- [`hidden-rot-audit`](hidden-rot-audit/SKILL.md) — proactive 7-pass audit for dead code, fake tests, fake implementations, broken UI, abandoned attempts, silent backend failures, type erosion. Run before milestone close-outs and after compaction.

### Design & UI

- [`design-system-check`](design-system-check/SKILL.md) — enforce dashboard design tokens (Tailwind v4 `@theme`), WCAG AA contrast, typography ladder, spacing ramp, focus states, dark-mode parity.
- [`ui-verification`](ui-verification/SKILL.md) — verify UI in a real browser with real data before claiming "works." Three levels: Storybook smoke, Vitest browser-mode interaction tests, full Playwright e2e + manual browser walk.

### Fidelity & memory

- [`clerk-monite-fidelity`](clerk-monite-fidelity/SKILL.md) — verify API / SDK / UI changes against the real Clerk and Monite SDK references. The reference is the spec; model "memory" is not.
- [`context-recovery`](context-recovery/SKILL.md) — post-compaction protocol. 5 reads + 1 verify + 1 one-paragraph recap before doing substantive work in an in-flight session.

## How they interact

```
context-recovery        ──┐
                          ├─► avoid-vibe-slop ──► [edit] ──► ui-verification
hidden-rot-audit (periodic)│                ▲                      ▲
                          │                 │                      │
                          └─► clerk-monite-fidelity                │
                                                                   │
              frontend-slop-check ──► design-system-check ─────────┘
                  (UI edits)             (visual edits)
```

Run order in a typical session:

1. **Session start / post-compaction** → `context-recovery`.
2. **Before any non-trivial edit** → `avoid-vibe-slop`.
3. **If editing UI** → `frontend-slop-check` + `design-system-check`.
4. **If editing API / SDK** → `clerk-monite-fidelity`.
5. **After the edit, before claiming done** → `ui-verification` (for UI) and/or real tests (for API).
6. **Before milestone close-out or when something feels off** → `hidden-rot-audit`.

## Adding a new skill

Create `<skill-name>/SKILL.md` with YAML frontmatter:

```markdown
---
name: <kebab-case-name>
description: <one-sentence trigger: when to use, what it does>
---

# <Title>

<body>
```

Skills should be **runtime checklists** that fire in specific contexts, not general docs. Keep each skill < 250 lines; reference repo files (`apps/`, `packages/`, `openapi/`) rather than restating them.

## Inspiration

Derived from and adapted to blerp from sockerless's skill suite (`avoid-vibe-slop`, `adaptor-fidelity-check`, `manual-test`, `sim-handler-checklist`, `cross-resource-stack-test`). The Clerk/Monite SDKs replace the cloud SDKs as reference adaptors; the dashboard adds UI-specific anti-slop and verification.
