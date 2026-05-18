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

// BUG-234 (codex r75): same NEXT_PUBLIC_* inlining gotcha as BUG-228,
// extended to every URL the BlerpProvider seeds into initial state.
// The shared helpers in `@blerp/shared` use dynamic `process.env[key]`
// reads which Next.js / Vite bundlers do NOT inline; the values read
// in the browser bundle stayed `undefined` even with the env vars
// set at build time. Each helper here lists every supported public
// alias as a STATIC `process.env.NAME` access so the bundler can
// inline. Precedence matches the shared helper:
// BLERP > CLERK across each prefix family (bare > NEXT_PUBLIC_ >
// VITE_ > PUBLIC_ > EXPO_PUBLIC_ > NUXT_PUBLIC_).

function readSignInUrl(): string | undefined {
  return firstNonBlank(
    process.env.BLERP_SIGN_IN_URL,
    process.env.CLERK_SIGN_IN_URL,
    process.env.NEXT_PUBLIC_BLERP_SIGN_IN_URL,
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    process.env.VITE_BLERP_SIGN_IN_URL,
    process.env.VITE_CLERK_SIGN_IN_URL,
    process.env.PUBLIC_BLERP_SIGN_IN_URL,
    process.env.PUBLIC_CLERK_SIGN_IN_URL,
    process.env.EXPO_PUBLIC_BLERP_SIGN_IN_URL,
    process.env.EXPO_PUBLIC_CLERK_SIGN_IN_URL,
    process.env.NUXT_PUBLIC_BLERP_SIGN_IN_URL,
    process.env.NUXT_PUBLIC_CLERK_SIGN_IN_URL,
  );
}

function readSignUpUrl(): string | undefined {
  return firstNonBlank(
    process.env.BLERP_SIGN_UP_URL,
    process.env.CLERK_SIGN_UP_URL,
    process.env.NEXT_PUBLIC_BLERP_SIGN_UP_URL,
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    process.env.VITE_BLERP_SIGN_UP_URL,
    process.env.VITE_CLERK_SIGN_UP_URL,
    process.env.PUBLIC_BLERP_SIGN_UP_URL,
    process.env.PUBLIC_CLERK_SIGN_UP_URL,
    process.env.EXPO_PUBLIC_BLERP_SIGN_UP_URL,
    process.env.EXPO_PUBLIC_CLERK_SIGN_UP_URL,
    process.env.NUXT_PUBLIC_BLERP_SIGN_UP_URL,
    process.env.NUXT_PUBLIC_CLERK_SIGN_UP_URL,
  );
}

function readSignInForceRedirectUrl(): string | undefined {
  return firstNonBlank(
    process.env.BLERP_SIGN_IN_FORCE_REDIRECT_URL,
    process.env.CLERK_SIGN_IN_FORCE_REDIRECT_URL,
    process.env.NEXT_PUBLIC_BLERP_SIGN_IN_FORCE_REDIRECT_URL,
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL,
    process.env.VITE_BLERP_SIGN_IN_FORCE_REDIRECT_URL,
    process.env.VITE_CLERK_SIGN_IN_FORCE_REDIRECT_URL,
    process.env.PUBLIC_BLERP_SIGN_IN_FORCE_REDIRECT_URL,
    process.env.PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL,
    process.env.EXPO_PUBLIC_BLERP_SIGN_IN_FORCE_REDIRECT_URL,
    process.env.EXPO_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL,
    process.env.NUXT_PUBLIC_BLERP_SIGN_IN_FORCE_REDIRECT_URL,
    process.env.NUXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL,
  );
}

function readSignInFallbackRedirectUrl(): string | undefined {
  // Includes the deprecated AFTER_SIGN_IN_URL alias chain (BUG-97).
  return firstNonBlank(
    process.env.BLERP_SIGN_IN_FALLBACK_REDIRECT_URL,
    process.env.CLERK_SIGN_IN_FALLBACK_REDIRECT_URL,
    process.env.NEXT_PUBLIC_BLERP_SIGN_IN_FALLBACK_REDIRECT_URL,
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL,
    process.env.VITE_BLERP_SIGN_IN_FALLBACK_REDIRECT_URL,
    process.env.VITE_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL,
    process.env.PUBLIC_BLERP_SIGN_IN_FALLBACK_REDIRECT_URL,
    process.env.PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL,
    process.env.EXPO_PUBLIC_BLERP_SIGN_IN_FALLBACK_REDIRECT_URL,
    process.env.EXPO_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL,
    process.env.NUXT_PUBLIC_BLERP_SIGN_IN_FALLBACK_REDIRECT_URL,
    process.env.NUXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL,
    process.env.BLERP_AFTER_SIGN_IN_URL,
    process.env.CLERK_AFTER_SIGN_IN_URL,
    process.env.NEXT_PUBLIC_BLERP_AFTER_SIGN_IN_URL,
    process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    process.env.VITE_BLERP_AFTER_SIGN_IN_URL,
    process.env.VITE_CLERK_AFTER_SIGN_IN_URL,
  );
}

