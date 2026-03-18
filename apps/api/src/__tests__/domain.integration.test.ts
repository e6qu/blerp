import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";
import { app } from "../app";
import { getTenantDb, clearDbCache } from "../db/router";
import * as schema from "../db/schema";
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

describe("Domain Integration", () => {
  const tenantId = "dom_test_tenant";
  const orgId = "org_dom_123";
  const userId = "user_dom_123";

  beforeAll(async () => {
    clearDbCache();
    const dbPath = path.resolve(process.cwd(), "tenants", `${tenantId}.db`);
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

    const db = await getTenantDb(tenantId);

    await db.insert(schema.projects).values({
      id: "proj_dom_123",
      name: "Dom Project",
      slug: "dom-project",
      ownerUserId: userId,
    });

    await db.insert(schema.users).values({
      id: userId,
      firstName: "Test",
      lastName: "User",
    });

    await db.insert(schema.organizations).values({
      id: orgId,
      projectId: "proj_dom_123",
      name: "Dom Org",
      slug: "dom-org",
    });

    await db.insert(schema.memberships).values({
      id: "mem_dom",
      organizationId: orgId,
      userId: userId,
      role: "owner",
    });
  });

  afterAll(() => {
    clearDbCache();
    const dbPath = path.resolve(process.cwd(), "tenants", `${tenantId}.db`);
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  it("should manage organization domains", async () => {
    // 1. Add Domain
    const res = await request(app)
      .post(`/v1/organizations/${orgId}/domains`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId)
      .send({ domain: "example.com" });

    expect(res.status).toBe(201);
    expect(res.body.domain).toBe("example.com");
    const domId = res.body.id;

    // 2. List Domains
    const list = await request(app)
      .get(`/v1/organizations/${orgId}/domains`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId);

    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0].id).toBe(domId);

    // 3. Verify Domain
    const verify = await request(app)
      .post(`/v1/organizations/${orgId}/domains/${domId}/verify`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId);

    expect(verify.status).toBe(200);
    expect(verify.body.verification_status).toBe("verified");

    // 4. Delete Domain
    const del = await request(app)
      .delete(`/v1/organizations/${orgId}/domains/${domId}`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId);

    expect(del.status).toBe(204);

    // 5. Verify it's gone
    const listFinal = await request(app)
      .get(`/v1/organizations/${orgId}/domains`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId);

    expect(listFinal.body.data).toHaveLength(0);
  });
});
