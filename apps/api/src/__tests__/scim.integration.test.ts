import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";
import { app } from "../app";
import { clearDbCache } from "../db/router";
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

describe("SCIM Integration", () => {
  const tenantId = "scim_test_tenant";

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

  it("should provision users via SCIM", async () => {
    // 1. Create User
    const res = await request(app)
      .post("/scim/v2/Users")
      .set("X-Tenant-Id", tenantId)
      .send({
        schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
        userName: "scim_user@example.com",
        name: { givenName: "SCIM", familyName: "User" },
        emails: [{ value: "scim_user@example.com", type: "work", primary: true }],
        active: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.userName).toBe("scim_user@example.com");
    expect(res.body.name.givenName).toBe("SCIM");
    const userId = res.body.id;

    // 2. Get User
    const getRes = await request(app).get(`/scim/v2/Users/${userId}`).set("X-Tenant-Id", tenantId);

    expect(getRes.status).toBe(200);
    expect(getRes.body.id).toBe(userId);

    // 3. List Users
    const listRes = await request(app).get("/scim/v2/Users").set("X-Tenant-Id", tenantId);

    expect(listRes.body.totalResults).toBe(1);
    expect(listRes.body.Resources).toHaveLength(1);

    // 4. Delete User
    const delRes = await request(app)
      .delete(`/scim/v2/Users/${userId}`)
      .set("X-Tenant-Id", tenantId);

    expect(delRes.status).toBe(204);
  });
});
