import type { Page, BrowserContext, APIRequestContext } from "@playwright/test";
import { request } from "@playwright/test";
import { createTestToken, type TestTokenOptions } from "./tokens.js";

export interface BlerpTestOptions {
  baseUrl?: string;
  secretKey?: string;
  publishableKey?: string;
}

export interface AuthenticatedPageOptions extends TestTokenOptions {
  storageState?: string;
}

const DEFAULT_BASE_URL = "http://localhost:3000";

export class BlerpTestHelper {
  private baseUrl: string;
  private secretKey: string;
  private publishableKey: string;

  constructor(options: BlerpTestOptions = {}) {
    this.baseUrl = options.baseUrl || process.env.BLERP_API_URL || DEFAULT_BASE_URL;
    this.secretKey = options.secretKey || process.env.BLERP_SECRET_KEY || "";
    this.publishableKey =
      options.publishableKey || process.env.NEXT_PUBLIC_BLERP_PUBLISHABLE_KEY || "";
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getSecretKey(): string {
    return this.secretKey;
  }

  async setAuthCookie(context: BrowserContext, options: TestTokenOptions = {}): Promise<string> {
    const token = createTestToken({
      ...options,
      secretKey: this.secretKey,
    });

    await context.addCookies([
      {
        name: "__blerp_session",
        value: token,
        domain: new URL(this.baseUrl).hostname,
        path: "/",
        httpOnly: true,
        secure: this.baseUrl.startsWith("https"),
        sameSite: "Lax",
      },
    ]);

    return token;
  }

  async createAuthenticatedPage(
    context: BrowserContext,
    options: TestTokenOptions = {},
  ): Promise<Page> {
    const page = await context.newPage();
    await this.setAuthCookie(context, options);
    return page;
  }

  async createApiClient(): Promise<APIRequestContext> {
    return request.newContext({
      baseURL: this.baseUrl,
      extraHTTPHeaders: {
        Authorization: `Bearer ${this.secretKey}`,
        "Content-Type": "application/json",
      },
    });
  }
}

export function createTestHelper(options: BlerpTestOptions = {}): BlerpTestHelper {
  return new BlerpTestHelper(options);
}

export async function loginAsUser(
  page: Page,
  options: TestTokenOptions & { baseUrl?: string },
): Promise<void> {
  const { baseUrl = DEFAULT_BASE_URL, ...tokenOptions } = options;
  const token = createTestToken(tokenOptions);

  await page.context().addCookies([
    {
      name: "__blerp_session",
      value: token,
      domain: new URL(baseUrl).hostname,
      path: "/",
      httpOnly: true,
      secure: baseUrl.startsWith("https"),
      sameSite: "Lax",
    },
  ]);

  await page.goto(baseUrl);
}

export async function logout(page: Page, baseUrl: string = DEFAULT_BASE_URL): Promise<void> {
  await page.context().clearCookies({
    name: "__blerp_session",
    domain: new URL(baseUrl).hostname,
  });
}
