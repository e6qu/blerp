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

describe("Organization Integration", () => {
  const tenantA = "org_tenant_a";
  const tenantB = "org_tenant_b";
  const projectId = "proj_123";
  const userId = "user_123";

  beforeAll(async () => {
    clearDbCache();
    const tenantsDir = path.resolve(process.cwd(), "tenants");
    if (!fs.existsSync(tenantsDir)) fs.mkdirSync(tenantsDir, { recursive: true });

    for (const id of [tenantA, tenantB]) {
      const dbPath = path.join(tenantsDir, `${id}.db`);
      if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

      const db = await getTenantDb(id);
      await db.insert(schema.projects).values({
        id: projectId,
        name: "Test Project",
        slug: "test-project",
        ownerUserId: userId,
      });

      await db.insert(schema.users).values({
        id: userId,
        firstName: "Admin",
        lastName: "User",
      });
    }
  });

  afterAll(() => {
    clearDbCache();
    const tenantsDir = path.resolve(process.cwd(), "tenants");
    [tenantA, tenantB].forEach((id) => {
      const dbPath = path.join(tenantsDir, `${id}.db`);
      if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
    });
  });

  it("should create and isolate organizations between tenants", async () => {
    // 1. Create Org in Tenant A
    const resA = await request(app)
      .post("/v1/organizations")
      .set("X-Tenant-Id", tenantA)
      .send({ name: "Tenant A Org", slug: "org-a", project_id: projectId });

    expect(resA.status).toBe(201);
    const orgAId = resA.body.id;

    // Seed membership so we can access it with RBAC
    const dbA = await getTenantDb(tenantA);
    await dbA.insert(schema.memberships).values({
      id: "mem_a",
      organizationId: orgAId,
      userId: userId,
      role: "owner",
    });

    // 2. Create Org in Tenant B
    const resB = await request(app)
      .post("/v1/organizations")
      .set("X-Tenant-Id", tenantB)
      .send({ name: "Tenant B Org", slug: "org-b", project_id: projectId });

    expect(resB.status).toBe(201);

    // 3. List Orgs in Tenant A
    const listA = await request(app).get("/v1/organizations").set("X-Tenant-Id", tenantA);

    expect(listA.body.data).toHaveLength(1);

    // 4. Update Org A
    const updateA = await request(app)
      .patch(`/v1/organizations/${orgAId}`)
      .set("X-Tenant-Id", tenantA)
      .set("X-User-Id", userId)
      .send({ name: "Updated Org A" });

    expect(updateA.status).toBe(200);

    // 5. Delete Org A
    const deleteA = await request(app)
      .delete(`/v1/organizations/${orgAId}`)
      .set("X-Tenant-Id", tenantA)
      .set("X-User-Id", userId);

    expect(deleteA.status).toBe(204);

    // 6. Verify Org A is gone
    const listA2 = await request(app).get("/v1/organizations").set("X-Tenant-Id", tenantA);

    expect(listA2.body.data).toHaveLength(0);
  });
});
