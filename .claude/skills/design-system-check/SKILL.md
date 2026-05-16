---
name: design-system-check
description: Enforce blerp dashboard design tokens, color/contrast/typography/spacing/radius/elevation rules, and WCAG AA accessibility for every UI change. Use whenever editing Tailwind classes, defining a new visual variant, picking a color, choosing a font size or weight, adding spacing, or designing focus states. Pairs with frontend-slop-check and ui-verification.
---

# Design system check (blerp dashboard)

The blerp dashboard uses **Tailwind v4 with CSS-first config** — design tokens live in `apps/dashboard/src/index.css` via the `@theme` directive (or `@theme inline` for compound tokens). There is no `tailwind.config.js`. Components consume tokens through Tailwind utility classes; the source of truth for every color, font, spacing step, radius, and shadow is `index.css`.

This skill keeps the system from drifting into one-off magic numbers, vibe palettes, and ad-hoc typography.

## When this skill applies

- Before adding or changing color classes (`bg-*`, `text-*`, `border-*`, `ring-*`).
- Before adding or changing typography (`text-*`, `font-*`, `tracking-*`, `leading-*`).
- Before adding spacing/sizing (`p-*`, `m-*`, `gap-*`, `w-*`, `h-*`, `space-*`).
- Before adding shadows / elevation / radii (`shadow-*`, `rounded-*`).
- Before designing focus / hover / active / disabled states.
- Before introducing dark mode variants.
- NOT for: non-visual code, tests, scripts.

## The token contract

The dashboard imports Tailwind v4 and declares dark mode in `apps/dashboard/src/index.css`. Two rules:

1. **Read `index.css` first.** Before adding a new visual token, check whether one already exists. If you need a color that is not in the theme, add it to `@theme` in `index.css` — not inline.
2. **Never use raw hex in components.** `text-[#7c3aed]`, `bg-[#1e293b]`, `style={{ color: "#abc" }}` are all banned. The exception is dynamic values measured at runtime; those still come from theme tokens by name.

## Color rules

### Semantic-first

- **Surface**: page background, card background, panel background → neutrals (slate/zinc/stone scale).
- **Text**: primary content vs. muted vs. disabled → 3 levels max (e.g., `text-slate-900` / `text-slate-600` / `text-slate-400` on light; mirrored on dark).
- **Brand**: one accent for primary CTA + active nav. Not a gradient.
- **Status**: success=emerald-600, warning=amber-600, destructive=red-600, info=sky-600 — or the project equivalents already in use. Pick from `lucide-react`-compatible neutrals when paired with icons.

### Banned

- Gradients on text or backgrounds for internal surfaces (`bg-gradient-to-*`). Marketing pages only — not in this repo.
- Purple/violet/indigo as the brand accent unless the existing theme already defines it.
- Multi-hue tag/pill palettes (a tag color array indexed by name hash).
- Color as the only signal for state — always pair with text or icon.

### WCAG AA contrast (mandatory)

- Body text: ≥ 4.5:1 contrast against its background.
- Large text (≥ 18.66px / 14px bold): ≥ 3:1.
- UI components and graphical objects (button borders, focus rings, icon-only buttons): ≥ 3:1 against adjacent colors.
- Disabled controls are exempt from contrast minimums but must still look clearly disabled.

Safe Tailwind pairings (on bg-white): text-slate-700 through text-slate-950 all pass AA for normal text. text-slate-500 passes for large text only. text-slate-400 and lighter generally fail body text contrast — reserve for decorative or muted captions on already-tinted backgrounds.

Dark mode: invert the rule. On bg-slate-900 / bg-slate-950, body text wants text-slate-100 through text-slate-50; text-slate-400 is the muted floor.

### Verifying contrast

Use the browser DevTools color picker (it shows the WCAG ratio) or `bunx axe-core` against Storybook. For a quick visual:

```bash
# In apps/dashboard while dev server runs:
# 1. Open Storybook (bun run storybook, port 6006)
# 2. The @storybook/addon-a11y is installed — open the Accessibility panel for any story.
```

## Typography rules

- **One typeface stack** — defined in `index.css`. Don't `@import` Google Fonts in component files. If you need a second face (display vs. body), add it to `@theme` once.
- **Type scale ladder** — pick from `text-xs / sm / base / lg / xl / 2xl / 3xl / 4xl`. No `text-[17px]`.
- **Weight ladder** — `font-normal / medium / semibold / bold`. Skip `font-thin`, `font-extralight`, `font-black` unless the system already uses them.
- **Line height pairing** — body text uses `leading-relaxed` or `leading-6` depending on size; headings use `leading-tight`. Don't invent `leading-[1.37]`.
- **Letter-spacing** — only `tracking-tight` for large display text. Don't apply `tracking-wider` to body text "for style."
- **Numerics** — for tables and counters, prefer `tabular-nums` so columns align.

