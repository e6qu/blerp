/*
 * Integration tests for the 13 controllers that had zero coverage prior to
 * BUG-38 (skills audit 2026-05-17). Each suite exercises the highest-signal
 * path through one controller and asserts the wire-shape contract (snake_case
 * fields, status codes, auth envelope). Where a controller talks to an
 * external service (OAuth IdP, SMS, filesystem), the test exercises the
 * input-validation / first-failure path so we still catch contract drift
 * without standing up the external dependency.
 */
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

const tenantId = "ctrl_audit_tenant";
const userId = "user_ctrl_audit";
const otherUserId = "user_ctrl_audit_other";
const orgId = "org_ctrl_audit";

const headers = (uid: string = userId) => ({
  "X-Tenant-Id": tenantId,
  "X-User-Id": uid,
});

beforeAll(async () => {
  clearDbCache();
  const dbPath = path.resolve(process.cwd(), "tenants", `${tenantId}.db`);
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

  const db = await getTenantDb(tenantId);
  await db.insert(schema.projects).values({
    id: "proj_ctrl_audit",
    ownerUserId: userId,
    name: "Audit Project",
    slug: "audit-project",
  });
  await db.insert(schema.users).values([
    { id: userId, firstName: "Aud", lastName: "User" },
    { id: otherUserId, firstName: "Other", lastName: "User" },
  ]);
  await db.insert(schema.organizations).values({
    id: orgId,
    projectId: "proj_ctrl_audit",
    name: "Audit Org",
    slug: "audit-org",
  });
  // Membership so RBAC-gated routes (org metadata, custom roles, etc.)
  // admit the user. Must be `owner` because `admin` doesn't include
  // `org:write` (see ROLE_PERMISSIONS in apps/api/src/lib/rbac.ts).
  await db.insert(schema.memberships).values({
    id: "mem_ctrl_audit",
    organizationId: orgId,
    userId,
    role: "owner",
  });
});

afterAll(() => {
  clearDbCache();
  const dbPath = path.resolve(process.cwd(), "tenants", `${tenantId}.db`);
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
});

// -----------------------------------------------------------------------------
// quota.controller — GET /v1/usage
// -----------------------------------------------------------------------------
describe("quota controller", () => {
  it("GET /v1/usage returns the UsageResponse shape with users / organizations / sessions / limits", async () => {
    const res = await request(app).get("/v1/usage").set(headers());
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("users");
    expect(res.body).toHaveProperty("organizations");
    expect(res.body).toHaveProperty("sessions");
    expect(res.body).toHaveProperty("limits");
  });
});

// -----------------------------------------------------------------------------
// audit.controller — GET /v1/audit_logs
// -----------------------------------------------------------------------------
describe("audit controller", () => {
  it("GET /v1/audit_logs returns Clerk-shaped { data, total_count } plus legacy meta.total alias", async () => {
    const res = await request(app).get("/v1/audit_logs").set(headers());
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    // BUG-48: total_count is the canonical Clerk-compat field; meta.total
    // is the legacy alias kept for one release.
    expect(typeof res.body.total_count).toBe("number");
    expect(res.body.total_count).toBe(res.body.meta.total);
  });

  it("honours limit + offset query params", async () => {
    const res = await request(app).get("/v1/audit_logs?limit=5&offset=0").set(headers());
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
  });

  it("BUG-183 (codex r49): AuditLogService.create persists project_id; list filter returns only matching rows", async () => {
    // Direct service test — exercises the BUG-161 list filter against
    // rows the worker would persist. Pre-BUG-183 the column existed
    // but no writer populated it, so a project-scoped query returned
    // an empty list even after events fired.
    const { getTenantDb } = await import("../db/router");
    const { AuditLogService } = await import("../v1/services/audit.service");
    const db = await getTenantDb(tenantId);
    const service = new AuditLogService(db);

    const projectA = `proj_bug183_a_${Date.now()}`;
    const projectB = `proj_bug183_b_${Date.now()}`;
    const rowA = await service.create({
      action: "organization.created",
      actor: { type: "system" },
      projectId: projectA,
    });
    const rowB = await service.create({
      action: "organization.created",
      actor: { type: "system" },
      projectId: projectB,
    });
    const rowNull = await service.create({
      action: "session.created",
      actor: { type: "system" },
    });

    const listA = await service.list({ projectId: projectA });
    const idsA = listA.data.map((r) => r.id);
    expect(idsA).toContain(rowA);
    expect(idsA).not.toContain(rowB);
    expect(idsA).not.toContain(rowNull);

    const listB = await service.list({ projectId: projectB });
    const idsB = listB.data.map((r) => r.id);
    expect(idsB).toContain(rowB);
    expect(idsB).not.toContain(rowA);
    expect(idsB).not.toContain(rowNull);

    // Tenant-root caller (no projectId filter) sees all three.
    const listAll = await service.list({});
    const idsAll = listAll.data.map((r) => r.id);
    expect(idsAll).toContain(rowA);
    expect(idsAll).toContain(rowB);
    expect(idsAll).toContain(rowNull);
  });
});

