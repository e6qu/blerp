import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";
import { app } from "../app";
import { clearDbCache } from "../db/router";
import fs from "node:fs";
import path from "node:path";

// Mock Redis for integration tests to avoid dependency on a running server in CI
vi.mock("../lib/redis", () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    sadd: vi.fn(),
    srem: vi.fn(),
    smembers: vi.fn().mockResolvedValue([]),
    on: vi.fn(),
  },
  isRedisAvailable: vi.fn().mockReturnValue(true),
  cache: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

describe("Auth Integration", () => {
  const tenantId = "test_auth_tenant";

  beforeAll(() => {
    clearDbCache();
    const dbPath = path.resolve(process.cwd(), "tenants", `${tenantId}.db`);
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  afterAll(() => {
    clearDbCache();
    const dbPath = path.resolve(process.cwd(), "tenants", `${tenantId}.db`);
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  it("should handle full signup flow", async () => {
    // 1. Create Signup
    const signupRes = await request(app)
      .post("/v1/auth/signups")
      .set("X-Tenant-Id", tenantId)
      .send({
        email: "test@blerp.dev",
        strategy: "password",
      });

    expect(signupRes.status).toBe(201);
    expect(signupRes.body.id).toBeDefined();
    expect(signupRes.body.status).toBe("needs_verification");
    expect(signupRes.body.verification_code).toBeDefined();

    const signupId = signupRes.body.id;
    const verificationCode = signupRes.body.verification_code;

    // 2. Attempt Verification with dynamic code
    const attemptRes = await request(app)
      .post(`/v1/auth/signups/${signupId}/attempt`)
      .set("X-Tenant-Id", tenantId)
      .send({
        code: verificationCode,
      });

    expect(attemptRes.status).toBe(200);
    expect(attemptRes.body.userId).toBeDefined();
  });

  it("should fail verification with wrong code", async () => {
    // First create a valid signup so we have a real pending entry
    const signupRes = await request(app)
      .post("/v1/auth/signups")
      .set("X-Tenant-Id", tenantId)
      .send({
        email: "wrong-code@blerp.dev",
        strategy: "password",
      });

    const signupId = signupRes.body.id;

    const attemptRes = await request(app)
      .post(`/v1/auth/signups/${signupId}/attempt`)
      .set("X-Tenant-Id", tenantId)
      .send({
        code: "wrong",
      });

    expect(attemptRes.status).toBe(400);
    expect(attemptRes.body.error.message).toBe("Invalid verification code");
  });

  it("should return JWKS", async () => {
    const res = await request(app).get("/v1/jwks").set("X-Tenant-Id", tenantId);

    expect(res.status).toBe(200);
    expect(res.body.keys).toBeDefined();
    expect(res.body.keys[0].kid).toBe("default-kid");
  });
});
