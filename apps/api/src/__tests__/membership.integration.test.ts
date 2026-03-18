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

describe("Membership & Invitation Integration", () => {
  const tenantId = "mem_test_tenant";
  const projectId = "proj_mem_123";
  const orgId = "org_mem_123";
  const userId = "user_mem_123";
  const otherUserId = "user_other_123";

  beforeAll(async () => {
    clearDbCache();
    const dbPath = path.resolve(process.cwd(), "tenants", `${tenantId}.db`);
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

    const db = await getTenantDb(tenantId);

    await db.insert(schema.projects).values({
      id: projectId,
      name: "Mem Project",
      slug: "mem-project",
      ownerUserId: userId,
    });

    await db.insert(schema.users).values([
      { id: userId, firstName: "Test", lastName: "User" },
      { id: otherUserId, firstName: "Other", lastName: "User" },
    ]);

    await db.insert(schema.organizations).values({
      id: orgId,
      projectId,
      name: "Mem Org",
      slug: "mem-org",
    });

    // Seed initial membership for the actor
    await db.insert(schema.memberships).values({
      id: "mem_initial",
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

  it("should manage memberships", async () => {
    // 1. Create Membership
    const res = await request(app)
      .post(`/v1/organizations/${orgId}/memberships`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId)
      .send({ user_id: otherUserId, role: "admin" });

    expect(res.status).toBe(201);
    const memId = res.body.id;

    // 2. List Memberships
    const list = await request(app)
      .get(`/v1/organizations/${orgId}/memberships`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId);

    expect(list.body.data).toHaveLength(2); // Initial owner + newly created admin

    // 3. Update Membership
    const update = await request(app)
      .patch(`/v1/organizations/${orgId}/memberships/${memId}`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId)
      .send({ role: "owner" });

    expect(update.status).toBe(200);
    expect(update.body.role).toBe("owner");

    // 4. Delete Membership
    const del = await request(app)
      .delete(`/v1/organizations/${orgId}/memberships/${memId}`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId);

    expect(del.status).toBe(204);
  });

  it("should manage invitations", async () => {
    // 1. Create Invitation
    const res = await request(app)
      .post(`/v1/organizations/${orgId}/invitations`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId)
      .send({ email_address: "invite@example.com", role: "member" });

    expect(res.status).toBe(201);
    const invId = res.body.id;

    // 2. List Invitations
    const list = await request(app)
      .get(`/v1/organizations/${orgId}/invitations`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId);

    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0].id).toBe(invId);

    // 3. Revoke Invitation
    const revoke = await request(app)
      .post(`/v1/organizations/${orgId}/invitations/${invId}/revoke`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId);

    expect(revoke.status).toBe(200);
    expect(revoke.body.status).toBe("revoked");
  });
});