// -----------------------------------------------------------------------------
// redirect.controller — /v1/redirect-urls
// -----------------------------------------------------------------------------
describe("redirect controller", () => {
  let createdId: string;

  it("POST /v1/redirect-urls creates a redirect URL", async () => {
    const res = await request(app)
      .post("/v1/redirect-urls")
      .set(headers())
      .send({ url: "https://example.com/cb", type: "web" });
    expect(res.status).toBe(201);
    expect(res.body.url).toBe("https://example.com/cb");
    createdId = res.body.id;
    expect(createdId).toBeTruthy();
  });

  it("POST without url returns 400", async () => {
    const res = await request(app).post("/v1/redirect-urls").set(headers()).send({});
    expect(res.status).toBe(400);
  });

  it("GET /v1/redirect-urls lists what was created", async () => {
    const res = await request(app).get("/v1/redirect-urls").set(headers());
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((r: { id: string }) => r.id === createdId)).toBe(true);
  });

  it("DELETE /v1/redirect-urls/:id 204s on success and 404 on missing", async () => {
    const del = await request(app).delete(`/v1/redirect-urls/${createdId}`).set(headers());
    expect(del.status).toBe(204);

    const missing = await request(app).delete("/v1/redirect-urls/does_not_exist").set(headers());
    expect(missing.status).toBe(404);
  });
});

