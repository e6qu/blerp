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

describe("WebAuthn passkeys integration", () => {
  const tenantId = "pk_test_tenant";
  const userId = "user_pk_1";
  const passkeyId = "pk_existing_1";

  beforeAll(async () => {
    clearDbCache();
    const dbPath = path.resolve(process.cwd(), "tenants", `${tenantId}.db`);
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

    const db = await getTenantDb(tenantId);
    await db.insert(schema.users).values({
      id: userId,
      firstName: "Pass",
      lastName: "Key",
    });
    await db.insert(schema.passkeys).values({
      id: passkeyId,
      userId,
      name: "Original Name",
      publicKey: "SHOULD_NEVER_LEAK_PUBLIC_KEY",
      credentialId: "SHOULD_NEVER_LEAK_CREDENTIAL_ID",
      counter: 7,
    });
  });

  afterAll(() => {
    clearDbCache();
    const dbPath = path.resolve(process.cwd(), "tenants", `${tenantId}.db`);
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  it("GET /v1/auth/webauthn/passkeys returns the snake_case PasskeyCredential shape and never leaks credential material", async () => {
    const res = await request(app)
      .get("/v1/auth/webauthn/passkeys")
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);

    const pk = res.body.data[0];
    // Required OpenAPI fields are present and correctly mapped from `name` to `friendly_name`.
    expect(pk.id).toBe(passkeyId);
    expect(pk.friendly_name).toBe("Original Name");
    expect(Array.isArray(pk.transports)).toBe(true);
    // created_at / last_used_at are snake_case timestamps (nullable until first use).
    expect(Object.prototype.hasOwnProperty.call(pk, "created_at")).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(pk, "last_used_at")).toBe(true);

    // Credential material must not be returned over the wire.
    expect(pk).not.toHaveProperty("publicKey");
    expect(pk).not.toHaveProperty("public_key");
    expect(pk).not.toHaveProperty("counter");
    expect(pk).not.toHaveProperty("credentialId");
    expect(pk).not.toHaveProperty("credential_id");
    expect(pk).not.toHaveProperty("userId");
    expect(pk).not.toHaveProperty("user_id");

    // Sanity: the raw DB values that should have leaked under the old behavior are not anywhere in the body.
    const serialized = JSON.stringify(res.body);
    expect(serialized).not.toContain("SHOULD_NEVER_LEAK_PUBLIC_KEY");
    expect(serialized).not.toContain("SHOULD_NEVER_LEAK_CREDENTIAL_ID");
  });

  it("PATCH /v1/auth/webauthn/passkeys/{id} updates the friendly_name and returns the mapped shape", async () => {
    const res = await request(app)
      .patch(`/v1/auth/webauthn/passkeys/${passkeyId}`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId)
      .send({ name: "Renamed Key" });

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(passkeyId);
    expect(res.body.friendly_name).toBe("Renamed Key");
    expect(res.body).not.toHaveProperty("publicKey");
    expect(res.body).not.toHaveProperty("credentialId");
  });

  it("PATCH /v1/auth/webauthn/passkeys/{id} rejects mutation by a different user with 404", async () => {
    // Contract: OpenAPI documents 404 for missing/non-owned passkey. The
    // service throws Error("Passkey not found") which the controller must
    // map to 404 (BUG-41 — was previously 400 because the generic catch
    // downgraded the error code).
    const res = await request(app)
      .patch(`/v1/auth/webauthn/passkeys/${passkeyId}`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", "user_other")
      .send({ name: "Hijack" });

    expect(res.status).toBe(404);
    expect(res.body.error?.message).toMatch(/passkey not found/i);
  });

  it("PATCH /v1/auth/webauthn/passkeys/{id} returns 404 for a non-existent passkey", async () => {
    const res = await request(app)
      .patch("/v1/auth/webauthn/passkeys/pk_does_not_exist")
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId)
      .send({ name: "Anything" });

    expect(res.status).toBe(404);
    expect(res.body.error?.message).toMatch(/passkey not found/i);
  });

  it("DELETE /v1/auth/webauthn/passkeys/{id} returns 404 for a non-existent passkey", async () => {
    const res = await request(app)
      .delete("/v1/auth/webauthn/passkeys/pk_does_not_exist")
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId);

    expect(res.status).toBe(404);
  });

  it("DELETE /v1/auth/webauthn/passkeys/{id} removes the passkey", async () => {
    const res = await request(app)
      .delete(`/v1/auth/webauthn/passkeys/${passkeyId}`)
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId);

    expect(res.status).toBe(204);

    const after = await request(app)
      .get("/v1/auth/webauthn/passkeys")
      .set("X-Tenant-Id", tenantId)
      .set("X-User-Id", userId);
    expect(after.body.data).toHaveLength(0);
  });
});
