/*
 * Centralised env-var lookup that accepts both BLERP_* and CLERK_*.
 *
 * Background (BUG-46): the original env helper in `@blerp/backend` already
 * resolved either name with a warn-once when both are set. That helper was
 * only used inside `@blerp/backend`, so every other consumer (the Next.js
 * SDK middleware/auth, the testing harness, `apps/api`, `apps/dashboard`,
 * the examples) read `process.env.BLERP_*` directly and silently ignored
 * `CLERK_*` when set. That broke the "drop-in Clerk replacement" promise.
 *
 * This module replaces the per-package helpers — both server and client
 * packages import from here. Server-side keys throw when missing in
 * production; client-side keys must use the NEXT_PUBLIC_ prefix (Next.js
 * bundler inlines them at build time, so process.env reads at runtime
 * return the build-time value).
 *
 * Convention:
 *   getX()         — optional read, returns string | undefined.
 *   getXOrThrow()  — required read, throws with a clear message naming
 *                    both the BLERP_ and CLERK_ env var so the user knows
 *                    they can set either.
 *
 * The warn-once dedup is keyed by message so the same conflict only logs
 * once per process even across helper invocations.
 */

const warned = new Set<string>();

function warnOnce(message: string): void {
  if (warned.has(message)) return;
  warned.add(message);
  // Both server (Node) and client (browser, Next.js) consoles are fine.

  console.warn(`[Blerp] ${message}`);
}

interface ReadOptions {
  required?: boolean;
  defaultValue?: string;
}

/**
 * Treat blank strings as unset. BUG-79 (codex r15): a deployment that
 * ships an .env template with `BLERP_API_URL=` (intentionally blank)
 * plus `CLERK_API_URL=https://api.example/v1` would otherwise short-
 * circuit to the empty string instead of falling back to the CLERK_*
 * alias, producing relative-URL bugs downstream.
 */
function readNonBlank(key: string): string | undefined {
  const value = process.env[key];
  return value && value.trim() !== "" ? value : undefined;
}

function readEither(
  blerpKey: string,
  clerkKey: string,
  options: ReadOptions = {},
): string | undefined {
  const blerpValue = readNonBlank(blerpKey);
  const clerkValue = readNonBlank(clerkKey);

  if (blerpValue && clerkValue && blerpValue !== clerkValue) {
    warnOnce(
      `Both ${blerpKey} and ${clerkKey} are set with different values. ` +
        `Using ${blerpKey}. Remove ${clerkKey} to silence this warning.`,
    );
  }

  const value = blerpValue ?? clerkValue ?? options.defaultValue;

  if (!value && options.required) {
    throw new Error(
      `Missing required environment variable: set ${blerpKey} (or ${clerkKey} for Clerk compatibility).`,
    );
  }

  return value;
}

// --- Server-side keys -------------------------------------------------------

export function getSecretKey(): string | undefined {
  return readEither("BLERP_SECRET_KEY", "CLERK_SECRET_KEY");
}

export function getSecretKeyOrThrow(): string {
  return readEither("BLERP_SECRET_KEY", "CLERK_SECRET_KEY", { required: true })!;
}

/**
 * Strip a trailing `/v1` (with or without a trailing slash) from the
 * URL. Clerk's documented `CLERK_API_URL` form is `https://api.clerk.com/v1`
 * — i.e. it INCLUDES the version path — while every caller in this
 * repo appends `/v1/...` itself. Without this normalisation the URL
 * resolves to `/v1/v1/...` and 404s (BUG-74 codex r11). Idempotent —
 * already-bare base URLs pass through unchanged.
 *
 * Exported so the inlined env reads in entry-point files
 * (`apps/api/src/index.ts`, `apps/api/src/v1/services/webauthn.service.ts`,
 * `apps/dashboard/vite.config.ts`, etc.) can apply the same normalisation
 * without re-implementing it.
 */
export function normalizeApiUrl(rawUrl: string): string {
  // BUG-80 (codex r15): strip a trailing `/v1` AND any trailing slashes
  // so `BLERP_API_URL=https://api.example.com/` doesn't produce
  // `//v1/jwks` after the join. Idempotent.
  return rawUrl.replace(/\/v1\/?$/i, "").replace(/\/+$/, "");
}

