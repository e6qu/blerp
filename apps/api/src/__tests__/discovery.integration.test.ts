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
  cache: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

describe("Domain Discovery Integration", () => {
  const tenantId = "discovery_test_tenant";
  const orgId = "org_discover_123";

  beforeAll(async () => {
    clearDbCache();
    const dbPath = path.resolve(process.cwd(), "tenants", `${tenantId}.db`);
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

    const db = await getTenantDb(tenantId);

    await db.insert(schema.projects).values({
      id: "proj_discover_123",
      name: "Discovery Project",
      slug: "discovery-project",
      ownerUserId: "owner_123",
    });

    await db.insert(schema.organizations).values({
      id: orgId,
      projectId: "proj_discover_123",
      name: "Target Org",
      slug: "target-org",
    });

    await db.insert(schema.organizationDomains).values({
      id: "dom_discover_123",
      organizationId: orgId,
      domain: "target.com",
      verificationStatus: "verified",
      verificationToken: "token_123",
    });
  });

  afterAll(() => {
    clearDbCache();
    const dbPath = path.resolve(process.cwd(), "tenants", `${tenantId}.db`);
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  it("should discover organization by domain", async () => {
    const res = await request(app)
      .get("/v1/organizations")
      .query({ domain: "target.com" })
      .set("X-Tenant-Id", tenantId);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe(orgId);
  });

  it("should return empty list for unverified domain discovery", async () => {
    // Add unverified domain
    const db = await getTenantDb(tenantId);
    await db.insert(schema.organizationDomains).values({
      id: "dom_unverified_123",
      organizationId: orgId,
      domain: "unverified.com",
      verificationStatus: "unverified",
      verificationToken: "token_unverified",
    });

    const res = await request(app)
      .get("/v1/organizations")
      .query({ domain: "unverified.com" })
      .set("X-Tenant-Id", tenantId);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});