function readSignUpForceRedirectUrl(): string | undefined {
  return firstNonBlank(
    process.env.BLERP_SIGN_UP_FORCE_REDIRECT_URL,
    process.env.CLERK_SIGN_UP_FORCE_REDIRECT_URL,
    process.env.NEXT_PUBLIC_BLERP_SIGN_UP_FORCE_REDIRECT_URL,
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL,
    process.env.VITE_BLERP_SIGN_UP_FORCE_REDIRECT_URL,
    process.env.VITE_CLERK_SIGN_UP_FORCE_REDIRECT_URL,
    process.env.PUBLIC_BLERP_SIGN_UP_FORCE_REDIRECT_URL,
    process.env.PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL,
    process.env.EXPO_PUBLIC_BLERP_SIGN_UP_FORCE_REDIRECT_URL,
    process.env.EXPO_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL,
    process.env.NUXT_PUBLIC_BLERP_SIGN_UP_FORCE_REDIRECT_URL,
    process.env.NUXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL,
  );
}

function readSignUpFallbackRedirectUrl(): string | undefined {
  return firstNonBlank(
    process.env.BLERP_SIGN_UP_FALLBACK_REDIRECT_URL,
    process.env.CLERK_SIGN_UP_FALLBACK_REDIRECT_URL,
    process.env.NEXT_PUBLIC_BLERP_SIGN_UP_FALLBACK_REDIRECT_URL,
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL,
    process.env.VITE_BLERP_SIGN_UP_FALLBACK_REDIRECT_URL,
    process.env.VITE_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL,
    process.env.PUBLIC_BLERP_SIGN_UP_FALLBACK_REDIRECT_URL,
    process.env.PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL,
    process.env.EXPO_PUBLIC_BLERP_SIGN_UP_FALLBACK_REDIRECT_URL,
    process.env.EXPO_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL,
    process.env.NUXT_PUBLIC_BLERP_SIGN_UP_FALLBACK_REDIRECT_URL,
    process.env.NUXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL,
    process.env.BLERP_AFTER_SIGN_UP_URL,
    process.env.CLERK_AFTER_SIGN_UP_URL,
    process.env.NEXT_PUBLIC_BLERP_AFTER_SIGN_UP_URL,
    process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
    process.env.VITE_BLERP_AFTER_SIGN_UP_URL,
    process.env.VITE_CLERK_AFTER_SIGN_UP_URL,
  );
}

function readTenantId(): string | undefined {
  return firstNonBlank(
    process.env.BLERP_TENANT_ID,
    process.env.CLERK_TENANT_ID,
    process.env.NEXT_PUBLIC_BLERP_TENANT_ID,
    process.env.NEXT_PUBLIC_CLERK_TENANT_ID,
    process.env.VITE_BLERP_TENANT_ID,
    process.env.VITE_CLERK_TENANT_ID,
    process.env.PUBLIC_BLERP_TENANT_ID,
    process.env.PUBLIC_CLERK_TENANT_ID,
    process.env.EXPO_PUBLIC_BLERP_TENANT_ID,
    process.env.EXPO_PUBLIC_CLERK_TENANT_ID,
    process.env.NUXT_PUBLIC_BLERP_TENANT_ID,
    process.env.NUXT_PUBLIC_CLERK_TENANT_ID,
  );
}

export function getSignInUrl(defaultValue = "/sign-in"): string {
  return readSignInUrl() ?? defaultValue;
}

export function getSignUpUrl(defaultValue = "/sign-up"): string {
  return readSignUpUrl() ?? defaultValue;
}

export function getSignInForceRedirectUrl(): string | undefined {
  return readSignInForceRedirectUrl();
}

export function getSignInFallbackRedirectUrl(defaultValue = "/"): string {
  return readSignInFallbackRedirectUrl() ?? defaultValue;
}

export function getSignUpForceRedirectUrl(): string | undefined {
  return readSignUpForceRedirectUrl();
}

export function getSignUpFallbackRedirectUrl(defaultValue = "/"): string {
  return readSignUpFallbackRedirectUrl() ?? defaultValue;
}

export function getTenantId(defaultValue = "demo-tenant"): string {
  return readTenantId() ?? defaultValue;
}
