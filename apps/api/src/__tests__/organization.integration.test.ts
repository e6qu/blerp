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
      .set("X-User-Id", userId) // BUG-167: auth required
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
      .set("X-User-Id", userId) // BUG-167: auth required
      .send({ name: "Tenant B Org", slug: "org-b", project_id: projectId });

    expect(resB.status).toBe(201);

    // 3. List Orgs in Tenant A — BUG-167: auth + project_id required.
    const listA = await request(app)
      .get("/v1/organizations")
      .query({ project_id: projectId })
      .set("X-Tenant-Id", tenantA)
      .set("X-User-Id", userId);

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

    // 6. Verify Org A is gone — BUG-167: auth required.
    const listA2 = await request(app)
      .get("/v1/organizations")
      .set("X-Tenant-Id", tenantA)
      .set("X-User-Id", userId);

    expect(listA2.body.data).toHaveLength(0);

    // 7. DELETE again returns 403, not 404 — RBAC requires a membership
    // row pointing at this org for `org:write`, and that row was cascaded
    // away with the org. The OpenAPI contract documents 403 for both the
    // "missing org" and "not permitted" cases (BUG-42: previous 204
    // unconditional success now correctly surfaces the permission failure).
    const deleteMissing = await request(app)
      .delete(`/v1/organizations/${orgAId}`)
      .set("X-Tenant-Id", tenantA)
      .set("X-User-Id", userId);

    expect(deleteMissing.status).toBe(403);
  });

  it("BUG-178 (codex r48): GET /v1/organizations without project_id scopes to caller's accessible orgs, not the whole tenant", async () => {
    const tenant = "org_tenant_bug178";
    const projectA = "proj_bug178_a";
    const projectB = "proj_bug178_b";
    const userA = "user_bug178_a";
    const userB = "user_bug178_b";

    clearDbCache();
    const tenantsDir = path.resolve(process.cwd(), "tenants");
    if (!fs.existsSync(tenantsDir)) fs.mkdirSync(tenantsDir, { recursive: true });
    const dbPath = path.join(tenantsDir, `${tenant}.db`);
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

    const db = await getTenantDb(tenant);
    await db.insert(schema.projects).values([
      { id: projectA, name: "Project A", slug: "proj-a", ownerUserId: userA },
      { id: projectB, name: "Project B", slug: "proj-b", ownerUserId: userB },
    ]);
    await db.insert(schema.users).values([
      { id: userA, firstName: "Alpha", lastName: "User" },
      { id: userB, firstName: "Beta", lastName: "User" },
    ]);

    const orgA1Res = await request(app)
      .post("/v1/organizations")
      .set("X-Tenant-Id", tenant)
      .set("X-User-Id", userA)
      .send({ name: "Org A1", slug: "org-a1", project_id: projectA });
    expect(orgA1Res.status).toBe(201);
    const orgA1Id = orgA1Res.body.id;
    await db.insert(schema.memberships).values({
      id: "mem_bug178_a1",
      organizationId: orgA1Id,
      userId: userA,
      role: "owner",
    });

    const orgB1Res = await request(app)
      .post("/v1/organizations")
      .set("X-Tenant-Id", tenant)
      .set("X-User-Id", userB)
      .send({ name: "Org B1", slug: "org-b1", project_id: projectB });
    expect(orgB1Res.status).toBe(201);
    await db.insert(schema.memberships).values({
      id: "mem_bug178_b1",
      organizationId: orgB1Res.body.id,
      userId: userB,
      role: "owner",
    });

    const orgB2Res = await request(app)
      .post("/v1/organizations")
      .set("X-Tenant-Id", tenant)
      .set("X-User-Id", userB)
      .send({ name: "Org B2", slug: "org-b2", project_id: projectB });
    expect(orgB2Res.status).toBe(201);

    // User A lists without project_id. Pre-BUG-178 the dev-shim
    // wildcard returned all three; the fix scopes by accessible-orgs
    // (membership ∪ owned-project orgs). User A should see only Org A1,
    // not the two Project-B orgs they have no relationship to.
    const listAsA = await request(app)
      .get("/v1/organizations")
      .set("X-Tenant-Id", tenant)
      .set("X-User-Id", userA);
    expect(listAsA.status).toBe(200);
    expect(listAsA.body.data).toHaveLength(1);
    expect(listAsA.body.data[0].id).toBe(orgA1Id);
    expect(listAsA.body.total_count).toBe(1);

    // Sanity: user B sees only their two orgs (Org B1 via membership,
    // Org B2 via project-ownership of Project B), not Org A1.
    const listAsB = await request(app)
      .get("/v1/organizations")
      .set("X-Tenant-Id", tenant)
      .set("X-User-Id", userB);
    expect(listAsB.status).toBe(200);
    expect(listAsB.body.data).toHaveLength(2);
    const idsForB = listAsB.body.data.map((o: { id: string }) => o.id).sort();
    expect(idsForB).toEqual([orgB1Res.body.id, orgB2Res.body.id].sort());

    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });
});
