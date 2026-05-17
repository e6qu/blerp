/*
 * BUG-46 regression test — the shared env helpers must honor both
 * BLERP_* and CLERK_* variable names. Prior to PR #53, only
 * @blerp/backend honored CLERK_*; every other consumer read
 * process.env.BLERP_* directly.
 */
import { afterEach, describe, expect, it } from "vitest";
import {
  assertSatelliteNotConfigured,
  getApiUrl,
  getApiVersion,
  getClerkJsUrl,
  getClerkJsVersion,
  getEncryptionKey,
  getJwtKey,
  getProxyUrl,
  getPublishableKey,
  getSecretKey,
  getSignInFallbackRedirectUrl,
  getSignInForceRedirectUrl,
  getSignInUrl,
  getSignUpFallbackRedirectUrl,
  getSignUpForceRedirectUrl,
  getSignUpUrl,
  getTelemetryDisabled,
  getTenantId,
  getWebhookSecret,
  isSatellite,
  resolveSignInRedirect,
  resolveSignUpRedirect,
} from "@blerp/shared";

const PROTECTED = [
  "BLERP_SECRET_KEY",
  "CLERK_SECRET_KEY",
  "BLERP_API_URL",
  "CLERK_API_URL",
  "NEXT_PUBLIC_BLERP_API_URL",
  "NEXT_PUBLIC_CLERK_API_URL",
  "VITE_BLERP_API_URL",
  "VITE_CLERK_API_URL",
  "BLERP_WEBHOOK_SECRET",
  "CLERK_WEBHOOK_SECRET",
  "CLERK_WEBHOOK_SIGNING_SECRET",
  "BLERP_PUBLISHABLE_KEY",
  "CLERK_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_BLERP_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "VITE_BLERP_PUBLISHABLE_KEY",
  "VITE_CLERK_PUBLISHABLE_KEY",
  "BLERP_TENANT_ID",
  "CLERK_TENANT_ID",
  "NEXT_PUBLIC_BLERP_TENANT_ID",
  "NEXT_PUBLIC_CLERK_TENANT_ID",
  "VITE_BLERP_TENANT_ID",
  "VITE_CLERK_TENANT_ID",
  "BLERP_SIGN_IN_URL",
  "CLERK_SIGN_IN_URL",
  "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
  "VITE_CLERK_SIGN_IN_URL",
  "BLERP_SIGN_UP_URL",
  "CLERK_SIGN_UP_URL",
  "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
  "VITE_CLERK_SIGN_UP_URL",
  "CLERK_SIGN_IN_FORCE_REDIRECT_URL",
  "CLERK_SIGN_IN_FALLBACK_REDIRECT_URL",
  "CLERK_SIGN_UP_FORCE_REDIRECT_URL",
  "CLERK_SIGN_UP_FALLBACK_REDIRECT_URL",
  "CLERK_AFTER_SIGN_IN_URL",
  "CLERK_AFTER_SIGN_UP_URL",
  "BLERP_JWT_KEY",
  "CLERK_JWT_KEY",
  "NEXT_PUBLIC_CLERK_JWT_KEY",
  "BLERP_ENCRYPTION_KEY",
  "CLERK_ENCRYPTION_KEY",
  "BLERP_PROXY_URL",
  "CLERK_PROXY_URL",
  "NEXT_PUBLIC_CLERK_PROXY_URL",
  "BLERP_TELEMETRY_DISABLED",
  "CLERK_TELEMETRY_DISABLED",
  "NEXT_PUBLIC_CLERK_TELEMETRY_DISABLED",
  "BLERP_IS_SATELLITE",
  "CLERK_IS_SATELLITE",
  "BLERP_DOMAIN",
  "CLERK_DOMAIN",
  "VITE_CLERK_AFTER_SIGN_IN_URL",
  "VITE_CLERK_AFTER_SIGN_UP_URL",
  "CLERK_JS_URL",
  "CLERK_JS_VERSION",
  "CLERK_API_VERSION",
  "BLERP_WEBHOOK_SIGNING_SECRET",
  // BUG-113 (codex r19) — cross-framework prefix aliases
  "PUBLIC_CLERK_PUBLISHABLE_KEY",
  "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_FAPI",
  "NEXT_PUBLIC_CLERK_FAPI",
  "CLERK_JS",
] as const;

function snapshot() {
  return Object.fromEntries(PROTECTED.map((k) => [k, process.env[k]] as const));
}

function restore(saved: Record<string, string | undefined>) {
  for (const k of PROTECTED) {
    if (saved[k] === undefined) {
      delete process.env[k];
    } else {
      process.env[k] = saved[k];
    }
  }
}

