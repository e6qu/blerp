import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const API_URL = process.env.BLERP_API_URL || "http://localhost:3000";
const TENANT_ID = "demo-tenant";
const DEMO_PASSWORD = "E2E_Test_Pass_42!";

export interface E2ESession {
  token: string;
  userId: string;
  orgId: string;
}

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const SESSION_PATH = path.join(currentDir, ".e2e-session.json");

function extractCookies(res: Response, existing: string[]): string[] {
  const all = [...existing];
  for (const header of res.headers.getSetCookie()) {
    const kv = header.split(";")[0];
    const name = kv.split("=")[0];
    const idx = all.findIndex((c) => c.startsWith(`${name}=`));
    if (idx >= 0) {
      all[idx] = kv;
    } else {
      all.push(kv);
    }
  }
  return all;
}

function cookieHeader(cookies: string[]): string {
  return cookies.join("; ");
}

async function globalSetup() {
  let cookies: string[] = [];

  // 1. Trigger tenant auto-seed
  try {
    const res = await fetch(`${API_URL}/v1/users/demo_user`, {
      headers: { "X-Tenant-Id": TENANT_ID, "X-User-Id": "demo_user" },
    });
    cookies = extractCookies(res, cookies);
    if (!res.ok) {
      console.warn(`Seed trigger returned ${res.status}`);
    }
  } catch (error) {
    console.error("API server not available at", API_URL);
    throw error;
  }

  // 2. Fetch CSRF token
  const csrfRes = await fetch(`${API_URL}/v1/csrf-token`, {
    headers: {
      "X-Tenant-Id": TENANT_ID,
      "X-User-Id": "demo_user",
      Cookie: cookieHeader(cookies),
    },
  });
  cookies = extractCookies(csrfRes, cookies);
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

  // 3. Set password
  const patchRes = await fetch(`${API_URL}/v1/users/demo_user`, {
    method: "PATCH",
    headers: {
      "X-Tenant-Id": TENANT_ID,
      "X-User-Id": "demo_user",
      "Content-Type": "application/json",
      "x-csrf-token": csrfToken,
      Cookie: cookieHeader(cookies),
    },
    body: JSON.stringify({ password: DEMO_PASSWORD }),
  });
  cookies = extractCookies(patchRes, cookies);

  // 4. Sign in to get JWT
  const signinRes = await fetch(`${API_URL}/v1/auth/signins`, {
    method: "POST",
    headers: {
      "X-Tenant-Id": TENANT_ID,
      "Content-Type": "application/json",
      "x-csrf-token": csrfToken,
      Cookie: cookieHeader(cookies),
    },
    body: JSON.stringify({
      identifier: `admin@${TENANT_ID}.blerp.dev`,
      strategy: "password",
    }),
  });
  cookies = extractCookies(signinRes, cookies);
  const signin = await signinRes.json();

  const attemptRes = await fetch(`${API_URL}/v1/auth/signins/${signin.id}/attempt`, {
    method: "POST",
    headers: {
      "X-Tenant-Id": TENANT_ID,
      "Content-Type": "application/json",
      "x-csrf-token": csrfToken,
      Cookie: cookieHeader(cookies),
    },
    body: JSON.stringify({
      identifier: `admin@${TENANT_ID}.blerp.dev`,
      password: DEMO_PASSWORD,
    }),
  });
  const attempt = await attemptRes.json();

  if (!attempt.tokens?.access_token) {
    throw new Error(
      `E2E setup: failed to get JWT. Status: ${attemptRes.status}, body: ${JSON.stringify(attempt)}`,
    );
  }

  // 5. Write session
  const session: E2ESession = {
    token: attempt.tokens.access_token,
    userId: attempt.session.user_id,
    orgId: "org_monite_demo",
  };
  fs.writeFileSync(SESSION_PATH, JSON.stringify(session));
  console.log(`E2E session saved: userId=${session.userId}, orgId=${session.orgId}`);
}

export default globalSetup;
