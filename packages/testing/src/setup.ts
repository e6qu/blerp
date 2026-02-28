import type { Page } from "@playwright/test";
import { request } from "@playwright/test";
import { createTestToken } from "./tokens.js";

export interface BlerpSetupOptions {
  baseUrl?: string;
  secretKey?: string;
  testUserId?: string;
  testUserEmail?: string;
}

const DEFAULT_BASE_URL = "http://localhost:3000";
const DEFAULT_TEST_USER_ID = "e2e_test_user";
const DEFAULT_TEST_USER_EMAIL = "e2e-test@blerp.test";

let cachedTestingToken: string | null = null;
let cachedTestUserId: string | null = null;

export async function blerpSetup(options: BlerpSetupOptions = {}): Promise<void> {
  const {
    baseUrl = process.env.BLERP_API_URL || DEFAULT_BASE_URL,
    secretKey = process.env.BLERP_SECRET_KEY || "",
    testUserId = DEFAULT_TEST_USER_ID,
    testUserEmail = DEFAULT_TEST_USER_EMAIL,
  } = options;

  const client = await request.newContext({
    baseURL: baseUrl,
    extraHTTPHeaders: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
  });

  let userId = testUserId;

  const existingUser = await client.get(`/v1/users/${testUserId}`);
  if (!existingUser.ok()) {
    const createUserRes = await client.post("/v1/users", {
      data: {
        id: testUserId,
        email_addresses: [{ email: testUserEmail, primary: true }],
        first_name: "E2E",
        last_name: "Test",
      },
    });

    if (createUserRes.ok()) {
      const userData = await createUserRes.json();
      userId = (userData as { id: string }).id || testUserId;
    }
  }

  cachedTestUserId = userId;

  cachedTestingToken = createTestToken({
    userId,
    email: testUserEmail,
    secretKey,
  });

  process.env.BLERP_TESTING_TOKEN = cachedTestingToken;
  process.env.BLERP_TEST_USER_ID = userId;
}

export function getTestingToken(): string | null {
  return cachedTestingToken || process.env.BLERP_TESTING_TOKEN || null;
}

export function getTestUserId(): string | null {
  return cachedTestUserId || process.env.BLERP_TEST_USER_ID || null;
}

export interface SetupTestingTokenOptions {
  page: Page;
  baseUrl?: string;
  token?: string;
}

export async function setupBlerpTestingToken(options: SetupTestingTokenOptions): Promise<void> {
  const { page, baseUrl = DEFAULT_BASE_URL, token } = options;

  const testingToken = token || getTestingToken();
  if (!testingToken) {
    throw new Error("No testing token available. Call blerpSetup() in global.setup.ts first.");
  }

  const domain = new URL(baseUrl).hostname;

  await page.context().addCookies([
    {
      name: "__blerp_session",
      value: testingToken,
      domain,
      path: "/",
      httpOnly: true,
      secure: baseUrl.startsWith("https"),
      sameSite: "Lax",
    },
  ]);
}

export interface AuthenticatedFixtureOptions {
  userId?: string;
  email?: string;
  orgId?: string;
  orgRole?: "owner" | "admin" | "member";
}

export async function createAuthenticatedPage(
  page: Page,
  options: AuthenticatedFixtureOptions = {},
): Promise<void> {
  const {
    userId = getTestUserId() || DEFAULT_TEST_USER_ID,
    email = DEFAULT_TEST_USER_EMAIL,
    orgId,
    orgRole,
  } = options;

  const token = createTestToken({
    userId,
    email,
    orgId,
    orgRole,
  });

  await page.context().addCookies([
    {
      name: "__blerp_session",
      value: token,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}
