import createClient from "openapi-fetch";
import type { paths } from "@blerp/shared";
import {
  getApiUrl,
  getSecretKeyOrThrow,
  getSecretKey,
  getPublishableKey,
  getPublishableKeyOrThrow,
  getWebhookSecret,
  getWebhookSecretOrThrow,
} from "./env.js";
import { createUsersApi } from "./api/users.js";
import { createOrganizationsApi } from "./api/organizations.js";
import { createOrganizationMembershipsApi } from "./api/organization-memberships.js";
import { createInvitationsApi } from "./api/invitations.js";
import { createSessionsApi } from "./api/sessions.js";
import { createEmailAddressesApi } from "./api/email-addresses.js";

export { BlerpAPIError } from "./errors.js";
export {
  getSecretKey,
  getSecretKeyOrThrow,
  getPublishableKey,
  getPublishableKeyOrThrow,
  getApiUrl,
  getWebhookSecret,
  getWebhookSecretOrThrow,
};

export class BlerpClient {
  private client: ReturnType<typeof createClient<paths>>;

  constructor(options: { baseUrl: string; secretKey: string; tenantId?: string }) {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${options.secretKey}`,
    };
    if (options.tenantId) {
      headers["X-Tenant-Id"] = options.tenantId;
    }
    this.client = createClient<paths>({
      baseUrl: options.baseUrl,
      headers,
    });
  }

  get users() {
    return createUsersApi(this.client);
  }

  get organizations() {
    return createOrganizationsApi(this.client);
  }

  get organizationMemberships() {
    return createOrganizationMembershipsApi(this.client);
  }

  get invitations() {
    return createInvitationsApi(this.client);
  }

  get sessions() {
    return createSessionsApi(this.client);
  }

  get emailAddresses() {
    return createEmailAddressesApi(this.client);
  }
}

export function createBlerpClient(options: {
  baseUrl: string;
  secretKey: string;
  tenantId?: string;
}) {
  return new BlerpClient(options);
}

export function createBlerpClientFromEnv(): BlerpClient {
  return createBlerpClient({
    baseUrl: getApiUrl(),
    secretKey: getSecretKeyOrThrow(),
  });
}

/**
 * Clerk-compatible async factory. Returns a BlerpClient configured from env vars.
 * Usage: `const client = await clerkClient();`
 */
export async function clerkClient(): Promise<BlerpClient> {
  return createBlerpClientFromEnv();
}
