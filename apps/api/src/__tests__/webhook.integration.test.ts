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
  isRedisAvailable: vi.fn().mockReturnValue(true),
  cache: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

describe("Webhook Integration", () => {
  const tenantId = "wh_test_tenant";
  const userId = "user_wh_123";

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

  it("should manage webhook endpoints", async () => {
    // 1. Create Webhook
    const res = await request(app)
      .post("/v1/webhooks/endpoints")
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId)
      .send({ url: "https://example.com/webhook", event_types: ["user.created"] });

    expect(res.status).toBe(201);
    expect(res.body.url).toBe("https://example.com/webhook");
    expect(res.body.secret).toBeDefined();
    const whId = res.body.id;

    // 2. List Webhooks
    const list = await request(app)
      .get("/v1/webhooks/endpoints")
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId);

    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0].id).toBe(whId);

    // 3. Update Webhook
    const update = await request(app)
      .patch(`/v1/webhooks/endpoints/${whId}`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId)
      .send({ enabled: false });

    expect(update.status).toBe(200);
    expect(update.body.status).toBe("paused");

    // 4. Delete Webhook
    const del = await request(app)
      .delete(`/v1/webhooks/endpoints/${whId}`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId);

    expect(del.status).toBe(204);
  });
});
