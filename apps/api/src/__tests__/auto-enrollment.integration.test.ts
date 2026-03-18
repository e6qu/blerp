import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";
import { app } from "../app";
import { getTenantDb, clearDbCache } from "../db/router";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";
import fs from "node:fs";
import path from "node:path";

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
  cache: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

describe("Domain Auto-enrollment Integration", () => {
  const tenantId = "auto_enroll_test_tenant";
  const orgId = "org_auto_123";

  beforeAll(async () => {
    clearDbCache();
    const dbPath = path.resolve(process.cwd(), "tenants", `${tenantId}.db`);
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

    const db = await getTenantDb(tenantId);

    await db.insert(schema.projects).values({
      id: "proj_auto_123",
      name: "Auto Project",
      slug: "auto-project",
      ownerUserId: "owner_123",
    });

    await db.insert(schema.organizations).values({
      id: orgId,
      projectId: "proj_auto_123",
      name: "Enterprise Org",
      slug: "enterprise-org",
    });

    await db.insert(schema.organizationDomains).values({
      id: "dom_auto_123",
      organizationId: orgId,
      domain: "enterprise.com",
      verificationStatus: "verified",
      verificationToken: "token_123",
    });
  });

  afterAll(() => {
    clearDbCache();
    const dbPath = path.resolve(process.cwd(), "tenants", `${tenantId}.db`);
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  it("should automatically enroll user in organization with verified domain", async () => {
    // 1. Create Signup (Mocked)
    const signup = await request(app)
      .post("/v1/auth/signups")
      .set("X-Tenant-Id", tenantId)
      .send({ email: "user@enterprise.com", strategy: "email_code" });

    expect(signup.status).toBe(201);
    const signupId = signup.body.id;

    // 2. Attempt Signup (Verify)
    const result = await request(app)
      .post(`/v1/auth/signups/${signupId}/attempt`)
      .set("X-Tenant-Id", tenantId)
      .send({ code: "123456", email: "user@enterprise.com" });

    expect(result.status).toBe(200);
    const userId = result.body.userId;

    // 3. Verify Membership
    const db = await getTenantDb(tenantId);
    const membership = await db.query.memberships.findFirst({
      where: eq(schema.memberships.userId, userId),
    });

    expect(membership).toBeDefined();
    expect(membership?.organizationId).toBe(orgId);
    expect(membership?.role).toBe("member");
  });

  it("should NOT enroll user if domain is not verified", async () => {
    const signup = await request(app)
      .post("/v1/auth/signups")
      .set("X-Tenant-Id", tenantId)
      .send({ email: "user@unverified.com", strategy: "email_code" });

    const signupId = signup.body.id;

    const result = await request(app)
      .post(`/v1/auth/signups/${signupId}/attempt`)
      .set("X-Tenant-Id", tenantId)
      .send({ code: "123456", email: "user@unverified.com" });

    const userId = result.body.userId;

    const db = await getTenantDb(tenantId);
    const membership = await db.query.memberships.findFirst({
      where: eq(schema.memberships.userId, userId),
    });

    expect(membership).toBeUndefined();
  });
});