// -----------------------------------------------------------------------------
// restriction.controller — /v1/signup-restrictions
// -----------------------------------------------------------------------------
describe("restriction controller", () => {
  let restrictionId: string;

  it("POST /v1/signup-restrictions creates and returns the row", async () => {
    const res = await request(app)
      .post("/v1/signup-restrictions")
      .set(headers())
      .send({ type: "blocklist", identifier_type: "domain", value: "spam.example" });
    expect(res.status).toBe(201);
    expect(res.body.value).toBe("spam.example");
    restrictionId = res.body.id;
  });

  it("POST with invalid type returns 400", async () => {
    const res = await request(app)
      .post("/v1/signup-restrictions")
      .set(headers())
      .send({ type: "denylist", identifier_type: "domain", value: "x" });
    expect(res.status).toBe(400);
    expect(res.body.error?.message).toMatch(/allowlist|blocklist/);
  });

  it("GET /v1/signup-restrictions returns the list", async () => {
    const res = await request(app).get("/v1/signup-restrictions").set(headers());
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("DELETE /v1/signup-restrictions/:id 204s", async () => {
    const res = await request(app)
      .delete(`/v1/signup-restrictions/${restrictionId}`)
      .set(headers());
    expect(res.status).toBe(204);
  });
});

// -----------------------------------------------------------------------------
// magic-link.controller — /v1/auth/magic-links
// -----------------------------------------------------------------------------
describe("magic-link controller", () => {
  it("POST /v1/auth/magic-links without email returns 400", async () => {
    const res = await request(app).post("/v1/auth/magic-links").set(headers()).send({});
    expect(res.status).toBe(400);
    expect(res.body.error?.message).toMatch(/email/i);
  });

  it("POST /v1/auth/magic-links/verify without token returns 400", async () => {
    const res = await request(app).post("/v1/auth/magic-links/verify").set(headers()).send({});
    expect(res.status).toBe(400);
    expect(res.body.error?.message).toMatch(/token/i);
  });
});

// -----------------------------------------------------------------------------
// oauth.controller — GET /v1/auth/oauth/:provider (authorize)
// -----------------------------------------------------------------------------
describe("oauth controller", () => {
  it("GET /v1/auth/oauth/:provider rejects unknown providers", async () => {
    const res = await request(app).get("/v1/auth/oauth/notarealprovider").set(headers());
    // OAuthService throws on unknown providers → 400 envelope.
    expect(res.status).toBe(400);
    expect(res.body.error?.message).toBeTruthy();
  });

  it("GET /v1/auth/oauth/:provider rejects disallowed redirect_uri (when redirect-allowlist is populated)", async () => {
    // Seed an allowed redirect so the allowlist check is active. Otherwise
    // RedirectService.isAllowed treats every URI as allowed (empty allowlist).
    await request(app)
      .post("/v1/redirect-urls")
      .set(headers())
      .send({ url: "https://app.example/cb", type: "web" });
    const res = await request(app)
      .get("/v1/auth/oauth/github?redirect_uri=https://attacker.example/x")
      .set(headers());
    expect(res.status).toBe(400);
    // Either the redirect_uri rejection (allowlist hit) OR the provider-not-configured
    // rejection (no GITHUB_CLIENT_ID in env) — both are correct refusals, just
    // assert the call did not silently succeed.
    expect(res.body.error?.message).toBeTruthy();
  });
});

// -----------------------------------------------------------------------------
// organization-metadata.controller — PATCH /v1/organizations/:id/metadata
// -----------------------------------------------------------------------------
describe("organization-metadata controller", () => {
  it("PATCH /v1/organizations/:id/metadata updates public_metadata and returns snake_case Organization", async () => {
    const res = await request(app)
      .patch(`/v1/organizations/${orgId}/metadata`)
      .set(headers())
      .send({ public_metadata: { tier: "gold" } });
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(orgId);
    expect(res.body.public_metadata.tier).toBe("gold");
    expect(res.body).toHaveProperty("created_at");
    expect(res.body).not.toHaveProperty("createdAt");
  });

  it("rejects with 4xx envelope when the organization does not exist (RBAC gate fires first — BUG-153)", async () => {
    const res = await request(app)
      .patch("/v1/organizations/org_missing/metadata")
      .set(headers())
      .send({ public_metadata: {} });
    // BUG-153 (codex r36): post-fix the requirePermission("org:write")
    // gate fires before the controller can return its 400. The caller
    // (test user has no membership in `org_missing`) gets 403 with an
    // error envelope. Either response is "request rejected with an
    // error envelope" — assert that contract, not the specific code.
    expect([400, 403]).toContain(res.status);
    expect(res.body.error?.message).toBeTruthy();
  });
});

// -----------------------------------------------------------------------------
// user-metadata.controller — PATCH /v1/users/:id/metadata
// -----------------------------------------------------------------------------
describe("user-metadata controller", () => {
  it("PATCH /v1/users/:id/metadata returns User in snake_case with merged public_metadata", async () => {
    const res = await request(app)
      .patch(`/v1/users/${userId}/metadata`)
      .set(headers())
      .send({ public_metadata: { plan: "pro" } });
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(userId);
    expect(res.body.public_metadata.plan).toBe("pro");
    // Snake case projection, not raw Drizzle camelCase.
    expect(res.body).not.toHaveProperty("publicMetadata");
    expect(res.body).not.toHaveProperty("createdAt");
  });
});

// -----------------------------------------------------------------------------
// identity.controller — GET /v1/users/:id/identities
// -----------------------------------------------------------------------------
describe("identity controller", () => {
  it("GET /v1/users/:id/identities returns the linked-identities list with snake_case fields", async () => {
    const res = await request(app).get(`/v1/users/${userId}/identities`).set(headers());
    expect(res.status).toBe(200);
    // BUG-52: wrapper has snake_case keys AND inner objects are now mapped
    // — no raw Drizzle camelCase leakage in either oauth_accounts or
    // email_addresses arrays.
    expect(Array.isArray(res.body.oauth_accounts)).toBe(true);
    expect(Array.isArray(res.body.email_addresses)).toBe(true);
    for (const account of res.body.oauth_accounts) {
      expect(account).not.toHaveProperty("userId");
      expect(account).not.toHaveProperty("providerUserId");
      expect(account).not.toHaveProperty("emailAddress");
      expect(account).not.toHaveProperty("createdAt");
    }
    for (const email of res.body.email_addresses) {
      expect(email).not.toHaveProperty("userId");
      expect(email).not.toHaveProperty("emailAddress");
      expect(email).not.toHaveProperty("verificationStatus");
      expect(email).not.toHaveProperty("createdAt");
    }
  });
});

// -----------------------------------------------------------------------------
// role.controller — /v1/organizations/:id/roles (BUG-52 + general happy path)
// -----------------------------------------------------------------------------
describe("role controller", () => {
  let createdRoleId: string;

  it("POST /v1/organizations/:id/roles returns snake_case Role with no camelCase leak", async () => {
    const res = await request(app)
      .post(`/v1/organizations/${orgId}/roles`)
      .set(headers())
      .send({ name: "auditor", description: "Read-only", permissions: ["org:read"] });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeTruthy();
    expect(res.body.organization_id).toBe(orgId);
    expect(res.body.name).toBe("auditor");
    expect(res.body.permissions).toEqual(["org:read"]);
    expect(res.body.is_default).toBe(false);
    expect(res.body).toHaveProperty("created_at");
    expect(res.body).not.toHaveProperty("organizationId");
    expect(res.body).not.toHaveProperty("createdAt");
    createdRoleId = res.body.id;
  });

  it("PATCH /v1/organizations/:id/roles/:role_id preserves the snake_case shape", async () => {
    const res = await request(app)
      .patch(`/v1/organizations/${orgId}/roles/${createdRoleId}`)
      .set(headers())
      .send({ description: "Updated description" });
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdRoleId);
    expect(res.body.description).toBe("Updated description");
    expect(res.body.organization_id).toBe(orgId);
    expect(res.body).not.toHaveProperty("organizationId");
    expect(res.body).not.toHaveProperty("updatedAt");
  });

  it("DELETE /v1/organizations/:id/roles/:role_id returns 204", async () => {
    const res = await request(app)
      .delete(`/v1/organizations/${orgId}/roles/${createdRoleId}`)
      .set(headers());
    expect(res.status).toBe(204);
  });
});

// -----------------------------------------------------------------------------
// Clerk-compat error envelope (BUG-47) — verify both `error` (legacy) AND
// `errors: [{ ... }]` (Clerk-shape) come back on BlerpError throws.
// -----------------------------------------------------------------------------
describe("error envelope (BUG-47)", () => {
  it("GET /v1/organizations/:missing emits both `error` (legacy) and `errors[0]` (Clerk-shape)", async () => {
    const res = await request(app)
      .get("/v1/organizations/org_nonexistent_for_envelope_test")
      .set(headers());
    expect(res.status).toBe(403);
    // BUG-47: dual envelope. SDK clients reading body.errors[0].message
    // (Clerk-shape) work; existing dashboard code reading
    // body.error.message also works through one more release.
    expect(res.body.error).toBeDefined();
    expect(typeof res.body.error.code).toBe("string");
    expect(typeof res.body.error.message).toBe("string");
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0].code).toBe(res.body.error.code);
    expect(res.body.errors[0].message).toBe(res.body.error.message);
    expect(typeof res.body.errors[0].long_message).toBe("string");
  });
});

