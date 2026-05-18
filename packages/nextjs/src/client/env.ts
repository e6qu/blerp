/*
 * Client-side env helpers.
 *
 * Pre-r72: re-exported the central helpers from `@blerp/shared`
 * (BUG-46). Those helpers walk a `firstSet(...keys)` chain that
 * indexes `process.env[key]` dynamically.
 *
 * BUG-228 (codex r72): Next.js's webpack/turbopack only inlines
 * `process.env.NEXT_PUBLIC_*` references that appear as STATIC
 * member-expression accesses in the bundled source — dynamic
 * `process.env[varName]` lookups stay as literal property reads
 * against `{}` at runtime in the browser, returning `undefined`.
 * So a consumer using `getPublishableKey()` from the re-export
 * silently lost the value even when `NEXT_PUBLIC_BLERP_PUBLISHABLE_KEY`
 * was set at build time.
 *
 * This module now ships a thin client-only wrapper that lists every
 * supported public alias as a STATIC `process.env.NAME` read. The
 * bundler can see each name and inline the corresponding string,
 * falling through to undefined for the unused ones. Precedence
 * matches the shared helper's order (BLERP > CLERK across each
 * prefix family) for behavioural parity.
 *
 * Server-side consumers should keep importing from `@blerp/shared`
 * directly — Node.js has no static-inlining constraint and the
 * dynamic helper is more readable. Client code (anything that ends
 * up in the browser bundle) imports from here.
 */

const BUILD_TIME_PUBLISHABLE_KEY = "pk_build_placeholder";

function firstNonBlank(...values: Array<string | undefined>): string | undefined {
  for (const v of values) {
    if (v && v.trim() !== "") return v;
  }
  return undefined;
}

// Each `process.env.NEXT_PUBLIC_*` / `process.env.VITE_*` etc.
// MUST be a literal static reference so bundlers can statically
// replace it at build time. This is the documented contract for
// Next.js, Vite, Astro, Expo, Nuxt.
function readPublishableKey(): string | undefined {
  return firstNonBlank(
    process.env.BLERP_PUBLISHABLE_KEY,
    process.env.CLERK_PUBLISHABLE_KEY,
    process.env.NEXT_PUBLIC_BLERP_PUBLISHABLE_KEY,
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    process.env.VITE_BLERP_PUBLISHABLE_KEY,
    process.env.VITE_CLERK_PUBLISHABLE_KEY,
    process.env.PUBLIC_BLERP_PUBLISHABLE_KEY,
    process.env.PUBLIC_CLERK_PUBLISHABLE_KEY,
    process.env.EXPO_PUBLIC_BLERP_PUBLISHABLE_KEY,
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    process.env.NUXT_PUBLIC_BLERP_PUBLISHABLE_KEY,
    process.env.NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  );
}

export function getPublishableKey(): string | undefined {
  return readPublishableKey();
}

export function getPublishableKeyOrThrow(): string {
  const key = readPublishableKey();
  if (!key) {
    throw new Error(
      "Missing required environment variable: set BLERP_PUBLISHABLE_KEY (or CLERK_PUBLISHABLE_KEY " +
        "for Clerk compatibility). In Next.js client code, prefix with NEXT_PUBLIC_.",
    );
  }
  return key;
}

export function getPublishableKeyOrBuildPlaceholder(): string {
  return readPublishableKey() ?? BUILD_TIME_PUBLISHABLE_KEY;
}
