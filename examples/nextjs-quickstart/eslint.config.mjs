// Per the Bun-first mandate (CLAUDE.md) plus CLAUDE.md's zero-tolerance
// for lint warnings: `next lint` was emitting "The Next.js plugin was
// not detected in your ESLint configuration" on every monorepo lint
// run. Rather than install eslint-config-next + the Next.js plugin in
// this isolated example app (heavy peer-dep tree), defer to the
// monorepo's shared flat config — the same one apps/dashboard uses.
import reactConfig from "@blerp/config/eslint-react";

export default [
  ...reactConfig,
  {
    ignores: ["dist/**", ".next/**", "node_modules/**"],
  },
];
