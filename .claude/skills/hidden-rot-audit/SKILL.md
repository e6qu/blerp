---
name: hidden-rot-audit
description: Proactive audit for dead code, fake tests, fake implementations, broken/unreachable UI, abandoned past attempts, and silent failures in blerp. Use before starting work in a directory you don't actively own, after context compaction, when a feature "should work but doesn't", before any milestone close-out, and as a periodic sweep. This repo has had minimal hands-on testing — rot accumulates faster than CI catches.
---

# Hidden rot audit (blerp)

Blerp has been built fast across many sessions with minimal hands-on human testing. CI is green and `bun run typecheck` passes, yet the repo carries an above-average load of:

- **Dead code** — files / exports / branches that no caller reaches.
- **Fake tests** — pass without verifying anything meaningful (`expect(x).toBeTruthy()`, `expect(true).toBe(true)`, snapshots that always re-snapshot).
- **Fake implementations** — functions that return `[]` / `null` / a stub and never made it to "real."
- **Broken UI** — buttons with no `onClick`, modals that don't submit, routes not registered, columns showing `"—"` because the mapper was forgotten.
- **Abandoned past attempts** — `*.old.ts`, `_legacy/`, `// REMOVED`, `// TODO: re-enable`, dual implementations of the same surface.
- **Silent failures** — `try { ... } catch (e) { /* */ }`, fallbacks that return success, missing CSRF.

This skill is the audit pass. Run it methodically; do not skip steps.

## When this skill applies

- Before starting a milestone or new phase.
- After context compaction (paired with `context-recovery`).
- When a feature "should work" but the user reports it doesn't.
- Before claiming a section / package is "complete."
- As a periodic sweep — at minimum once per opened PR that touches more than one file.
- When you find one rot symptom, run the full audit on the surrounding directory.

## Audit pass 1 — dead code & unused exports

```bash
cd /Users/zardoz/projects/blerp

# Files that look orphaned by name
find apps packages -type f \( -name "*.old.*" -o -name "*.bak*" -o -name "*.backup*" \
  -o -name "*_old.*" -o -name "*_legacy.*" -o -name "*_archive.*" -o -name "*.disabled*" \) \
  -not -path "*/node_modules/*" -not -path "*/dist/*"

# Unused exports — leverage tsc with --noUnusedLocals + a knip-style scan
bun run typecheck     # surfaces unused locals / imports if enabled

# Components with no story AND no test AND no import
# (manual: list components, then grep for each name across imports)
ls apps/dashboard/src/components/auth/*.tsx | while read f; do
  name=$(basename "$f" .tsx)
  count=$(grep -rE "from .*${name}|import .*${name}\b" apps packages --include='*.ts' --include='*.tsx' \
    --exclude-dir=node_modules --exclude-dir=dist | grep -v "$f" | wc -l)
  echo "$count $name"
done | sort -n | head -20
```

Triage:

- File only imports itself → delete (after confirming no dynamic import).
- Exports that no caller uses → delete the export, simplify the surface.
- "Looks orphaned" but is actually loaded dynamically (router, plugin) → leave + add a one-line comment explaining the indirect entry point.

## Audit pass 2 — fake tests

Fake-test red flags (grep your test directories):

```bash
cd /Users/zardoz/projects/blerp

# The "asserts nothing meaningful" patterns
grep -rEn "expect\(\s*true\s*\)\.toBe\(\s*true\s*\)" apps packages --include='*.ts' --include='*.tsx'
grep -rEn "expect\([^)]+\)\.toBeTruthy\(\)\s*;?\s*\}\s*\)?\s*;?\s*$" apps packages --include='*.ts' --include='*.tsx'
grep -rEn "expect\([^)]+\)\.toBeDefined\(\)\s*;?\s*\}\s*\)?\s*;?\s*$" apps packages --include='*.ts' --include='*.tsx'

# Skips and fixmes
grep -rEn "test\.(skip|fixme|todo)|describe\.skip|xit\(|xtest\(" apps packages --include='*.ts' --include='*.tsx'

# Comments suggesting the test is fake
grep -rEnI "TODO.*test|FIXME.*test|test.*later|placeholder.*test|fake test|stub test" apps packages \
  --include='*.ts' --include='*.tsx'

# Tests where the entire body is a single `expect` on a constant
grep -rEnB1 "expect\(\s*[\"'0-9]" apps packages --include='*.test.ts' --include='*.spec.ts'
```

For every match: read the test. If the assertion does not verify a real contract, fix it (re-derive from spec) or open a `BUGS.md` entry. Do not delete the test silently.

## Audit pass 3 — fake implementations

```bash
cd /Users/zardoz/projects/blerp

# "Returns nothing" implementations
grep -rEn "return\s*(\[\]|null|undefined|\{\})\s*;?\s*//.*(stub|TODO|placeholder|temporary|fake|mock)" apps packages \
  --include='*.ts' --include='*.tsx'

# "Not implemented" markers
grep -rEnI "not implemented|notImplemented|TODO.*implement|FIXME.*implement|throw new Error\([\"']Not implemented" \
  apps packages --include='*.ts' --include='*.tsx'

# Silent-success patterns
grep -rEn "catch\s*\([^)]*\)\s*\{\s*\}" apps packages --include='*.ts' --include='*.tsx'
grep -rEn "catch\s*\([^)]*\)\s*\{\s*console\.(log|warn|error)\([^)]*\)\s*;?\s*\}" apps packages \
  --include='*.ts' --include='*.tsx'

# Hardcoded "success" responses where the function should do work
grep -rEn "res\.(json|send)\(\s*\{\s*ok:\s*true\s*\}\s*\)" apps/api --include='*.ts'
```

