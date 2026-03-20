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

  it("should issue JWT on signin and accept it for authenticated endpoints", async () => {
    const email = "jwt-test@blerp.dev";
    const password = "SecurePass123!";

    // 1. Signup
    const signupRes = await request(app)
      .post("/v1/auth/signups")
      .set("X-Tenant-Id", tenantId)
      .send({ email, strategy: "password" });

    expect(signupRes.status).toBe(201);

    const attemptRes = await request(app)
      .post(`/v1/auth/signups/${signupRes.body.id}/attempt`)
      .set("X-Tenant-Id", tenantId)
      .send({ code: signupRes.body.verification_code });

    expect(attemptRes.status).toBe(200);
    const userId = attemptRes.body.userId;

    // 2. Set password (via PATCH /v1/users/:user_id with X-User-Id dev fallback)
    const patchRes = await request(app)
      .patch(`/v1/users/${userId}`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId)
      .send({ password });

    expect(patchRes.status).toBe(200);

    // 3. Create signin
    const signinRes = await request(app)
      .post("/v1/auth/signins")
      .set("X-Tenant-Id", tenantId)
      .send({ identifier: email, strategy: "password" });

    expect(signinRes.status).toBe(201);

    // 4. Attempt signin with password → should get session + JWT
    const signinAttemptRes = await request(app)
      .post(`/v1/auth/signins/${signinRes.body.id}/attempt`)
      .set("X-Tenant-Id", tenantId)
      .send({ identifier: email, password });

    expect(signinAttemptRes.status).toBe(200);
    expect(signinAttemptRes.body.session).toBeDefined();
    expect(signinAttemptRes.body.tokens.access_token).toBeDefined();

    const accessToken = signinAttemptRes.body.tokens.access_token;

    // JWT should contain dots (not the old tok_ format)
    expect(accessToken).toContain(".");
    expect(accessToken).not.toMatch(/^tok_/);

    // 5. Call GET /v1/userinfo with ONLY the JWT — no X-User-Id
    const userinfoRes = await request(app)
      .get("/v1/userinfo")
      .set("X-Tenant-Id", tenantId)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(userinfoRes.status).toBe(200);
    expect(userinfoRes.body.sub).toBe(userId);
    expect(userinfoRes.body.email).toBe(email);
  });

  it("should reject invalid JWT with 401", async () => {
    const res = await request(app)
      .get("/v1/userinfo")
      .set("X-Tenant-Id", tenantId)
      .set("Authorization", "Bearer eyJhbGciOiJSUzI1NiJ9.invalid.token");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid or expired token");
  });

  it("should reject requests without any auth", async () => {
    const res = await request(app).get("/v1/userinfo").set("X-Tenant-Id", tenantId);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Authorization header is required");
  });
});
