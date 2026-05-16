---
name: ui-verification
description: Verify the dashboard UI in a real browser with real data before claiming a feature works. Use after writing/modifying any React component, route, modal, form, or page. Combines Playwright (apps/dashboard/tests/), Storybook smoke (port 6006), Vitest browser-mode Storybook tests, and manual screenshot-grade verification. Pairs with frontend-slop-check and design-system-check.
---

# UI verification (blerp dashboard)

Type-check and unit tests verify code correctness. They do **not** verify the feature works. In a repo that has had little hands-on testing, "tsc passes" routinely coexists with a button that does nothing, a route that 404s, or a modal that opens but never submits. This skill is the discipline that closes the gap.

## When this skill applies

- After modifying anything under `apps/dashboard/src/` that renders.
- Before commenting "works" on a PR or in conversation.
- Before closing a BUG that has a UI symptom.
- After context compaction, when picking back up UI work.
- NOT for: backend-only changes, doc-only changes, dependency bumps with no API surface change.

## The three verification levels

Pick the _highest_ level that fits your change. Each higher level subsumes the lower.

### L1 — Storybook smoke (fastest, for a single component)

```bash
cd apps/dashboard
bun run storybook   # serves on http://localhost:6006
# Open your component's story; toggle dark mode; tab through; resize; trigger empty/error/loading variants.
```

What this catches: render crashes, broken props, missing tokens, color/contrast issues (via the a11y addon), missing dark-mode variants, layout breaks at narrow widths.

What it does NOT catch: routing, real API calls, end-to-end flow correctness.

### L2 — Vitest browser-mode Storybook tests (deterministic, CI-friendly)

The dashboard's `vite.config.ts` wires Storybook stories into Vitest via `@storybook/addon-vitest` and `@vitest/browser-playwright`. Add a `play` function to your story (interaction tests) and a Vitest run picks it up.

```bash
cd apps/dashboard
bun run test   # runs Vitest, including storybook project
```

What this catches: user-event interactions on a real DOM (click → modal opens → submit → onSuccess fires) with MSW intercepting the network layer.

What it does NOT catch: integration with the real API, real auth/CSRF, real DB state.

### L3 — Playwright end-to-end against real API + dashboard (ground truth)

`apps/dashboard/playwright.config.ts` starts both servers (`apps/api` on :3000, `apps/dashboard` on :3001) and runs specs in `apps/dashboard/tests/`. This is the only verification level that proves the feature works against the same surfaces a user would hit.

```bash
cd apps/dashboard

# Run a single spec while iterating
bunx playwright test tests/<feature>/<spec>.spec.ts --headed

# Trace a failure with the inspector
bunx playwright test tests/<feature>/<spec>.spec.ts --debug

# Full run (matches CI)
bun run test:e2e
```

What this catches: routing, CSRF, auth fixtures, real DB writes, real React Query cache invalidation, real toast appearance, real navigation after success.

Use this level for: any new user-visible flow, any bug with a UI symptom, any post-context-compaction sanity check.

## Manual browser verification (always, for visible features)

Even after L1/L2/L3 pass, _open the page yourself_ before claiming "done":

```bash
# Terminal 1
cd apps/api && bun run dev          # http://localhost:3000

# Terminal 2
cd apps/dashboard && bun run dev    # http://localhost:3001

# Then in browser:
# 1. Sign in (use the seeded test user — see apps/dashboard/tests/fixtures/index.ts)
# 2. Navigate to the new surface
# 3. Trigger the happy path
# 4. Trigger one error path (network off, invalid input)
# 5. Reload mid-flow; does state survive correctly?
# 6. Toggle dark mode; does it still look right?
# 7. Resize to ~360px width; does layout collapse cleanly?
# 8. Tab through; can you reach + activate everything with the keyboard?
```

Paste an actual observation into the conversation:

```
✓ Created webhook "stripe-prod" from /organizations/<id>/webhooks
✓ Toast appeared: "Webhook created"
✓ Row appeared in the table without a manual reload
✓ Tab order: Add → Name → URL → Events → Save (correct)
✓ Dark mode: row stripes legible
✗ Mobile (<400px): action menu overflows the right edge — filed BUG-NN
```

vs. the slop version:

```
✗ "I tested the webhook flow and it works"
✗ "The UI looks correct"
✗ "Should be fine after my changes"
```

If you cannot produce literal observations, you have not verified.

## The "is the UI actually wired" sweep (catches fake features)

A common rot in this repo: components that _render_ but don't _do_ anything. Run this on every UI change before committing:

1. **Every `<button>` has an `onClick`.** Grep your diff for `<button` and confirm.
2. **Every `<form>` has `onSubmit` that calls a real mutation** (`useMutation` from `@tanstack/react-query` hitting a real `/v1/*` endpoint via `openapi-fetch`).
3. **Every new route is registered in `App.tsx`** and reachable from the nav.
4. **Every modal's primary action actually mutates server state**, not just `onClose()`.
5. **Every new column / field in a table is populated from real data**, not `"—"` or `""`.
6. **MSW handler exists** under `apps/dashboard/src/mocks/` for any new endpoint the UI calls (otherwise Storybook + browser tests die).
7. **The Playwright test reaches the post-success assertion** (toast visible, row exists, navigation happened) — not just that the click didn't throw.

If any answer is "not yet," the feature is fake. Either wire it now or remove it.

## Visual-regression cadence (lightweight)

We don't run Chromatic in CI by default, but for non-trivial visual changes:

- Capture a Storybook screenshot before + after via `bunx playwright screenshot` or the browser's devtools.
- For full pages, capture both light and dark, and at 1280px + 768px + 375px widths.
- Attach to the PR description.

## When verification fails

If any level catches a bug:

1. Capture the failure verbatim (Playwright trace / screenshot / DOM snippet).
2. Add an entry to `BUGS.md` (next sequential `BUG-NN`, severity P0–P3).
3. Fix the underlying bug — never loosen the test (per `CLAUDE.md` § 6).
4. Re-run the failing level and confirm.

## Output

When this skill fires, state which verification level you're applying (L1 / L2 / L3 / manual), the command you ran, and the literal observation (success or failure with details). Then either claim done with evidence or report the bug and continue investigating. Never claim "works" without an observation.
