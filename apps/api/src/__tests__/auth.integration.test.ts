import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";
import { app } from "../app";
import { clearDbCache, getTenantDb } from "../db/router";
import * as schema from "../db/schema";
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

  it("BUG-49: session JWT carries org_id / org_role / org_slug / org_permissions when the user has exactly one membership", async () => {
    const email = "jwt-orgclaims@blerp.dev";
    const password = "SecurePass123!";

    // 1. Sign up
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
    await request(app)
      .patch(`/v1/users/${userId}`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId)
      .send({ password });

    // 2. Seed an organization + owner membership for this user.
    const db = await getTenantDb(tenantId);
    await db.insert(schema.projects).values({
      id: `proj_orgclaims`,
      ownerUserId: userId,
      name: "OrgClaims Project",
      slug: "orgclaims-project",
    });
    const orgId = `org_jwt_${Date.now()}`;
    await db.insert(schema.organizations).values({
      id: orgId,
      projectId: "proj_orgclaims",
      name: "JWT Claims Org",
      slug: "jwt-claims-org",
    });
    await db.insert(schema.memberships).values({
      id: `mem_jwt_${Date.now()}`,
      organizationId: orgId,
      userId,
      role: "owner",
    });

    // 3. Sign in
    const signinRes = await request(app)
      .post("/v1/auth/signins")
      .set("X-Tenant-Id", tenantId)
      .send({ identifier: email, strategy: "password" });
    const signinAttempt = await request(app)
      .post(`/v1/auth/signins/${signinRes.body.id}/attempt`)
      .set("X-Tenant-Id", tenantId)
      .send({ identifier: email, password });
    expect(signinAttempt.status).toBe(200);

    // 4. Decode the JWT payload (no verification needed — we trust the
    //    issuance path; verification covered by other tests).
    const accessToken = signinAttempt.body.tokens.access_token as string;
    const [, payloadB64] = accessToken.split(".");
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));

    expect(payload.sub).toBe(userId);
    expect(payload.sid).toBeTruthy();
    expect(payload.org_id).toBe(orgId);
    expect(payload.org_role).toBe("owner");
    expect(payload.org_slug).toBe("jwt-claims-org");
    expect(Array.isArray(payload.org_permissions)).toBe(true);
    expect(payload.org_permissions).toContain("org:write");
    expect(payload.org_permissions).toContain("members:write");
  });

  it("BUG-49 (codex-followup): session JWT omits org_* claims when the user has multiple memberships — avoids pinning an arbitrary org and breaking server-side org switching", async () => {
    const email = "jwt-multiorg@blerp.dev";
    const password = "SecurePass123!";

    // Sign up + set password
    const signupRes = await request(app)
      .post("/v1/auth/signups")
      .set("X-Tenant-Id", tenantId)
      .send({ email, strategy: "password" });
    const attemptRes = await request(app)
      .post(`/v1/auth/signups/${signupRes.body.id}/attempt`)
      .set("X-Tenant-Id", tenantId)
      .send({ code: signupRes.body.verification_code });
    const userId = attemptRes.body.userId;
    await request(app)
      .patch(`/v1/users/${userId}`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId)
      .send({ password });

    // Seed TWO memberships in different orgs (project reused from the prior
    // test — same beforeAll fixture; we only need fresh org rows).
    const db = await getTenantDb(tenantId);
    const orgA = `org_multi_a_${Date.now()}`;
    const orgB = `org_multi_b_${Date.now()}`;
    await db.insert(schema.organizations).values([
      { id: orgA, projectId: "proj_orgclaims", name: "Org A", slug: `org-a-${Date.now()}` },
      { id: orgB, projectId: "proj_orgclaims", name: "Org B", slug: `org-b-${Date.now()}` },
    ]);
    await db.insert(schema.memberships).values([
      { id: `mem_a_${Date.now()}`, organizationId: orgA, userId, role: "owner" },
      { id: `mem_b_${Date.now()}`, organizationId: orgB, userId, role: "admin" },
    ]);

    const signinRes = await request(app)
      .post("/v1/auth/signins")
      .set("X-Tenant-Id", tenantId)
      .send({ identifier: email, strategy: "password" });
    const signinAttempt = await request(app)
      .post(`/v1/auth/signins/${signinRes.body.id}/attempt`)
      .set("X-Tenant-Id", tenantId)
      .send({ identifier: email, password });
    expect(signinAttempt.status).toBe(200);

    const accessToken = signinAttempt.body.tokens.access_token as string;
    const [, payloadB64] = accessToken.split(".");
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));

    expect(payload.sub).toBe(userId);
    expect(payload.sid).toBeTruthy();
    // Multi-org users get NO org_* claims at sign-in — the
    // OrganizationSwitcher's `__blerp_org` cookie decides the active
    // org and @blerp/nextjs `auth()` resolves the role via API.
    expect(payload).not.toHaveProperty("org_id");
    expect(payload).not.toHaveProperty("org_role");
    expect(payload).not.toHaveProperty("org_slug");
    expect(payload).not.toHaveProperty("org_permissions");
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
