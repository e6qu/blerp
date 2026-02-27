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

describe("Users Integration", () => {
  const tenantId = "user_test_tenant";
  const userId1 = "user_1";
  const userId2 = "user_2";

  beforeAll(async () => {
    clearDbCache();
    const dbPath = path.resolve(process.cwd(), "tenants", `${tenantId}.db`);
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

    const db = await getTenantDb(tenantId);

    await db.insert(schema.users).values([
      {
        id: userId1,
        firstName: "User",
        lastName: "One",
        privateMetadata: { monite_user_id: "mu_1" },
      },
      {
        id: userId2,
        firstName: "User",
        lastName: "Two",
        publicMetadata: { role: "manager", settings: { theme: "light" } },
      },
    ]);
  });

  afterAll(() => {
    clearDbCache();
    const dbPath = path.resolve(process.cwd(), "tenants", `${tenantId}.db`);
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  it("should list all users with correct metadata mapping", async () => {
    const res = await request(app)
      .get("/v1/users")
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId1);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    const user2 = res.body.data.find((u: { id: string }) => u.id === userId2);
    expect(user2.metadata_public).toEqual({ role: "manager", settings: { theme: "light" } });
  });

  it("should filter users by private metadata", async () => {
    const res = await request(app)
      .get("/v1/users")
      .query({ metadata_key: "monite_user_id", metadata_value: "mu_1" })
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId1);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe(userId1);
    expect(res.body.data[0].metadata_private).toEqual({ monite_user_id: "mu_1" });
  });

  it("should filter users by public metadata", async () => {
    const res = await request(app)
      .get("/v1/users")
      .query({ metadata_key: "role", metadata_value: "manager" })
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId1);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe(userId2);
  });

  it("should filter users by nested metadata (dot notation)", async () => {
    const res = await request(app)
      .get("/v1/users")
      .query({ metadata_key: "settings.theme", metadata_value: "light" })
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId1);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe(userId2);
  });

  it("should return empty list if no match", async () => {
    const res = await request(app)
      .get("/v1/users")
      .query({ metadata_key: "non_existent", metadata_value: "value" })
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId1);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});