Triage:

- Stub that has a real consumer → implement or remove the consumer.
- Stub with no consumer → delete.
- Empty catch → re-throw, return a typed error, or log structured (`pino`) AND surface upstream.

## Audit pass 4 — broken UI

```bash
cd /Users/zardoz/projects/blerp/apps/dashboard/src

# Buttons without onClick (rough; manual triage)
grep -rEn "<button[^>]*>" --include='*.tsx' | grep -v "onClick" | head -40

# Forms without onSubmit
grep -rEn "<form[^>]*>" --include='*.tsx' | grep -v "onSubmit" | head -40

# Mock-only handlers — UI calls a path that has no MSW handler AND no backend route
# (manual: grep paths in components, cross-check apps/api/src/v1/routes and apps/dashboard/src/mocks)

# Routes referenced but not registered in App.tsx
grep -rEn "navigate\([\"'][^\"']*[\"']" --include='*.tsx' | awk -F'"' '{print $2}' | sort -u
# Then compare against the routes declared in App.tsx
```

For each finding: load the page in a real browser (see `ui-verification`), confirm the rot, fix or file in `BUGS.md`.

## Audit pass 5 — past attempts & dual implementations

```bash
cd /Users/zardoz/projects/blerp

# Files with similar names that suggest a v1/v2 split
find apps packages -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" -not -path "*/dist/*" \
  | sed 's/\.[^.]*$//' | sort | uniq -d

# Multiple components with the same root name
ls apps/dashboard/src/components/auth | sed -E 's/(Modal|List|Form|View)\.tsx//' | sort | uniq -d

# Markers of removed code left in place
grep -rEnI "// REMOVED|// DELETED|// retired|// deprecated|// kept for|// historical" apps packages \
  --include='*.ts' --include='*.tsx'

# git: recently-added then-removed code that may have left orphans
git log --oneline --diff-filter=D -- 'apps/**/*.tsx' | head -20
```

Triage:

- Dual implementations → keep one, delete the other, update imports.
- "Kept for compatibility" with no released consumer → delete (`packages/nextjs`, `packages/backend` are pre-release).
- "Retired" comments with no live code → delete.

## Audit pass 6 — silent backend failures

```bash
cd /Users/zardoz/projects/blerp/apps/api/src

# Endpoints with no test
ls v1/controllers/*.ts | while read f; do
  name=$(basename "$f" .controller.ts)
  hit=$(grep -rl "$name" ../tests 2>/dev/null | wc -l)
  echo "$hit $name"
done | sort -n | head -20

# Controllers that don't go through a mapX() helper
grep -rEn "res\.json\(\s*[a-zA-Z_]+\s*\)" v1/controllers/ --include='*.ts'

# Missing CSRF guards on mutations
grep -rEn "router\.(post|put|patch|delete)" v1/routes/ --include='*.ts' | grep -v "csrf"

# Drizzle queries that return raw rows (camelCase) to a JSON response
grep -rEnB2 "res\.json" v1/controllers/ --include='*.ts' | grep -B1 "db\."
```

## Audit pass 7 — type erosion

```bash
cd /Users/zardoz/projects/blerp

# Bans from CLAUDE.md Engineering Standards
grep -rEn "\bas any\b|\bas unknown\b|: any\b|<any>" apps packages --include='*.ts' --include='*.tsx' \
  | grep -v node_modules | grep -v dist
grep -rEn "@ts-ignore|@ts-expect-error|@ts-nocheck" apps packages --include='*.ts' --include='*.tsx' \
  | grep -v node_modules | grep -v dist
grep -rEn "eslint-disable" apps packages --include='*.ts' --include='*.tsx' \
  | grep -v node_modules | grep -v dist
```

Every match is a CLAUDE.md violation. Fix or file in `BUGS.md`.

## Reporting

After the audit:

1. Each finding gets a one-line entry in `BUGS.md` (`BUG-NN` numbered).
2. Each fix in this session gets a line in `WHAT_WE_DID.md`.
3. Update `STATUS.md` with the audit completion.
4. If the audit blocks the current task, raise it in chat: "Found N rot symptoms in <area>, listing in BUGS.md — proceed with current task or pause for cleanup?"

## What this skill is NOT

- It is not a one-time cleanup. Rot regrows.
- It is not a substitute for tests catching the bug at write time. It is the safety net.
- It is not run silently — every finding is logged in `BUGS.md` per `CLAUDE.md` § 7.

## Output

When this skill fires, state which passes you ran (1–7) and the count of findings in each. Then list the top 5 findings by severity (UI-visible > silent-success > fake-test > dead-code) with file:line. Then either fix in-session (preferred) or open the issues and ask the user how to triage.
