import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const API_URL = process.env.BLERP_API_URL || "http://localhost:3000";
const TENANT_ID = "demo-tenant";
const DEMO_PASSWORD = "E2E_Test_Pass_42!";

export interface E2ESession {
  token: string;
  userId: string;
}

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const SESSION_PATH = path.join(currentDir, ".e2e-session.json");

async function globalSetup() {
  // 1. Trigger tenant DB initialization (and auto-seed in dev mode)
  try {
    const res = await fetch(`${API_URL}/v1/users/demo_user`, {
      headers: { "X-Tenant-Id": TENANT_ID, "X-User-Id": "demo_user" },
    });
    if (!res.ok) {
      console.warn(`Seed trigger returned ${res.status} — auto-seed may not have run.`);
    }
  } catch (error) {
    console.warn("API server not available at", API_URL);
    console.warn("Make sure `bun run dev` is running from the repo root.");
    throw error;
  }

  // 2. Set password on demo_user (idempotent — uses X-User-Id dev fallback)
  await fetch(`${API_URL}/v1/users/demo_user`, {
    method: "PATCH",
    headers: {
      "X-Tenant-Id": TENANT_ID,
      "X-User-Id": "demo_user",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password: DEMO_PASSWORD }),
  });

  // 3. Sign in to get a real JWT
  const signinRes = await fetch(`${API_URL}/v1/auth/signins`, {
    method: "POST",
    headers: { "X-Tenant-Id": TENANT_ID, "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: `admin@${TENANT_ID}.blerp.dev`,
      strategy: "password",
    }),
  });
  const signin = await signinRes.json();

  const attemptRes = await fetch(`${API_URL}/v1/auth/signins/${signin.id}/attempt`, {
    method: "POST",
    headers: { "X-Tenant-Id": TENANT_ID, "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: `admin@${TENANT_ID}.blerp.dev`,
      password: DEMO_PASSWORD,
    }),
  });
  const attempt = await attemptRes.json();

  if (!attempt.tokens?.access_token) {
    throw new Error(
      `E2E global setup: failed to obtain JWT. Status: ${attemptRes.status}, body: ${JSON.stringify(attempt)}`,
    );
  }

  // 4. Write session to disk so fixtures can inject it
  const session: E2ESession = {
    token: attempt.tokens.access_token,
    userId: attempt.session.user_id,
  };
  fs.writeFileSync(SESSION_PATH, JSON.stringify(session));
}

export default globalSetup;
