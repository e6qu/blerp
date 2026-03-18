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

describe("RBAC Integration", () => {
  const tenantId = "rbac_test_tenant";
  const projectId = "proj_rbac_123";
  const orgId = "org_rbac_123";
  const ownerId = "user_owner";
  const memberId = "user_member";

  beforeAll(async () => {
    clearDbCache();
    const dbPath = path.resolve(process.cwd(), "tenants", `${tenantId}.db`);
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

    const db = await getTenantDb(tenantId);

    await db.insert(schema.projects).values({
      id: projectId,
      name: "RBAC Project",
      slug: "rbac-project",
      ownerUserId: ownerId,
    });

    await db.insert(schema.users).values([
      { id: ownerId, firstName: "Owner", lastName: "User" },
      { id: memberId, firstName: "Member", lastName: "User" },
    ]);

    await db.insert(schema.organizations).values({
      id: orgId,
      projectId,
      name: "RBAC Org",
      slug: "rbac-org",
    });

    await db.insert(schema.memberships).values([
      { id: "mem_owner", organizationId: orgId, userId: ownerId, role: "owner" },
      { id: "mem_member", organizationId: orgId, userId: memberId, role: "member" },
    ]);
  });

  afterAll(() => {
    clearDbCache();
    const dbPath = path.resolve(process.cwd(), "tenants", `${tenantId}.db`);
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  it("should allow owner to update organization", async () => {
    const res = await request(app)
      .patch(`/v1/organizations/${orgId}`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", ownerId)
      .send({ name: "Updated by Owner" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated by Owner");
  });

  it("should deny member from updating organization", async () => {
    const res = await request(app)
      .patch(`/v1/organizations/${orgId}`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", memberId)
      .send({ name: "Updated by Member" });

    expect(res.status).toBe(403);
    expect(res.body.error.message).toContain("Missing required permission: org:write");
  });

  it("should allow member to read organization", async () => {
    const res = await request(app)
      .get(`/v1/organizations/${orgId}`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", memberId);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(orgId);
  });
});
