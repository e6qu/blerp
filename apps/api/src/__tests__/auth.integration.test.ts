import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { eq } from "drizzle-orm";
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

  it("BUG-114 / BUG-120 (codex r20/r21): password-at-signup installs both passwordDigest and hasPassword flag", async () => {
    const signupRes = await request(app)
      .post("/v1/auth/signups")
      .set("X-Tenant-Id", tenantId)
      .send({
        email: "pwsignup@blerp.dev",
        password: "supersecret123",
        strategy: "password",
      });
    expect(signupRes.status).toBe(201);
    const code = signupRes.body.verification_code;

    const attemptRes = await request(app)
      .post(`/v1/auth/signups/${signupRes.body.id}/attempt`)
      .set("X-Tenant-Id", tenantId)
      .send({ code });
    expect(attemptRes.status).toBe(200);
    expect(attemptRes.body.user_id).toBeDefined();
    expect(attemptRes.body.session).toBeDefined();
    expect(attemptRes.body.tokens).toBeDefined();

    // Subsequent sign-in with the password must succeed — proves
    // passwordDigest was installed (BUG-114) AND hasPassword was set
    // (BUG-120, otherwise list/get responses would lie about it).
    const signinRes = await request(app)
      .post("/v1/auth/signins")
      .set("X-Tenant-Id", tenantId)
      .send({ identifier: "pwsignup@blerp.dev", strategy: "password" });
    expect(signinRes.status).toBe(201);

    const signinAttemptRes = await request(app)
      .post(`/v1/auth/signins/${signinRes.body.id}/attempt`)
      .set("X-Tenant-Id", tenantId)
      .send({
        identifier: "pwsignup@blerp.dev",
        password: "supersecret123",
        strategy: "password", // factor name (Clerk convention — BUG-121)
        stage: "first_factor", // step selector (BUG-121 split)
      });
    expect(signinAttemptRes.status).toBe(200);
    expect(signinAttemptRes.body.tokens?.access_token).toBeDefined();

    // BUG-123: user GET surfaces password_enabled flag.
    const userId = attemptRes.body.user_id;
    const userRes = await request(app)
      .get(`/v1/users/${userId}`)
      .set("X-Tenant-Id", tenantId)
      .set("Authorization", `Bearer ${signinAttemptRes.body.tokens.access_token}`);
    expect(userRes.status).toBe(200);
    expect(userRes.body.password_enabled).toBe(true);
  });

  it("BUG-129 / BUG-131 (codex r24 / r25): explicit strategy:null at the second-factor step is rejected, not silently fallback-verified", async () => {
    // Provision a user with TOTP enabled by going through signup +
    // sign-in to exercise the second-factor route.
    const signupRes = await request(app)
      .post("/v1/auth/signups")
      .set("X-Tenant-Id", tenantId)
      .send({
        email: "nullstrat@blerp.dev",
        password: "supersecret123",
        strategy: "password",
      });
    await request(app)
      .post(`/v1/auth/signups/${signupRes.body.id}/attempt`)
      .set("X-Tenant-Id", tenantId)
      .send({ code: signupRes.body.verification_code });

    const userId = signupRes.body.id; // not actually used; signup returned a session

    // Enable TOTP directly in the DB so the second-factor branch fires.
    const db = await getTenantDb(tenantId);
    const emailRow = await db.query.emailAddresses.findFirst({
      where: eq(schema.emailAddresses.emailAddress, "nullstrat@blerp.dev"),
    });
    if (!emailRow) throw new Error("test setup: user not found");
    await db
      .update(schema.users)
      .set({ totpEnabled: true, totpSecret: "JBSWY3DPEHPK3PXP" })
      .where(eq(schema.users.id, emailRow.userId));

    void userId;

    const signinRes = await request(app)
      .post("/v1/auth/signins")
      .set("X-Tenant-Id", tenantId)
      .send({ identifier: "nullstrat@blerp.dev", strategy: "password" });

    // Complete the first factor → server returns needs_second_factor.
    const firstFactorRes = await request(app)
      .post(`/v1/auth/signins/${signinRes.body.id}/attempt`)
      .set("X-Tenant-Id", tenantId)
      .send({
        identifier: "nullstrat@blerp.dev",
        password: "supersecret123",
        strategy: "password",
        stage: "first_factor",
      });
    expect(firstFactorRes.body.status).toBe("needs_second_factor");

    // Now submit a second-factor attempt with strategy:null — the
    // explicit-null case BUG-131 added. Should error, not run the
    // permissive fallback.
    const explicitNullRes = await request(app)
      .post(`/v1/auth/signins/${signinRes.body.id}/attempt`)
      .set("X-Tenant-Id", tenantId)
      .send({ code: "000000", stage: "second_factor", strategy: null });
    expect(explicitNullRes.status).toBe(400);
    expect(explicitNullRes.body.error?.message).toMatch(/Unsupported second-factor strategy/);
  });

  it("BUG-119 (codex r21) / BUG-121 (codex r22): explicit stage:'first_factor' is honored even when only code is sent", async () => {
    // Create a signup and complete it so we have a user.
    const signupRes = await request(app)
      .post("/v1/auth/signups")
      .set("X-Tenant-Id", tenantId)
      .send({
        email: "strategy@blerp.dev",
        password: "supersecret456",
        strategy: "password",
      });
    await request(app)
      .post(`/v1/auth/signups/${signupRes.body.id}/attempt`)
      .set("X-Tenant-Id", tenantId)
      .send({ code: signupRes.body.verification_code });

    // Create a sign-in.
    const signinRes = await request(app)
      .post("/v1/auth/signins")
      .set("X-Tenant-Id", tenantId)
      .send({ identifier: "strategy@blerp.dev", strategy: "password" });
    const signinId = signinRes.body.id;

    // Code-only, NO identifier, but explicit first_factor stage.
    // Pre-fix the controller would have routed this to attemptSecondFactor
    // and 400'd. Now it routes to first_factor and yields a different
    // 400 (no identifier). Either way we shouldn't see "Signup attempt
    // expired" — that would indicate misrouting. BUG-121: the stage
    // field replaces the prior r21 mis-naming as `strategy`.
    const noIdentifierRes = await request(app)
      .post(`/v1/auth/signins/${signinId}/attempt`)
      .set("X-Tenant-Id", tenantId)
      .send({ code: "123456", stage: "first_factor" });
    expect(noIdentifierRes.status).toBe(400);
    expect(noIdentifierRes.body.error?.message).toMatch(/identifier is required/);
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
    expect(attemptRes.body.user_id).toBeDefined();
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
    const userId = attemptRes.body.user_id;

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
    const userId = attemptRes.body.user_id;
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
    const userId = attemptRes.body.user_id;
    await request(app)
      .patch(`/v1/users/${userId}`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId)
      .send({ password });

    // Seed TWO memberships in different orgs. Self-contained — do not
    // depend on the prior test's `proj_orgclaims` insert because
    // tests can run in isolation (codex r5 BUG-62).
    const db = await getTenantDb(tenantId);
    const projectId = `proj_multi_${Date.now()}`;
    await db.insert(schema.projects).values({
      id: projectId,
      ownerUserId: userId,
      name: "Multi-Org Project",
      slug: `multi-org-project-${Date.now()}`,
    });
    const orgA = `org_multi_a_${Date.now()}`;
    const orgB = `org_multi_b_${Date.now()}`;
    await db.insert(schema.organizations).values([
      { id: orgA, projectId, name: "Org A", slug: `org-a-${Date.now()}` },
      { id: orgB, projectId, name: "Org B", slug: `org-b-${Date.now()}` },
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
