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

describe("Metadata Integration", () => {
  const tenantId = "meta_test_tenant";
  const orgId = "org_meta_123";
  const userId = "user_meta_123";

  beforeAll(async () => {
    clearDbCache();
    const dbPath = path.resolve(process.cwd(), "tenants", `${tenantId}.db`);
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

    const db = await getTenantDb(tenantId);

    await db.insert(schema.projects).values({
      id: "proj_meta_123",
      name: "Meta Project",
      slug: "meta-project",
      ownerUserId: userId,
    });

    await db.insert(schema.users).values({
      id: userId,
      firstName: "Meta",
      lastName: "User",
    });

    await db.insert(schema.organizations).values({
      id: orgId,
      projectId: "proj_meta_123",
      name: "Meta Org",
      slug: "meta-org",
    });

    await db.insert(schema.memberships).values({
      id: "mem_meta",
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

  it("should update organization metadata", async () => {
    const res = await request(app)
      .patch(`/v1/organizations/${orgId}/metadata`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId)
      .send({
        private_metadata: { entity_id: "monite_123" },
        public_metadata: { plan: "enterprise" },
      });

    expect(res.status).toBe(200);
    expect(res.body.private_metadata).toEqual({ entity_id: "monite_123" });
    expect(res.body.public_metadata).toEqual({ plan: "enterprise" });
  });

  it("should update user metadata", async () => {
    const res = await request(app)
      .patch(`/v1/users/${userId}/metadata`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId)
      .send({
        private_metadata: { monite_user_id: "mu_123" },
        unsafe_metadata: { theme: "dark" },
      });

    expect(res.status).toBe(200);
    expect(res.body.private_metadata).toEqual({ monite_user_id: "mu_123" });
    expect(res.body.unsafe_metadata).toEqual({ theme: "dark" });
  });

  it("should perform deep merge on user metadata", async () => {
    await request(app)
      .patch(`/v1/users/${userId}/metadata`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId)
      .send({
        private_metadata: {
          entities: {
            org_1: { entity_user_id: "eu_1", organization_id: "o1" },
          },
        },
      });

    const res = await request(app)
      .patch(`/v1/users/${userId}/metadata`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId)
      .send({
        private_metadata: {
          entities: {
            org_2: { entity_user_id: "eu_2", organization_id: "o2" },
          },
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.private_metadata.entities).toEqual({
      org_1: { entity_user_id: "eu_1", organization_id: "o1" },
      org_2: { entity_user_id: "eu_2", organization_id: "o2" },
    });
  });

  it("should reject malformed entities metadata", async () => {
    const res = await request(app)
      .patch(`/v1/users/${userId}/metadata`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId)
      .send({
        private_metadata: {
          entities: {
            org_1: { entity_user_id: "eu_1" }, // missing organization_id
          },
        },
      });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/must have a string organization_id/);
  });
});
