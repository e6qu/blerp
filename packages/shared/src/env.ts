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
 * BUG-84..BUG-97 (round 2 Clerk parity sweep) extended this to cover the
 * full documented CLERK_* surface per
 * https://clerk.com/docs/deployments/clerk-environment-variables : sign-
 * in/sign-up URLs, force/fallback redirect URLs, the renamed
 * CLERK_WEBHOOK_SIGNING_SECRET, NEXT_PUBLIC_CLERK_API_URL, satellite-
 * domain envs, proxy URL, JWT key, encryption key, telemetry flags,
 * deprecated AFTER_SIGN_*_URL aliases, and a VITE_ prefix for the
 * dashboard which Vite (the dashboard's bundler) requires for client-
 * exposed envs.
 *
 * This module replaces the per-package helpers — both server and client
 * packages import from here. Server-side keys throw when missing in
 * production; client-side keys must use the NEXT_PUBLIC_ (Next.js) or
 * VITE_ (Vite) prefix so the bundler inlines them at build time.
 *
 * NOTE on NEXT_PUBLIC_*: per Next.js 15+ docs, NEXT_PUBLIC_* vars are
 * **frozen at build time** — single-image multi-env Docker deploys
 * cannot change them at runtime. The runtime fallback path is
 * `/v1/public-config` (BUG-96): the API serves the same values from
 * process.env evaluated per-request, and the SDK hydrates from there
 * when the build-time value is the placeholder.
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

/**
 * Read the first non-blank value among the given env keys. Returns
 * undefined when none are set. Used by every helper to express a strict
 * precedence chain across BLERP_* / CLERK_* / NEXT_PUBLIC_* / VITE_* /
 * deprecated-alias keys without nesting `??` ladders.
 */
function firstSet(...keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = readNonBlank(key);
    if (value) return value;
  }
  return undefined;
}

/**
 * BUG-113 (codex r19): Clerk's docs list public env vars for several
 * non-Next frameworks. Build a unified alias chain across the prefixes
 * Clerk publishes today: bare > NEXT_PUBLIC_* (Next.js) > VITE_*
 * (Vite/Remix) > PUBLIC_* (Astro/SvelteKit) > EXPO_PUBLIC_* (Expo) >
 * NUXT_PUBLIC_* (Nuxt). Suffix is the part after the prefix, e.g.
 * "CLERK_PUBLISHABLE_KEY" → expands to
 * BLERP_CLERK_PUBLISHABLE_KEY first…
 *
 * Each call returns the keys in precedence order so a single
 * firstSet(...publicAliases("CLERK_PUBLISHABLE_KEY")) reads the full
 * documented surface.
 */