## Spacing & sizing rules

- Use the 4px / 8px Tailwind ramp: `p-1`, `p-2`, `p-3`, `p-4`, `p-6`, `p-8`, `p-12`. Avoid `p-[7px]`, `p-[13px]`, `mt-[42px]`.
- Page gutters: standardize on `px-6` or `px-8` (whatever `Layout.tsx` uses).
- Vertical rhythm: prefer `space-y-*` on stacks, `gap-*` on flex/grid. Don't sprinkle `mt-*`.
- Grid columns: only use `grid-cols-2 / 3 / 4 / 6 / 12`. A `grid-cols-5` should be questioned — is the data really 5-peer, or is it an accident?

## Radii & elevation

- Radii ladder: `rounded-md` (small surfaces), `rounded-lg` (cards, modals), `rounded-xl` (full-page panels), `rounded-full` (avatars, pills). No `rounded-[11px]`.
- Shadows are a tax. Most internal surfaces want a 1px border, not a shadow. Reserve `shadow-sm` for elevation-on-hover; `shadow-md` for modals; never `shadow-2xl` on a card.
- Borders: `border border-slate-200` (light) / `border-slate-800` (dark). Don't pile `border-2` on internal cards.

## Focus, hover, active, disabled

- **Focus must be visible.** `focus:outline-none` is allowed _only_ if `focus-visible:ring-2 focus-visible:ring-<accent> focus-visible:ring-offset-2` (or equivalent) replaces it.
- **Hover** is a _hint_, not a change of meaning. Don't change the icon on hover.
- **Active** (pressed) should give pixel-level feedback for buttons: usually `active:bg-*-700` darker than the rest state, or `active:scale-[0.99]`.
- **Disabled** state has `aria-disabled="true"` + reduced contrast + `cursor-not-allowed`. Never just gray with no semantic.

## Dark mode rules

- Dark variant defined via `dark:` (per `@custom-variant dark (&:where(.dark, .dark *))` in `index.css`).
- Every color you set needs a dark counterpart: `text-slate-900 dark:text-slate-100`, `bg-white dark:bg-slate-900`.
- Test both modes in Storybook (toolbar theme switcher) and Playwright before claiming done.
- Don't invert via `filter: invert(1)`. That breaks images, logos, and shadows.

## Iconography

- `lucide-react` only. Pick the closest semantic icon; don't combine multiple icons to "make a custom one."
- Standard icon sizes: `w-4 h-4` (inline text), `w-5 h-5` (button), `w-6 h-6` (nav/standalone). Avoid arbitrary `w-[18px]`.
- Stroke width: defaults are fine; if changing, change once at the theme level.
- Icon color follows text color by default — don't hardcode `text-slate-500` on every icon; let it inherit.

## When to add a token vs. when to use an existing one

- **Add a token** when a new value will be reused 3+ times (a brand color, an elevation level, a font size).
- **Use existing** when you can pick within ±1 step of the ladder without breaking the design.
- **Never inline** raw values for one-off "just this one place" — that's how systems rot.

## Accessibility quick gates

Before merging any UI:

- [ ] Keyboard-only walk: Tab through every interactive element; everything has a visible focus ring; Enter/Space activates buttons; Esc closes modals.
- [ ] Screen reader: every icon-only control has `aria-label`; every input has a `<label>` or `aria-label`; modals have `role="dialog"` and a labeling pattern; live regions for toasts.
- [ ] Contrast: body ≥ 4.5:1; large/icons ≥ 3:1. Check with DevTools / axe.
- [ ] Motion: respect `prefers-reduced-motion`. Don't auto-play long animations.
- [ ] Color independence: every state has a non-color signal (icon, text, shape).
- [ ] Form errors: `aria-invalid` + an associated `aria-describedby` error message; not just red border.

## Output

When this skill fires, name the design dimension you're touching (color / type / spacing / focus / icon / radius / shadow / dark), confirm the token source (`@theme` entry name) or propose the new token, and only then write the Tailwind classes. After: run through the accessibility quick gates and (for visual changes) verify in browser at both light and dark mode — see `ui-verification`.