// -----------------------------------------------------------------------------
// phone.controller — /v1/users/:id/phone_numbers
// -----------------------------------------------------------------------------
describe("phone controller", () => {
  let createdId: string;

  it("POST /v1/users/:id/phone_numbers without phone_number returns 400", async () => {
    const res = await request(app)
      .post(`/v1/users/${userId}/phone_numbers`)
      .set(headers())
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error?.message).toMatch(/phone_number/i);
  });

  it("POST /v1/users/:id/phone_numbers creates a phone in snake_case", async () => {
    const res = await request(app)
      .post(`/v1/users/${userId}/phone_numbers`)
      .set(headers())
      .send({ phone_number: "+15555550100" });
    expect(res.status).toBe(201);
    expect(res.body.phone_number).toBe("+15555550100");
    expect(res.body.verification_status).toBe("unverified");
    expect(res.body).toHaveProperty("created_at");
    expect(res.body).not.toHaveProperty("phoneNumber");
    createdId = res.body.id;
  });

  it("POST again with the same number returns 400 (uniqueness)", async () => {
    const res = await request(app)
      .post(`/v1/users/${userId}/phone_numbers`)
      .set(headers())
      .send({ phone_number: "+15555550100" });
    expect(res.status).toBe(400);
    expect(res.body.error?.message).toMatch(/already/i);
  });

  it("GET /v1/users/:id/phone_numbers lists in snake_case", async () => {
    const res = await request(app).get(`/v1/users/${userId}/phone_numbers`).set(headers());
    expect(res.status).toBe(200);
    expect(res.body.data.some((p: { id: string }) => p.id === createdId)).toBe(true);
    expect(res.body.data[0]).toHaveProperty("phone_number");
  });
});

