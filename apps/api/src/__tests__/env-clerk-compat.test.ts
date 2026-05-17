/*
 * BUG-46 regression test — the shared env helpers must honor both
 * BLERP_* and CLERK_* variable names. Prior to PR #53, only
 * @blerp/backend honored CLERK_*; every other consumer read
 * process.env.BLERP_* directly.
 */
import { afterEach, describe, expect, it } from "vitest";
import {
  getApiUrl,
  getPublishableKey,
  getSecretKey,
  getTenantId,
  getWebhookSecret,
} from "@blerp/shared";

const PROTECTED = [
  "BLERP_SECRET_KEY",
  "CLERK_SECRET_KEY",
  "BLERP_API_URL",
  "CLERK_API_URL",
  "BLERP_WEBHOOK_SECRET",
  "CLERK_WEBHOOK_SECRET",
  "BLERP_PUBLISHABLE_KEY",
  "CLERK_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_BLERP_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "BLERP_TENANT_ID",
  "CLERK_TENANT_ID",
  "NEXT_PUBLIC_BLERP_TENANT_ID",
  "NEXT_PUBLIC_CLERK_TENANT_ID",
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
});