export function getApiUrl(defaultValue = "http://localhost:3000"): string {
  return normalizeApiUrl(readEither("BLERP_API_URL", "CLERK_API_URL", { defaultValue })!);
}

export function getWebhookSecret(): string | undefined {
  return readEither("BLERP_WEBHOOK_SECRET", "CLERK_WEBHOOK_SECRET");
}

export function getWebhookSecretOrThrow(): string {
  return readEither("BLERP_WEBHOOK_SECRET", "CLERK_WEBHOOK_SECRET", { required: true })!;
}

// Tenant id has no Clerk equivalent (Clerk has a single tenant per
// instance). Default to "demo-tenant" so dev-mode "just works" without
// any env vars set; production deployments must set BLERP_TENANT_ID
// explicitly. CLERK_TENANT_ID is honored as a courtesy alias for users
// migrating multi-tenant Clerk-shaped wrappers.
//
// BUG-81 (codex r17): also check NEXT_PUBLIC_* aliases so client code
// (BlerpProvider, dashboard components) gets the same tenant as the
// server-side `currentUser()` / membership lookups. Without this, a
// production deployment setting only BLERP_TENANT_ID had server
// requests go to the right tenant while client requests still used
// "demo-tenant" — silent divergence.
export function getTenantId(defaultValue = "demo-tenant"): string {
  return (
    readNonBlank("BLERP_TENANT_ID") ??
    readNonBlank("CLERK_TENANT_ID") ??
    readNonBlank("NEXT_PUBLIC_BLERP_TENANT_ID") ??
    readNonBlank("NEXT_PUBLIC_CLERK_TENANT_ID") ??
    defaultValue
  );
}

// --- Client-side (NEXT_PUBLIC_*) --------------------------------------------

export function getPublishableKey(): string | undefined {
  const blerpKey =
    process.env.BLERP_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_BLERP_PUBLISHABLE_KEY;
  const clerkKey =
    process.env.CLERK_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (blerpKey && clerkKey && blerpKey !== clerkKey) {
    warnOnce(
      "Both *_BLERP_PUBLISHABLE_KEY and *_CLERK_PUBLISHABLE_KEY are set with different values. " +
        "Using BLERP_PUBLISHABLE_KEY.",
    );
  }

  return blerpKey ?? clerkKey;
}

export function getPublishableKeyOrThrow(): string {
  const key = getPublishableKey();
  if (!key) {
    throw new Error(
      "Missing required environment variable: set BLERP_PUBLISHABLE_KEY (or CLERK_PUBLISHABLE_KEY " +
        "for Clerk compatibility). In Next.js client code, prefix with NEXT_PUBLIC_.",
    );
  }
  return key;
}

const BUILD_TIME_PUBLISHABLE_KEY = "pk_build_placeholder";

/**
 * Returns the publishable key, or a build-time placeholder when running
 * inside `next build` without the env set. Lets the production bundle
 * include the value at runtime via `NEXT_PUBLIC_BLERP_PUBLISHABLE_KEY`
 * even when the build environment doesn't have it.
 */
export function getPublishableKeyOrBuildPlaceholder(): string {
  return getPublishableKey() ?? BUILD_TIME_PUBLISHABLE_KEY;
}

// --- Local-dev convenience --------------------------------------------------

export function getApiPort(defaultValue = "3000"): string {
  // Clerk is hosted so it has no canonical *_API_PORT, but
  // BUG-82 (codex r17) lesson: any env value that might be supplied
  // blank in a template needs blank-coercion to avoid parseInt("")=NaN
  // downstream.
  return (
    readNonBlank("BLERP_API_PORT") ??
    readNonBlank("CLERK_API_PORT") ??
    readNonBlank("PORT") ??
    defaultValue
  );
}

export function getDashboardPort(defaultValue = "3001"): string {
  return (
    readNonBlank("BLERP_DASHBOARD_PORT") ?? readNonBlank("CLERK_DASHBOARD_PORT") ?? defaultValue
  );
}
