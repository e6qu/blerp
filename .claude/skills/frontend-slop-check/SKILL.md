---
name: frontend-slop-check
description: Kill generic AI-aesthetic UI before it lands. Use before/after writing or modifying any React component in apps/dashboard/src — pages, modals, forms, dashboards, tables, empty states, error states. Detects the centered-hero / purple-gradient / 3-column / 4-card / "linear-gradient-from-purple-to-blue" cliché, emoji-as-icon habit, generic placeholder copy, and the "comprehensive but functionally empty" component. Pairs with design-system-check, ui-verification.
---

# Frontend slop check

LLMs default to one UI: centered hero, three feature cards, an emoji icon, gradient CTA, lorem-ish placeholder text, and the same purple-blue palette every other vibe-coded app has. That UI is _not wrong_ — it is _average and forgettable_, which is worse than wrong for a product that wants to look like Clerk's dashboard, not like every other AI demo.

This skill is the runtime checklist before each React/TSX change in blerp.

## When this skill applies

- Before writing or modifying anything under `apps/dashboard/src/components/`, `apps/dashboard/src/stories/`, `apps/dashboard/src/App.tsx`.
- Before adding a page, modal, table, form, empty state, error state, loading skeleton, or toast.
- Before adding or rewriting copy (labels, tooltips, placeholders, button text).
- After Storybook tells you something looks "fine."
- NOT for: pure data-fetching hooks, route wiring, type-only edits, test files.

## The slop tells (refuse on sight)

If your component proposal has any of these, rewrite before opening the file:

### Aesthetic cliché

1. **Purple/blue/violet gradient anywhere** (`from-purple-500 to-blue-500`, `from-violet-* to-indigo-*`, `bg-gradient-to-r from-pink-* to-purple-*`). Blerp inherits Clerk's dashboard sensibility: neutral surface, restrained accent. If you must accent, prefer a single brand colour or the existing token; never a gradient sweep.
2. **Emoji as a functional icon** (🚀, ✨, 🔒, ⚡, 🎨). Blerp uses `lucide-react`. Reach for `Rocket`, `Sparkles`, `Lock`, `Zap`, `Palette` instead. Emoji is acceptable only in user-generated content (e.g., a name field).
3. **Centered hero on an internal page.** Dashboard pages are utility surfaces, not marketing pages. Use the existing `Layout.tsx` shell + left-aligned content. Centered heros belong on the marketing site, which is not in this repo.
4. **"AI shimmer" effect** — animated gradient-on-text, shimmer divs, sparkle particles. Banned.
5. **3-column feature grid** for anything that is not actually three peer entities. If you have 4 things, don't fake a 3-column.
6. **Glassmorphism / heavy backdrop blur** on internal surfaces. Clerk's panels are flat.
7. **Generic Inter font.** Use the project's font stack as declared in `apps/dashboard/src/index.css`. Don't add `@import` for Google Fonts inside a component file.
8. **Rainbow / multi-hue accents on tags or status pills.** Status colours are semantic: green=success, amber=warning, red=destructive, gray=neutral. See `design-system-check`.

### Copy cliché

9. **"Welcome to your dashboard!" / "Get started in seconds" / "Manage everything in one place"** — boilerplate sales copy. Internal dashboard pages don't sell, they describe the surface. Match the tone of sibling pages (look at `OrganizationsPage.tsx`, `EmailList.tsx`, the existing settings views).
10. **Placeholder lorem ipsum committed to the repo.** Either write real copy, use a Storybook fixture, or pull from MSW handlers.
11. **Tooltips that restate the button label.** Either say something the label can't, or omit.
12. **Empty-state copy that's a single word ("Empty.")** or that says "There are no X yet" with no next action. Real empty states answer: what does the user do _now_? The pattern in `OrganizationsPage.tsx` is the reference.
13. **Error toast that says "Something went wrong."** Useless. Surface what failed and what to try. The `Toast.tsx` component supports descriptive messages.

### Structural cliché

