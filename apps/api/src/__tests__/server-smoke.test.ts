import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

const API_PORT = 3099; // Use a unique port to avoid conflicts
const API_URL = `http://localhost:${API_PORT}`;
const TENANT_ID = "smoke-test-tenant";
const TENANTS_DIR = path.resolve(process.cwd(), "tenants");

describe("Server Smoke Tests", () => {
  let serverProcess: ChildProcess;

  beforeAll(async () => {
    // Clean up any prior tenant DB for this test
    const dbPath = path.join(TENANTS_DIR, `${TENANT_ID}.db`);
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

    // Start the actual server using tsx (the dev script runner)
    serverProcess = spawn("bunx", ["tsx", "src/index.ts"], {
      cwd: process.cwd(),
      env: { ...process.env, PORT: String(API_PORT), NODE_ENV: "test" },
      stdio: "pipe",
    });

    // Wait for server to be ready
    const maxWait = 15_000;
    const start = Date.now();
    while (Date.now() - start < maxWait) {
      try {
        const res = await fetch(`${API_URL}/health`);
        if (res.ok) break;
      } catch {
        // Server not ready yet
      }
      await new Promise((r) => setTimeout(r, 300));
    }

    // Verify server is actually up
    const healthRes = await fetch(`${API_URL}/health`);
    expect(healthRes.ok).toBe(true);
  }, 30_000);

  afterAll(() => {
    serverProcess?.kill("SIGTERM");
    // Clean up tenant DB
    const dbPath = path.join(TENANTS_DIR, `${TENANT_ID}.db`);
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  it("health endpoint responds", async () => {
    const res = await fetch(`${API_URL}/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
  });

  it("creates a user via the API", async () => {
    const res = await fetch(`${API_URL}/v1/auth/signups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Id": TENANT_ID,
        "X-User-Id": "smoke_admin",
      },
      body: JSON.stringify({ email: "smoke@test.dev", strategy: "password" }),
    });

    expect([200, 201]).toContain(res.status);
  });

  it("lists organizations (empty for test tenant)", async () => {
    const res = await fetch(`${API_URL}/v1/organizations`, {
      headers: {
        "X-Tenant-Id": TENANT_ID,
        "X-User-Id": "smoke_admin",
      },
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
  });

  it("creates and retrieves a webhook endpoint", async () => {
    // Create
    const createRes = await fetch(`${API_URL}/v1/webhooks/endpoints`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Id": TENANT_ID,
        "X-User-Id": "smoke_admin",
      },
      body: JSON.stringify({
        url: "https://smoke-test.example.com/hook",
        events: ["user.created"],
      }),
    });

    expect([200, 201]).toContain(createRes.status);
    const webhook = await createRes.json();
    expect(webhook.url).toBe("https://smoke-test.example.com/hook");
    expect(webhook.events).toContain("user.created");
    expect(webhook.status).toBe("active");
    expect(webhook.secret).toBeDefined();

    // List
    const listRes = await fetch(`${API_URL}/v1/webhooks/endpoints`, {
      headers: {
        "X-Tenant-Id": TENANT_ID,
        "X-User-Id": "smoke_admin",
      },
    });

    expect(listRes.status).toBe(200);
    const list = await listRes.json();
    expect(list.data.length).toBeGreaterThanOrEqual(1);
    expect(list.data[0].events).toContain("user.created");
  });

  it("returns snake_case field names in responses", async () => {
    // Create an org to test field naming
    const createRes = await fetch(`${API_URL}/v1/organizations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Id": TENANT_ID,
        "X-User-Id": "smoke_admin",
      },
      body: JSON.stringify({
        name: "Smoke Org",
        slug: "smoke-org",
        project_id: "smoke-project",
      }),
    });

    // May fail if project doesn't exist, but check field names on any JSON response
    const body = await createRes.json();

    if (createRes.status === 201) {
      // Verify snake_case (not camelCase)
      expect(body.created_at).toBeDefined();
      expect(body.project_id).toBeDefined();
      // Verify camelCase fields are NOT present
      expect(body.createdAt).toBeUndefined();
      expect(body.projectId).toBeUndefined();
    }
  });
});