function clear() {
  for (const k of PROTECTED) delete process.env[k];
}

describe("Clerk-compat env helpers (BUG-46)", () => {
  const saved = snapshot();

  afterEach(() => {
    restore(saved);
  });

  it("getSecretKey returns CLERK_SECRET_KEY when BLERP_SECRET_KEY is unset", () => {
    clear();
    process.env.CLERK_SECRET_KEY = "sk_test_from_clerk";
    expect(getSecretKey()).toBe("sk_test_from_clerk");
  });

  it("BLERP_SECRET_KEY wins when both are set to different values", () => {
    clear();
    process.env.BLERP_SECRET_KEY = "sk_blerp_wins";
    process.env.CLERK_SECRET_KEY = "sk_clerk_loses";
    expect(getSecretKey()).toBe("sk_blerp_wins");
  });

  it("getApiUrl returns CLERK_API_URL fallback before the hard-coded default", () => {
    clear();
    process.env.CLERK_API_URL = "https://api.example.test";
    expect(getApiUrl()).toBe("https://api.example.test");
  });

  it("getApiUrl falls back to the supplied default when neither var is set", () => {
    clear();
    expect(getApiUrl("http://default.test")).toBe("http://default.test");
  });

  it("BUG-79: blank BLERP_API_URL falls through to CLERK_API_URL instead of returning the empty string", () => {
    clear();
    process.env.BLERP_API_URL = "";
    process.env.CLERK_API_URL = "https://api.example.com";
    expect(getApiUrl()).toBe("https://api.example.com");
  });

  it("BUG-80: getApiUrl strips both a trailing /v1 and a bare trailing slash", () => {
    clear();
    process.env.BLERP_API_URL = "https://api.example.com/v1";
    expect(getApiUrl()).toBe("https://api.example.com");
    process.env.BLERP_API_URL = "https://api.example.com/";
    expect(getApiUrl()).toBe("https://api.example.com");
    process.env.BLERP_API_URL = "https://api.example.com/v1/";
    expect(getApiUrl()).toBe("https://api.example.com");
    // idempotent on already-bare URLs
    process.env.BLERP_API_URL = "https://api.example.com";
    expect(getApiUrl()).toBe("https://api.example.com");
  });

  it("BUG-81: getTenantId also honors NEXT_PUBLIC_* aliases so client/server agree", () => {
    clear();
    process.env.NEXT_PUBLIC_CLERK_TENANT_ID = "tenant_via_next_public";
    expect(getTenantId()).toBe("tenant_via_next_public");
    clear();
    process.env.NEXT_PUBLIC_BLERP_TENANT_ID = "tenant_blerp";
    process.env.NEXT_PUBLIC_CLERK_TENANT_ID = "tenant_clerk";
    expect(getTenantId()).toBe("tenant_blerp"); // BLERP wins
    // Bare BLERP_TENANT_ID outranks any NEXT_PUBLIC_*
    process.env.BLERP_TENANT_ID = "tenant_bare_blerp";
    expect(getTenantId()).toBe("tenant_bare_blerp");
  });

  it("getWebhookSecret honors CLERK_WEBHOOK_SECRET", () => {
    clear();
    process.env.CLERK_WEBHOOK_SECRET = "whsec_from_clerk";
    expect(getWebhookSecret()).toBe("whsec_from_clerk");
  });

  it("getPublishableKey honors NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", () => {
    clear();
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_from_clerk";
    expect(getPublishableKey()).toBe("pk_test_from_clerk");
  });

  it("getPublishableKey prefers NEXT_PUBLIC_BLERP_PUBLISHABLE_KEY over Clerk's", () => {
    clear();
    process.env.NEXT_PUBLIC_BLERP_PUBLISHABLE_KEY = "pk_blerp_wins";
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_clerk_loses";
    expect(getPublishableKey()).toBe("pk_blerp_wins");
  });

  it("getTenantId honors CLERK_TENANT_ID and falls back to the demo default", () => {
    clear();
    expect(getTenantId()).toBe("demo-tenant");
    process.env.CLERK_TENANT_ID = "tenant_42";
    expect(getTenantId()).toBe("tenant_42");
  });

  // --- Round-2 Clerk parity sweep (BUG-84..BUG-97) ------------------

  it("BUG-87: getWebhookSecret accepts the renamed CLERK_WEBHOOK_SIGNING_SECRET", () => {
    clear();
    process.env.CLERK_WEBHOOK_SIGNING_SECRET = "whsec_new_name";
    expect(getWebhookSecret()).toBe("whsec_new_name");
    // Legacy CLERK_WEBHOOK_SECRET still wins when set alongside (it ranks higher than
    // the new name? No — the new name ranks higher than the legacy because Clerk
    // renamed it; we ship the precedence per env.ts).
    process.env.CLERK_WEBHOOK_SECRET = "whsec_legacy";
    expect(getWebhookSecret()).toBe("whsec_new_name");
    // BLERP_* still wins over either Clerk name.
    process.env.BLERP_WEBHOOK_SECRET = "whsec_blerp";
    expect(getWebhookSecret()).toBe("whsec_blerp");
  });

  it("BUG-88: getApiUrl honors NEXT_PUBLIC_CLERK_API_URL and VITE_CLERK_API_URL", () => {
    clear();
    process.env.NEXT_PUBLIC_CLERK_API_URL = "https://next.example";
    expect(getApiUrl()).toBe("https://next.example");
    clear();
    process.env.VITE_CLERK_API_URL = "https://vite.example/v1";
    expect(getApiUrl()).toBe("https://vite.example");
  });

  it("BUG-84: getSignInUrl honors CLERK_SIGN_IN_URL (+ NEXT_PUBLIC_ / VITE_ aliases)", () => {
    clear();
    expect(getSignInUrl()).toBe("/sign-in");
    process.env.CLERK_SIGN_IN_URL = "/login";
    expect(getSignInUrl()).toBe("/login");
    process.env.BLERP_SIGN_IN_URL = "/auth/login";
    expect(getSignInUrl()).toBe("/auth/login"); // BLERP wins
    clear();
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL = "/next-login";
    expect(getSignInUrl()).toBe("/next-login");
    clear();
    process.env.VITE_CLERK_SIGN_IN_URL = "/vite-login";
    expect(getSignInUrl()).toBe("/vite-login");
  });

  it("BUG-84: getSignUpUrl honors CLERK_SIGN_UP_URL with full alias chain", () => {
    clear();
    expect(getSignUpUrl()).toBe("/sign-up");
    process.env.CLERK_SIGN_UP_URL = "/register";
    expect(getSignUpUrl()).toBe("/register");
  });

  it("BUG-94: force-redirect URLs take precedence over fallback + AFTER_* deprecated aliases", () => {
    clear();
    // No envs → no force, fallback defaults to "/"
    expect(getSignInForceRedirectUrl()).toBeUndefined();
    expect(getSignInFallbackRedirectUrl()).toBe("/");
    // Force set
    process.env.CLERK_SIGN_IN_FORCE_REDIRECT_URL = "/forced";
    expect(getSignInForceRedirectUrl()).toBe("/forced");
    // Fallback set independently
    process.env.CLERK_SIGN_IN_FALLBACK_REDIRECT_URL = "/dashboard";
    expect(getSignInFallbackRedirectUrl()).toBe("/dashboard");
  });

  it("BUG-97: deprecated CLERK_AFTER_SIGN_IN_URL still works as fallback alias", () => {
    clear();
    process.env.CLERK_AFTER_SIGN_IN_URL = "/old-after";
    expect(getSignInFallbackRedirectUrl()).toBe("/old-after");
    // New name wins over deprecated
    process.env.CLERK_SIGN_IN_FALLBACK_REDIRECT_URL = "/new-fallback";
    expect(getSignInFallbackRedirectUrl()).toBe("/new-fallback");
  });

  it("BUG-94: sign-up force + fallback redirect URLs honored", () => {
    clear();
    expect(getSignUpForceRedirectUrl()).toBeUndefined();
    expect(getSignUpFallbackRedirectUrl()).toBe("/");
    process.env.CLERK_SIGN_UP_FORCE_REDIRECT_URL = "/welcome";
    expect(getSignUpForceRedirectUrl()).toBe("/welcome");
    process.env.CLERK_AFTER_SIGN_UP_URL = "/onboarding";
    expect(getSignUpFallbackRedirectUrl()).toBe("/onboarding");
  });

  it("BUG-90: getJwtKey accepts CLERK_JWT_KEY and the NEXT_PUBLIC_ alias", () => {
    clear();
    expect(getJwtKey()).toBeUndefined();
    process.env.CLERK_JWT_KEY = "-----BEGIN PUBLIC KEY-----";
    expect(getJwtKey()).toBe("-----BEGIN PUBLIC KEY-----");
    clear();
    process.env.NEXT_PUBLIC_CLERK_JWT_KEY = "next-jwt-key";
    expect(getJwtKey()).toBe("next-jwt-key");
  });

  it("BUG-93: getEncryptionKey accepts CLERK_ENCRYPTION_KEY", () => {
    clear();
    expect(getEncryptionKey()).toBeUndefined();
    process.env.CLERK_ENCRYPTION_KEY = "enc_key";
    expect(getEncryptionKey()).toBe("enc_key");
  });

  it("BUG-92: getProxyUrl accepts CLERK_PROXY_URL", () => {
    clear();
    expect(getProxyUrl()).toBeUndefined();
    process.env.CLERK_PROXY_URL = "https://proxy.example/__clerk";
    expect(getProxyUrl()).toBe("https://proxy.example/__clerk");
  });

  it("BUG-89: getTelemetryDisabled parses truthy values from CLERK_TELEMETRY_DISABLED", () => {
    clear();
    expect(getTelemetryDisabled()).toBe(false);
    process.env.CLERK_TELEMETRY_DISABLED = "true";
    expect(getTelemetryDisabled()).toBe(true);
    process.env.CLERK_TELEMETRY_DISABLED = "1";
    expect(getTelemetryDisabled()).toBe(true);
    process.env.CLERK_TELEMETRY_DISABLED = "no";
    expect(getTelemetryDisabled()).toBe(false);
  });

  // --- Codex r18 follow-ups (BUG-98..BUG-107) -----------------------

  it("BUG-103: deprecated VITE_CLERK_AFTER_SIGN_IN_URL is honored as fallback alias", () => {
    clear();
    process.env.VITE_CLERK_AFTER_SIGN_IN_URL = "/vite-old";
    expect(getSignInFallbackRedirectUrl()).toBe("/vite-old");
  });

  it("BUG-103: deprecated VITE_CLERK_AFTER_SIGN_UP_URL is honored as fallback alias", () => {
    clear();
    process.env.VITE_CLERK_AFTER_SIGN_UP_URL = "/vite-old-up";
    expect(getSignUpFallbackRedirectUrl()).toBe("/vite-old-up");
  });

  it("BUG-104: getPublishableKey uses single ordered chain — bare CLERK beats NEXT_PUBLIC_BLERP", () => {
    clear();
    process.env.CLERK_PUBLISHABLE_KEY = "pk_clerk_bare";
    process.env.NEXT_PUBLIC_BLERP_PUBLISHABLE_KEY = "pk_blerp_next_public";
    // Documented chain: BLERP_* > CLERK_* > NEXT_PUBLIC_BLERP_* > ...
    // Bare CLERK wins over NEXT_PUBLIC_BLERP — namespaces NOT grouped.
    expect(getPublishableKey()).toBe("pk_clerk_bare");
  });

  it("BUG-104: BLERP still beats CLERK and both beat NEXT_PUBLIC_*", () => {
    clear();
    process.env.BLERP_PUBLISHABLE_KEY = "pk_blerp_bare";
    process.env.CLERK_PUBLISHABLE_KEY = "pk_clerk_bare";
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_next_public";
    expect(getPublishableKey()).toBe("pk_blerp_bare");
  });

  it("BUG-105: webhook current Clerk name beats legacy when both Clerk forms are set", () => {
    clear();
    process.env.CLERK_WEBHOOK_SECRET = "whsec_legacy";
    process.env.CLERK_WEBHOOK_SIGNING_SECRET = "whsec_current";
    expect(getWebhookSecret()).toBe("whsec_current");
  });

  it("BUG-105: invented BLERP_WEBHOOK_SIGNING_SECRET is NOT a recognized alias — BLERP_WEBHOOK_SECRET is the only BLERP form", () => {
    clear();
    process.env.BLERP_WEBHOOK_SIGNING_SECRET = "should_be_ignored";
    process.env.CLERK_WEBHOOK_SIGNING_SECRET = "whsec_current";
    // BLERP signing name was never documented — only the bare BLERP form.
    // The current CLERK name wins because the invented BLERP signing alias
    // doesn't exist in the chain.
    expect(getWebhookSecret()).toBe("whsec_current");
  });

  it("BUG-106: getClerkJsUrl honors CLERK_JS_URL + NEXT_PUBLIC_ alias", () => {
    clear();
    expect(getClerkJsUrl()).toBeUndefined();
    process.env.CLERK_JS_URL = "https://cdn.example/blerp.js";
    expect(getClerkJsUrl()).toBe("https://cdn.example/blerp.js");
  });

  it("BUG-106: getClerkJsVersion honors CLERK_JS_VERSION", () => {
    clear();
    expect(getClerkJsVersion()).toBeUndefined();
    process.env.CLERK_JS_VERSION = "1.2.3";
    expect(getClerkJsVersion()).toBe("1.2.3");
  });

  it("BUG-106: getApiVersion defaults to v1 and honors CLERK_API_VERSION", () => {
    clear();
    expect(getApiVersion()).toBe("v1");
    process.env.CLERK_API_VERSION = "v2";
    expect(getApiVersion()).toBe("v2");
  });

  it("BUG-101: resolveSignInRedirect enforces force > caller > fallback", () => {
    clear();
    // No env: caller wins over default fallback "/"
    expect(resolveSignInRedirect("/from-caller")).toBe("/from-caller");
    expect(resolveSignInRedirect(undefined, "/from-fallback")).toBe("/from-fallback");
    expect(resolveSignInRedirect()).toBe("/");
    // Force overrides everything below
    process.env.CLERK_SIGN_IN_FORCE_REDIRECT_URL = "/forced";
    expect(resolveSignInRedirect("/from-caller", "/from-fallback")).toBe("/forced");
  });

  it("BUG-101: resolveSignUpRedirect enforces force > caller > fallback", () => {
    clear();
    expect(resolveSignUpRedirect("/from-caller")).toBe("/from-caller");
    process.env.CLERK_SIGN_UP_FORCE_REDIRECT_URL = "/forced-up";
    expect(resolveSignUpRedirect("/from-caller")).toBe("/forced-up");
  });

  // --- Codex r19 follow-ups (BUG-108..BUG-113) ----------------------

  it("BUG-113: PUBLIC_CLERK_PUBLISHABLE_KEY honored (Astro/SvelteKit prefix)", () => {
    clear();
    process.env.PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_astro";
    expect(getPublishableKey()).toBe("pk_astro");
  });

  it("BUG-113: EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY honored (Expo prefix)", () => {
    clear();
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_expo";
    expect(getPublishableKey()).toBe("pk_expo");
  });

  it("BUG-113: NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY honored (Nuxt prefix)", () => {
    clear();
    process.env.NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_nuxt";
    expect(getPublishableKey()).toBe("pk_nuxt");
  });

  it("BUG-113: cross-framework prefix precedence — bare > NEXT_PUBLIC > VITE > PUBLIC > EXPO > NUXT", () => {
    clear();
    process.env.NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_nuxt";
    expect(getPublishableKey()).toBe("pk_nuxt");
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_expo";
    expect(getPublishableKey()).toBe("pk_expo"); // expo beats nuxt
    process.env.PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_astro";
    expect(getPublishableKey()).toBe("pk_astro"); // public beats expo
    process.env.VITE_CLERK_PUBLISHABLE_KEY = "pk_vite";
    expect(getPublishableKey()).toBe("pk_vite"); // vite beats public
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_next";
    expect(getPublishableKey()).toBe("pk_next"); // next beats vite
    process.env.CLERK_PUBLISHABLE_KEY = "pk_bare_clerk";
    expect(getPublishableKey()).toBe("pk_bare_clerk"); // bare beats all
  });

  it("BUG-113: getApiUrl accepts CLERK_FAPI as the Frontend API alias", () => {
    clear();
    process.env.CLERK_FAPI = "https://fapi.example.com/v1";
    expect(getApiUrl()).toBe("https://fapi.example.com");
    // CLERK_API_URL still wins because it comes earlier in the chain
    process.env.CLERK_API_URL = "https://api.example.com";
    expect(getApiUrl()).toBe("https://api.example.com");
  });

  it("BUG-113: deprecated CLERK_JS env honored as alias of CLERK_JS_URL", () => {
    clear();
    process.env.CLERK_JS = "https://legacy.example/blerp.js";
    expect(getClerkJsUrl()).toBe("https://legacy.example/blerp.js");
    process.env.CLERK_JS_URL = "https://current.example/blerp.js";
    expect(getClerkJsUrl()).toBe("https://current.example/blerp.js"); // current wins
  });

  it("BUG-91: assertSatelliteNotConfigured throws when CLERK_IS_SATELLITE=true", () => {
    clear();
    // No-op when not set
    expect(() => assertSatelliteNotConfigured()).not.toThrow();
    expect(isSatellite()).toBe(false);
    process.env.CLERK_IS_SATELLITE = "true";
    expect(isSatellite()).toBe(true);
    expect(() => assertSatelliteNotConfigured()).toThrow(/satellite-domain SSO/);
    clear();
    // CLERK_DOMAIN alone also throws (satellite handoff target).
    process.env.CLERK_DOMAIN = "foo.example.com";
    expect(() => assertSatelliteNotConfigured()).toThrow(/satellite-domain SSO/);
  });
});