// -----------------------------------------------------------------------------
// totp.controller — /v1/users/:id/mfa/totp(+verify+disable)
// -----------------------------------------------------------------------------
describe("totp controller", () => {
  it("POST /v1/users/:id/mfa/totp returns secret + uri (enrollment)", async () => {
    const res = await request(app).post(`/v1/users/${userId}/mfa/totp`).set(headers()).send({});
    expect(res.status).toBe(201);
    expect(res.body.secret).toBeTruthy();
    expect(res.body.uri).toBeTruthy();
  });

  it("POST verify rejects when TOTP not enrolled (clean state)", async () => {
    // Drive the path that doesn't need the otplib crypto plugin: a user with
    // no enrollment should be rejected with 400 "TOTP not enrolled".
    const res = await request(app)
      .post(`/v1/users/${otherUserId}/mfa/totp/verify`)
      .set(headers(otherUserId))
      .send({ code: "000000" });
    expect(res.status).toBe(400);
    expect(res.body.error?.message).toMatch(/not enrolled/i);
  });

  it("DELETE /v1/users/:id/mfa/totp returns 200 (disable)", async () => {
    const res = await request(app).delete(`/v1/users/${userId}/mfa/totp`).set(headers());
    expect(res.status).toBe(200);
  });
});

// -----------------------------------------------------------------------------
// upload.controller — POST /v1/uploads/avatar
// -----------------------------------------------------------------------------
describe("upload controller", () => {
  it("POST /v1/uploads/avatar rejects non-data-url image", async () => {
    const res = await request(app)
      .post("/v1/uploads/avatar")
      .set(headers())
      .send({ image: "not a data url" });
    expect(res.status).toBe(400);
    expect(res.body.error?.message).toMatch(/image/i);
  });

  it("POST without image returns 400", async () => {
    const res = await request(app).post("/v1/uploads/avatar").set(headers()).send({});
    expect(res.status).toBe(400);
    expect(res.body.error?.message).toMatch(/image/i);
  });

  it("accepts a real 1x1 png and returns a /uploads/... URL", async () => {
    // 1x1 transparent PNG, base64.
    const png =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const res = await request(app)
      .post("/v1/uploads/avatar")
      .set(headers())
      .send({ image: `data:image/png;base64,${png}` });
    expect(res.status).toBe(201);
    expect(res.body.url).toMatch(/^\/uploads\/avatars\//);

    // Best-effort cleanup of the test artifact.
    const filename = res.body.url.replace(/^\/uploads\/avatars\//, "");
    const fp = path.resolve(process.cwd(), "uploads", "avatars", filename);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  });
});

// -----------------------------------------------------------------------------
// m2m.controller — /v1/m2m-tokens + /v1/oauth/token (client_credentials)
// -----------------------------------------------------------------------------
describe("m2m controller", () => {
  let tokenId: string;
  let clientId: string;
  let clientSecret: string;

  it("POST /v1/m2m-tokens creates a token and returns client_id + client_secret", async () => {
    const res = await request(app)
      .post("/v1/m2m-tokens")
      .set(headers())
      // BUG-187 (codex r52): chain-of-trust now requires the minter
      // to actually hold the requested scope. Pre-r52 the test used
      // the typo "read:users" which slipped through because nothing
      // checked it; now use a real project-bound scope the dev-shim
      // grants.
      .send({ name: "test token", project_id: "proj_ctrl_audit", scopes: ["webhooks:read"] });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeTruthy();
    expect(res.body.client_id).toBeTruthy();
    expect(res.body.client_secret).toBeTruthy();
    tokenId = res.body.id;
    clientId = res.body.client_id;
    clientSecret = res.body.client_secret;
  });

  it("POST without name returns 400", async () => {
    const res = await request(app)
      .post("/v1/m2m-tokens")
      .set(headers())
      .send({ project_id: "proj_ctrl_audit" });
    expect(res.status).toBe(400);
    expect(res.body.error?.message).toMatch(/name/i);
  });

  it("GET /v1/m2m-tokens lists tokens (client_secret never returned)", async () => {
    const res = await request(app).get("/v1/m2m-tokens?project_id=proj_ctrl_audit").set(headers());
    expect(res.status).toBe(200);
    const created = (res.body.data as Array<{ id: string }>).find((t) => t.id === tokenId);
    expect(created).toBeTruthy();
    // Secret must never come back on list — would be a credential leak (BUG-34 lineage).
    expect(JSON.stringify(res.body)).not.toContain(clientSecret);
  });

  it("POST /v1/oauth/token client_credentials grant returns access_token", async () => {
    const res = await request(app).post("/v1/oauth/token").set("X-Tenant-Id", tenantId).send({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    });
    expect(res.status).toBe(200);
    expect(res.body.access_token).toBeTruthy();
    expect(res.body.token_type).toBe("Bearer");
  });

  it("POST /v1/oauth/token rejects bad client_secret with invalid_client envelope", async () => {
    const res = await request(app).post("/v1/oauth/token").set("X-Tenant-Id", tenantId).send({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: "wrong",
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("invalid_client");
  });

  it("DELETE /v1/m2m-tokens/:id revokes (204)", async () => {
    const res = await request(app).delete(`/v1/m2m-tokens/${tokenId}`).set(headers());
    expect(res.status).toBe(204);
  });

  it("BUG-187 (codex r52): an M2M caller cannot mint a token with scopes it does not hold (chain-of-trust)", async () => {
    // Mint a low-scope M2M token via the dev-shim (which carries the
    // full scope set, so the create itself succeeds).
    const lowCreate = await request(app)
      .post("/v1/m2m-tokens")
      .set(headers())
      .send({
        name: "low-scope chain-of-trust source",
        project_id: "proj_ctrl_audit",
        scopes: ["webhooks:read"],
      });
    expect(lowCreate.status).toBe(201);
    const lowClientId = lowCreate.body.client_id as string;
    const lowClientSecret = lowCreate.body.client_secret as string;

    // Exchange for a JWT.
    const tokenRes = await request(app).post("/v1/oauth/token").set("X-Tenant-Id", tenantId).send({
      grant_type: "client_credentials",
      client_id: lowClientId,
      client_secret: lowClientSecret,
    });
    expect(tokenRes.status).toBe(200);
    const lowJwt = tokenRes.body.access_token as string;

    // Use that low-scope JWT to try minting a higher-scope peer.
    // Pre-r52 this 201'd because the chain-of-trust only refused
    // `:admin` / tenant-wide scopes. Post-r52 every scope flows down
    // the tree.
    const escalation = await request(app)
      .post("/v1/m2m-tokens")
      .set("X-Tenant-Id", tenantId)
      .set("Authorization", `Bearer ${lowJwt}`)
      .send({
        name: "attempted escalation",
        project_id: "proj_ctrl_audit",
        scopes: ["webhooks:write"],
      });
    expect(escalation.status).toBe(403);
    expect(escalation.body.error?.message).toMatch(/does not hold/);

    // Sanity: low-scope JWT CAN mint a peer with the same scope.
    const sameScope = await request(app)
      .post("/v1/m2m-tokens")
      .set("X-Tenant-Id", tenantId)
      .set("Authorization", `Bearer ${lowJwt}`)
      .send({
        name: "same-scope peer",
        project_id: "proj_ctrl_audit",
        scopes: ["webhooks:read"],
      });
    expect(sameScope.status).toBe(201);
  });

  it("BUG-186 (codex r51): project-owner session cannot mint tenant-wide scopes (users:* / signup_restrictions:* / redirect_urls:* / usage:*)", async () => {
    // X-No-Dev-Shim opts out of the dev-mode session→M2M elevation, so
    // req.m2m is undefined for this request — same as a production
    // project-owner session. The chain-of-trust gate must then refuse
    // tenant-wide scopes (their routes have no project boundary).
    const tenantWide = [
      "users:read",
      "users:write",
      "signup_restrictions:read",
      "redirect_urls:admin",
      "usage:read",
    ];
    for (const scope of tenantWide) {
      const res = await request(app)
        .post("/v1/m2m-tokens")
        .set(headers())
        .set("X-No-Dev-Shim", "true")
        .send({ name: `tw-${scope}`, project_id: "proj_ctrl_audit", scopes: [scope] });
      expect(res.status).toBe(403);
      expect(res.body.error?.message).toMatch(/privileged|admin|tenant-wide/i);
    }

    // Sanity: project-bound scopes (webhooks:*, members:*, org:*) remain
    // mintable by a plain project-owner session — those controllers
    // already scope by project at the row level (BUG-162 / BUG-160 / BUG-167).
    const projectBound = ["webhooks:read", "members:read", "org:read", "audit_logs:read"];
    for (const scope of projectBound) {
      const res = await request(app)
        .post("/v1/m2m-tokens")
        .set(headers())
        .set("X-No-Dev-Shim", "true")
        .send({ name: `pb-${scope}`, project_id: "proj_ctrl_audit", scopes: [scope] });
      expect(res.status).toBe(201);
    }
  });
});