14. **"Comprehensive" component that does five jobs.** Split it. The `apps/dashboard/src/components/auth/*Modal.tsx` files are the convention: one modal = one job, form-state + `useMutation`, optimistic update or refetch on success.
15. **A new modal pattern when an existing one fits.** Grep `*Modal.tsx` first. There are >15 modals; the pattern is established.
16. **Inline styles (`style={{ ... }}`) instead of Tailwind classes.** Only acceptable for dynamic values that classes can't express (e.g., a width derived from a measurement).
17. **A new `<div>`-soup wrapper** when `Layout.tsx` already provides the page shell. Pages are wrapped by the router; don't re-wrap.
18. **A custom button when `components/ui/` or `stories/Button.tsx` exists.** Reuse first; extend only when the existing button cannot represent the variant.

### State cliché

19. **Loading state is `Loading...` text.** Use the existing `Skeleton.tsx` pattern.
20. **Error state is `Error: {e.message}`.** Use the project's `ErrorBoundary.tsx` and `Toast.tsx` patterns; surface a recovery action.
21. **Optimistic update without rollback.** If a `useMutation` mutates the React Query cache eagerly, it must restore on error.
22. **Pagination invented locally** when `Pagination.tsx` exists.
23. **Search invented locally** when `GlobalSearch.tsx` exists.

### Accessibility cliché (vibe coding's blind spot)

24. **`<div onClick>` on something that should be a `<button>`.** No keyboard, no focus ring, no role.
25. **No `aria-label` on icon-only buttons.** Every `lucide-react` icon button needs one.
26. **Modal without focus trap or escape-to-close.** All sibling modals already handle this; copy the pattern.
27. **Form input without `<label>` (visible or `aria-label`).**
28. **`<img>` without `alt`** (or without `alt=""` for decorative).
29. **Color is the only signal** for state. Always pair with text or icon.
30. **Focus ring removed without replacement.** `focus:outline-none` requires a `focus:ring-*` to replace it.

## The checklist (before committing the component)

1. **Sibling component check.** Did you grep `apps/dashboard/src/components/**` for a near-equivalent? If a similar component exists, did you extend it or duplicate?
2. **Layout shell.** Is the page wrapped by `Layout.tsx` via the router? Not re-wrapping locally.
3. **Design tokens only.** Are all colors, spacing, radii, font sizes coming from Tailwind classes that resolve to `@theme` tokens — no raw hex, no magic px? See `design-system-check`.
4. **Lucide for icons, never emoji.** Confirmed.
5. **Real copy or fixture copy, not lorem.** Confirmed.
6. **Loading + empty + error states actually wired.** Not just the happy path.
7. **Keyboard reachable + screen-reader labeled.** Tab through it in your head: every interactive element has a focus state and a name.
8. **Story added or updated.** Components in `components/auth/*` have stories (e.g., `OrganizationsPage.stories.tsx`); your addition should too.
9. **MSW handler exists for the API call.** If the component calls `/v1/...`, `apps/dashboard/src/mocks/` should have a handler so Storybook + Playwright don't break.
10. **Playwright happy-path test added** under `apps/dashboard/tests/<feature>/` if this is a new user-visible flow.
11. **Rendered in browser by you.** `bun run dev` in `apps/dashboard`, navigate to the page, click the thing. Type-check is not a substitute. See `ui-verification`.

## "Comprehensive but empty" detector

A symptom of vibe coding: components that look complete but don't actually do anything when used. Run this scan on your diff before committing:

- Does the form actually submit, or does `onSubmit` just `console.log` / `e.preventDefault()` with no mutation?
- Does the button actually navigate / open a modal / call an API? Or is it a `<button>` with no `onClick`?
- Does the modal's "Save" actually save, or just close?
- Does the new page route exist in `App.tsx`?
- Does the menu item show up in `Layout.tsx`?
- If you added a column to a table, did you populate it from real data?
- If you added an empty-state CTA, does the CTA actually do something?

If any answer is "not yet," you have shipped a fake feature. Stop. Wire it or remove it.

## Output

When this skill fires, name the component you're about to write/edit, the sibling pattern you're copying (file path), and the three cliché-tells you specifically reject. Then write. After the diff exists, run through the post-commit checklist (sections "The checklist" + "Comprehensive but empty detector") before claiming done.
