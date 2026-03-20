/**
 * One-command setup for the Monite SDK parity demo.
 *
 * Usage:  bun run scripts/dev-setup.ts
 *
 * What it does:
 *   1. Creates .env.local from .env.example if missing
 *   2. Waits for the API server (starts it if not running)
 *   3. Seeds the demo tenant and sets a password on the demo user
 *   4. Starts the Next.js dev server on port 3002
 *   5. Opens the browser
 */
import { $ } from "bun";
import { existsSync, copyFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dir, "..");
const API_ROOT = path.resolve(ROOT, "../../apps/api");
const API_URL = process.env.BLERP_API_URL ?? "http://localhost:3000";
const MONITE_PORT = process.env.PORT ?? "3002";
const TENANT_ID = "demo-tenant";
const DEMO_PASSWORD = "E2E_Test_Pass_42!";

// ── Step 1: Ensure .env.local exists ──

const envLocal = path.join(ROOT, ".env.local");
if (!existsSync(envLocal)) {
  const example = path.join(ROOT, ".env.example");
  if (existsSync(example)) {
    copyFileSync(example, envLocal);
    console.log("[setup] Created .env.local from .env.example");
  } else {
    writeFileSync(
      envLocal,
      [
        "NEXT_PUBLIC_BLERP_PUBLISHABLE_KEY=pk_dev_demo_blerp_publishable_key_001",
        `BLERP_API_URL=${API_URL}`,
        "BLERP_SECRET_KEY=sk_test_demo_secret",
        "BLERP_WEBHOOK_SECRET=whsec_demo_secret",
        "",
      ].join("\n"),
    );
    console.log("[setup] Created .env.local with defaults");
  }
}

// ── Step 2: Wait for the API server ──

async function waitForApi(maxRetries = 30): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(`${API_URL}/health`);
      if (res.ok) {
        console.log("[setup] API server is ready");
        return;
      }
    } catch {
      // not ready yet
    }
    if (i === 0) console.log("[setup] Waiting for API server...");
    await Bun.sleep(1000);
  }
  throw new Error(`API server not available at ${API_URL} after ${maxRetries}s`);
}

let apiProc: ReturnType<typeof Bun.spawn> | undefined;

try {
  await fetch(`${API_URL}/health`);
  console.log("[setup] API server already running");
} catch {
  console.log("[setup] Starting API server...");
  apiProc = Bun.spawn(["bun", "run", "dev"], {
    cwd: API_ROOT,
    stdio: ["ignore", "inherit", "inherit"],
  });
}

await waitForApi();

// ── Step 3: Seed demo tenant and set password ──

async function seedAndAuth() {
  // Trigger tenant auto-seed by fetching a user
  const seedRes = await fetch(`${API_URL}/v1/users/demo_user`, {
    headers: { "X-Tenant-Id": TENANT_ID, "X-User-Id": "demo_user" },
  });
  if (seedRes.ok) {
    console.log("[setup] Demo tenant seeded (or already exists)");
  } else {
    console.warn(`[setup] Seed trigger returned ${seedRes.status}`);
  }

  // Fetch CSRF token
  const csrfRes = await fetch(`${API_URL}/v1/csrf-token`, {
    headers: { "X-Tenant-Id": TENANT_ID, "X-User-Id": "demo_user" },
  });
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

  // Set password on demo_user
  const patchRes = await fetch(`${API_URL}/v1/users/demo_user`, {
    method: "PATCH",
    headers: {
      "X-Tenant-Id": TENANT_ID,
      "X-User-Id": "demo_user",
      "Content-Type": "application/json",
      "x-csrf-token": csrfToken,
    },
    body: JSON.stringify({ password: DEMO_PASSWORD }),
  });
  if (patchRes.ok) {
    console.log("[setup] Demo user password set");
  } else {
    console.warn(`[setup] Password set returned ${patchRes.status}`);
  }

  console.log("[setup] Demo credentials:");
  console.log(`  Email:    admin@${TENANT_ID}.blerp.dev`);
  console.log(`  Password: ${DEMO_PASSWORD}`);
}

await seedAndAuth();

// ── Step 4: Start Next.js dev server ──

console.log(`[setup] Starting Monite demo on port ${MONITE_PORT}...`);
const nextProc = Bun.spawn(["bun", "run", "dev", "--", "--port", MONITE_PORT], {
  cwd: ROOT,
  stdio: ["ignore", "inherit", "inherit"],
});

// Wait for Next.js to be ready
for (let i = 0; i < 30; i++) {
  try {
    const res = await fetch(`http://localhost:${MONITE_PORT}`);
    if (res.ok || res.status === 307 || res.status === 302) break;
  } catch {
    // not ready yet
  }
  await Bun.sleep(1000);
}

console.log(`\n[setup] ✓ Monite SDK demo ready!`);
console.log(`  Dashboard: http://localhost:${MONITE_PORT}`);
console.log(`  API:       ${API_URL}`);
console.log(`\n  Sign in with: admin@${TENANT_ID}.blerp.dev / ${DEMO_PASSWORD}\n`);

// ── Step 5: Open browser ──

try {
  await $`open http://localhost:${MONITE_PORT}`.quiet();
} catch {
  // Ignore if open fails (headless environment)
}

// Keep alive
process.on("SIGINT", () => {
  nextProc.kill();
  apiProc?.kill();
  process.exit(0);
});

await nextProc.exited;
