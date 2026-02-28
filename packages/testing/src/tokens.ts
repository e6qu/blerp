import type { components } from "@blerp/shared";
import * as crypto from "crypto";

type User = components["schemas"]["User"];
type Organization = components["schemas"]["Organization"];
type Session = components["schemas"]["Session"];

export interface TestTokenOptions {
  userId?: string;
  email?: string;
  orgId?: string;
  orgRole?: "owner" | "admin" | "member";
  expiresIn?: number;
  secretKey?: string;
}

export interface TestTokenPayload {
  sub: string;
  email: string;
  org_id?: string;
  org_role?: string;
  iat: number;
  exp: number;
}

const DEFAULT_SECRET = "sk_test_" + "a".repeat(32);
const DEFAULT_EXPIRY_MS = 60 * 60 * 1000;

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function createSignature(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}

export function createTestToken(options: TestTokenOptions = {}): string {
  const {
    userId = `test_user_${Date.now()}`,
    email = `test_${Date.now()}@example.com`,
    orgId,
    orgRole,
    expiresIn = DEFAULT_EXPIRY_MS,
    secretKey = process.env.BLERP_SECRET_KEY || DEFAULT_SECRET,
  } = options;

  const now = Date.now();
  const payload: TestTokenPayload = {
    sub: userId,
    email,
    iat: now,
    exp: now + expiresIn,
  };

  if (orgId) {
    payload.org_id = orgId;
    payload.org_role = orgRole || "member";
  }

  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = createSignature(data, secretKey);

  return `${data}.${signature}`;
}

export function createTestUser(overrides: Partial<User> = {}): User {
  const id = overrides.id || `user_${Date.now()}`;
  return {
    id,
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    email_addresses: [
      {
        id: `email_${id}`,
        email: overrides.email_addresses?.[0]?.email || `test_${id}@example.com`,
        verification: { status: "verified" },
      },
    ],
    external_id: overrides.external_id || null,
    username: overrides.username || null,
    first_name: overrides.first_name || "Test",
    last_name: overrides.last_name || "User",
    image_url: overrides.image_url || null,
    has_image: overrides.has_image || false,
    locked: overrides.locked || false,
    totp_enabled: overrides.totp_enabled || false,
    backup_code_enabled: overrides.backup_code_enabled || false,
    two_factor_enabled: overrides.two_factor_enabled || false,
    ...overrides,
  } as User;
}

export function createTestOrganization(overrides: Partial<Organization> = {}): Organization {
  const id = overrides.id || `org_${Date.now()}`;
  return {
    id,
    name: overrides.name || "Test Organization",
    slug: overrides.slug || `test-org-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    public_metadata: {},
    private_metadata: {},
    ...overrides,
  } as Organization;
}

export function createTestSession(overrides: Partial<Session> = {}): Session {
  const id = overrides.id || `sess_${Date.now()}`;
  return {
    id,
    status: overrides.status || "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  } as Session;
}

export function mintTestTokens(count: number, options: TestTokenOptions = {}): string[] {
  return Array.from({ length: count }, (_, i) =>
    createTestToken({
      ...options,
      userId: options.userId || `test_user_${i}_${Date.now()}`,
    }),
  );
}
