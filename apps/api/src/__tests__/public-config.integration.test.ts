/*
 * BUG-96 regression — `/v1/public-config` is the runtime escape-hatch
 * for Next.js's build-time `NEXT_PUBLIC_*` env-var inlining (and Vite's
 * `VITE_*` equivalent). The endpoint must:
 *   - Read env at request time (not module-load time) so values change
 *     across a single image deployed in multiple environments.
 *   - Return only public values — never secrets.
 *   - Honor the same CLERK_ / BLERP_ / NEXT_PUBLIC_ / VITE_ aliases as
 *     the shared env helpers.
 *   - Be reachable without any auth header (Clerk-parity public).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import { app } from "../app";

vi.mock("../lib/redis", () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    sadd: vi.fn(),
    srem: vi.fn(),
    smembers: vi.fn().mockResolvedValue([]),
    on: vi.fn(),
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn(),
  },
  isRedisAvailable: vi.fn().mockReturnValue(true),
  cache: { get: vi.fn(), set: vi.fn(), del: vi.fn() },
}));

const PROTECTED = [
  "BLERP_PUBLISHABLE_KEY",
  "CLERK_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_BLERP_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "BLERP_TENANT_ID",
  "CLERK_TENANT_ID",
  "BLERP_SIGN_IN_URL",
  "CLERK_SIGN_IN_URL",
  "BLERP_SIGN_UP_URL",
  "CLERK_SIGN_UP_URL",
  "CLERK_SIGN_IN_FORCE_REDIRECT_URL",
  "CLERK_SIGN_UP_FALLBACK_REDIRECT_URL",
  "CLERK_PROXY_URL",
  "CLERK_TELEMETRY_DISABLED",
] as const;

describe("/v1/public-config (BUG-96)", () => {
  const saved: Record<string, string | undefined> = {};
  beforeEach(() => {
    for (const k of PROTECTED) {
      saved[k] = process.env[k];
      delete process.env[k];
    }
  });
  afterEach(() => {
    for (const k of PROTECTED) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  });

  it("returns defaults when no env vars are set, with no auth required", async () => {
    const res = await request(app).get("/v1/public-config");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      publishable_key: null,
      tenant_id: "demo-tenant",
      sign_in_url: "/sign-in",
      sign_up_url: "/sign-up",
      sign_in_force_redirect_url: null,
      sign_in_fallback_redirect_url: "/",
      sign_up_force_redirect_url: null,
      sign_up_fallback_redirect_url: "/",
      proxy_url: null,
      telemetry_disabled: false,
    });
  });

  it("reads env at request time so values change between requests", async () => {
    const first = await request(app).get("/v1/public-config");
    expect(first.body.tenant_id).toBe("demo-tenant");

    process.env.CLERK_TENANT_ID = "tenant_runtime";
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_runtime";
    process.env.CLERK_SIGN_IN_URL = "/login";
    process.env.CLERK_SIGN_IN_FORCE_REDIRECT_URL = "/dashboard";
    process.env.CLERK_TELEMETRY_DISABLED = "true";

    const second = await request(app).get("/v1/public-config");
    expect(second.body.tenant_id).toBe("tenant_runtime");
    expect(second.body.publishable_key).toBe("pk_runtime");
    expect(second.body.sign_in_url).toBe("/login");
    expect(second.body.sign_in_force_redirect_url).toBe("/dashboard");
    expect(second.body.telemetry_disabled).toBe(true);
  });

  it("never leaks secret values even if accidentally set in env", async () => {
    process.env.BLERP_SECRET_KEY = "sk_should_never_appear";
    process.env.CLERK_WEBHOOK_SECRET = "whsec_should_never_appear";
    process.env.CLERK_ENCRYPTION_KEY = "enc_should_never_appear";
    const res = await request(app).get("/v1/public-config");
    expect(res.status).toBe(200);
    const body = JSON.stringify(res.body);
    expect(body).not.toContain("sk_should_never_appear");
    expect(body).not.toContain("whsec_should_never_appear");
    expect(body).not.toContain("enc_should_never_appear");
    delete process.env.BLERP_SECRET_KEY;
    delete process.env.CLERK_WEBHOOK_SECRET;
    delete process.env.CLERK_ENCRYPTION_KEY;
  });

  it("emits a short-cache header so live env changes propagate within ~60s", async () => {
    const res = await request(app).get("/v1/public-config");
    expect(res.status).toBe(200);
    expect(res.headers["cache-control"]).toMatch(/max-age=60.*must-revalidate/);
  });
});