function publicAliases(blerpSuffix: string, clerkSuffix: string): readonly string[] {
  const prefixes = ["", "NEXT_PUBLIC_", "VITE_", "PUBLIC_", "EXPO_PUBLIC_", "NUXT_PUBLIC_"];
  const out: string[] = [];
  for (const p of prefixes) {
    out.push(`${p}BLERP_${blerpSuffix}`);
    out.push(`${p}CLERK_${clerkSuffix}`);
  }
  return out;
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

/**
 * BUG-88 (round-2 sweep): also accept the NEXT_PUBLIC_* / VITE_* forms
 * of the API URL. Clerk's docs list NEXT_PUBLIC_CLERK_API_URL for
 * client-side overrides; Vite-bundled frontends (dashboard) require the
 * VITE_ prefix or the var is invisible to client code. Server-side
 * BLERP_API_URL / CLERK_API_URL keep precedence so a single
 * BLERP_API_URL=... in a server `.env` overrides any stale NEXT_PUBLIC_
 * value baked into a prior build.
 */
export function getApiUrl(defaultValue = "http://localhost:3000"): string {
  // BUG-113 (codex r19): also honor CLERK_FAPI / NEXT_PUBLIC_CLERK_FAPI
  // / VITE_CLERK_FAPI which Clerk documents as the Frontend API URL
  // (for our purposes the same value as the API URL). Falls AFTER the
  // normal API_URL chain so an explicit CLERK_API_URL still wins.
  const raw =
    firstSet(...publicAliases("API_URL", "API_URL"), ...publicAliases("FAPI", "FAPI")) ??
    defaultValue;
  return normalizeApiUrl(raw);
}

/**
 * BUG-87 (round-2 sweep): accept the renamed CLERK_WEBHOOK_SIGNING_SECRET.
 * Clerk renamed CLERK_WEBHOOK_SECRET → CLERK_WEBHOOK_SIGNING_SECRET; both
 * names live in the wild. Precedence: BLERP_WEBHOOK_SECRET (we never
 * shipped a BLERP-namespaced "SIGNING" alias — BUG-105 codex r18 caught
 * the invented alias that contradicted the documented current-wins-
 * over-legacy rule) > current CLERK_WEBHOOK_SIGNING_SECRET > legacy
 * CLERK_WEBHOOK_SECRET.
 */
export function getWebhookSecret(): string | undefined {
  return firstSet("BLERP_WEBHOOK_SECRET", "CLERK_WEBHOOK_SIGNING_SECRET", "CLERK_WEBHOOK_SECRET");
}

export function getWebhookSecretOrThrow(): string {
  const value = getWebhookSecret();
  if (!value) {
    throw new Error(
      "Missing required environment variable: set BLERP_WEBHOOK_SECRET (or " +
        "CLERK_WEBHOOK_SIGNING_SECRET / CLERK_WEBHOOK_SECRET for Clerk compatibility).",
    );
  }
  return value;
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
  // BUG-113 (codex r19): full cross-framework alias chain.
  return firstSet(...publicAliases("TENANT_ID", "TENANT_ID")) ?? defaultValue;
}

// --- Client-side (NEXT_PUBLIC_* / VITE_*) -----------------------------------

/**
 * BUG-104 (codex r18): single ordered chain, not BLERP-vs-CLERK
 * namespace groups. Prior code grouped all BLERP_* aliases before all
 * CLERK_* aliases, so `NEXT_PUBLIC_BLERP_PUBLISHABLE_KEY` won over
 * `CLERK_PUBLISHABLE_KEY` even though the file's documented chain is
 * `BLERP_* > CLERK_* > NEXT_PUBLIC_BLERP_* > NEXT_PUBLIC_CLERK_* >
 * VITE_BLERP_* > VITE_CLERK_*`. Now consistent with every other
 * helper.
 *
 * The warn-on-conflict still fires when a server-side BLERP_ and
 * server-side CLERK_ both have non-blank values, since that's the
 * only ambiguity a customer might want to know about.
 */
export function getPublishableKey(): string | undefined {
  if (
    readNonBlank("BLERP_PUBLISHABLE_KEY") &&
    readNonBlank("CLERK_PUBLISHABLE_KEY") &&
    readNonBlank("BLERP_PUBLISHABLE_KEY") !== readNonBlank("CLERK_PUBLISHABLE_KEY")
  ) {
    warnOnce(
      "Both BLERP_PUBLISHABLE_KEY and CLERK_PUBLISHABLE_KEY are set with different values. " +
        "Using BLERP_PUBLISHABLE_KEY.",
    );
  }
  // BUG-113 (codex r19): full cross-framework alias chain.
  return firstSet(...publicAliases("PUBLISHABLE_KEY", "PUBLISHABLE_KEY"));
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

// --- Auth / redirect URLs (Clerk parity, BUG-84..BUG-86, BUG-94, BUG-97) ----
//
// Clerk publishes (with both bare CLERK_* server-side and NEXT_PUBLIC_*
// client-side variants):
//   CLERK_SIGN_IN_URL                       — landing page for sign-in.
//   CLERK_SIGN_UP_URL                       — landing page for sign-up.
//   CLERK_SIGN_IN_FORCE_REDIRECT_URL        — always send here post-sign-in.
//   CLERK_SIGN_IN_FALLBACK_REDIRECT_URL     — used only when no redirect_url
//                                             query param / no `?next=` is
//                                             present.
//   CLERK_SIGN_UP_FORCE_REDIRECT_URL        — sign-up equivalent.
//   CLERK_SIGN_UP_FALLBACK_REDIRECT_URL     — sign-up equivalent.
//
// Deprecated names (BUG-97) still supported by Clerk as a back-compat
// alias of the new FALLBACK_REDIRECT_URL: AFTER_SIGN_IN_URL, AFTER_SIGN_UP_URL.
//
// Precedence: BLERP_* > CLERK_* > NEXT_PUBLIC_BLERP_* > NEXT_PUBLIC_CLERK_*
//             > VITE_BLERP_* > VITE_CLERK_* > deprecated AFTER_* aliases.

function readUrlEnv(suffix: string, defaultValue: string): string {
  // BUG-113 (codex r19): full cross-framework alias chain.
  return firstSet(...publicAliases(suffix, suffix)) ?? defaultValue;
}

export function getSignInUrl(defaultValue = "/sign-in"): string {
  return readUrlEnv("SIGN_IN_URL", defaultValue);
}

export function getSignUpUrl(defaultValue = "/sign-up"): string {
  return readUrlEnv("SIGN_UP_URL", defaultValue);
}

export function getSignInForceRedirectUrl(): string | undefined {
  // BUG-113 (codex r19): full cross-framework alias chain.
  return firstSet(...publicAliases("SIGN_IN_FORCE_REDIRECT_URL", "SIGN_IN_FORCE_REDIRECT_URL"));
}

export function getSignInFallbackRedirectUrl(defaultValue = "/"): string {
  // BUG-113 (codex r19): full cross-framework alias chain + deprecated
  // AFTER_SIGN_IN_URL alias (BUG-97 / BUG-103) on every prefix family.
  return (
    firstSet(
      ...publicAliases("SIGN_IN_FALLBACK_REDIRECT_URL", "SIGN_IN_FALLBACK_REDIRECT_URL"),
      ...publicAliases("AFTER_SIGN_IN_URL", "AFTER_SIGN_IN_URL"),
    ) ?? defaultValue
  );
}

export function getSignUpForceRedirectUrl(): string | undefined {
  return firstSet(...publicAliases("SIGN_UP_FORCE_REDIRECT_URL", "SIGN_UP_FORCE_REDIRECT_URL"));
}

/**
 * BUG-101 (codex r18): Clerk's documented post-auth redirect precedence
 * is `force > caller-supplied > fallback`. We had this in
 * BlerpProvider.openSignIn/openSignUp but the embedded `<SignIn>` /
 * `<SignUp>` forms only used the caller value, so a customer setting
 * `CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard` had it honored by the
 * imperative `openSignIn()` but silently ignored by the rendered form
 * on a successful submit. Shared helper so both paths agree.
 */
export function resolveSignInRedirect(callerSupplied?: string, fallback?: string): string {
  return (
    getSignInForceRedirectUrl() ?? callerSupplied ?? fallback ?? getSignInFallbackRedirectUrl()
  );
}

export function resolveSignUpRedirect(callerSupplied?: string, fallback?: string): string {
  return (
    getSignUpForceRedirectUrl() ?? callerSupplied ?? fallback ?? getSignUpFallbackRedirectUrl()
  );
}

export function getSignUpFallbackRedirectUrl(defaultValue = "/"): string {
  return (
    firstSet(
      ...publicAliases("SIGN_UP_FALLBACK_REDIRECT_URL", "SIGN_UP_FALLBACK_REDIRECT_URL"),
      ...publicAliases("AFTER_SIGN_UP_URL", "AFTER_SIGN_UP_URL"),
    ) ?? defaultValue
  );
}

// --- Other CLERK_* envs (BUG-89..BUG-93) ------------------------------------
//
// These are accepted-but-largely-no-op for now: blerp doesn't implement
// telemetry, networkless JWT verification, dynamic-secret encryption,
// satellite domains, or a separate FAPI proxy. The contract is that
// setting any of these in a `.env` MUST NOT cause a startup error — that
// would break drop-in replacement. Helpers expose the read so future
// implementations can wire them without re-litigating the alias list.
// Satellite vars (BUG-91) are the exception: if a customer opts into
// satellite mode we throw a loud "not yet supported" error rather than
// silently dropping them and breaking SSO routing.

/**
 * BUG-106 (codex r18): Clerk also documents NEXT_PUBLIC_CLERK_JS_URL,
 * NEXT_PUBLIC_CLERK_JS_VERSION, and NEXT_PUBLIC_CLERK_API_VERSION.
 * Blerp doesn't load a remote JS bundle and only serves API v1, so
 * these are accepted-but-no-op for now. The helpers exist so customer
 * `.env` validation passes and a future implementation can wire them
 * without relitigating the alias list.
 */
export function getClerkJsUrl(): string | undefined {
  // BUG-113 (codex r19): include deprecated CLERK_JS as a back-compat
  // alias (was the original name before CLERK_JS_URL was introduced).
  return firstSet(...publicAliases("JS_URL", "JS_URL"), ...publicAliases("JS", "JS"));
}

export function getClerkJsVersion(): string | undefined {
  return firstSet(...publicAliases("JS_VERSION", "JS_VERSION"));
}

export function getApiVersion(defaultValue = "v1"): string {
  return firstSet(...publicAliases("API_VERSION", "API_VERSION")) ?? defaultValue;
}

export function getJwtKey(): string | undefined {
  return firstSet(...publicAliases("JWT_KEY", "JWT_KEY"));
}

export function getEncryptionKey(): string | undefined {
  // Server-only — never honored on public prefixes; exposing the
  // encryption key to client bundles would defeat its purpose.
  return firstSet("BLERP_ENCRYPTION_KEY", "CLERK_ENCRYPTION_KEY");
}

export function getProxyUrl(): string | undefined {
  return firstSet(...publicAliases("PROXY_URL", "PROXY_URL"));
}

function parseBoolEnv(raw: string | undefined): boolean {
  return raw === undefined ? false : ["1", "true", "yes"].includes(raw.toLowerCase());
}

export function getTelemetryDisabled(): boolean {
  return parseBoolEnv(firstSet(...publicAliases("TELEMETRY_DISABLED", "TELEMETRY_DISABLED")));
}

export function getTelemetryDebug(): boolean {
  return parseBoolEnv(firstSet(...publicAliases("TELEMETRY_DEBUG", "TELEMETRY_DEBUG")));
}

export function getSatelliteDomain(): string | undefined {
  return firstSet(...publicAliases("DOMAIN", "DOMAIN"));
}

export function isSatellite(): boolean {
  return parseBoolEnv(firstSet(...publicAliases("IS_SATELLITE", "IS_SATELLITE")));
}

/**
 * Loud failure (BUG-91): blerp doesn't implement satellite-domain SSO
 * yet. A drop-in customer setting CLERK_IS_SATELLITE=true expects their
 * users to flow back to the primary domain for sign-in; silently
 * ignoring the flag would route them to the wrong place. Call this at
 * startup from any consumer that cares (middleware, BlerpProvider, the
 * backend SDK) so the customer gets an actionable error instead of a
 * silent regression.
 */
export function assertSatelliteNotConfigured(): void {
  if (isSatellite() || getSatelliteDomain()) {
    throw new Error(
      "Blerp does not yet implement Clerk's satellite-domain SSO (CLERK_IS_SATELLITE / " +
        "CLERK_DOMAIN). Track this at https://github.com/e6qu/blerp/issues — for now, deploy " +
        "blerp on a single primary domain or vendor your own cross-domain handoff.",
    );
  }
}
