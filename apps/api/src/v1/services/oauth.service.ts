import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface OAuthProviderConfig {
  id: string;
  name: string;
  clientId: string;
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string;
}

interface ProviderEndpoints {
  authorizeUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string;
  clientIdEnv: string;
  clientSecretEnv: string;
}

const PROVIDER_ENDPOINTS: Record<string, ProviderEndpoints> = {
  github: {
    authorizeUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    userInfoUrl: "https://api.github.com/user",
    scope: "read:user user:email",
    clientIdEnv: "GITHUB_CLIENT_ID",
    clientSecretEnv: "GITHUB_CLIENT_SECRET",
  },
  google: {
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
    scope: "openid email profile",
    clientIdEnv: "GOOGLE_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CLIENT_SECRET",
  },
};

export class OAuthService {
  constructor(
    private db: BetterSQLite3Database<typeof schema>,
    private _tenantId: string,
  ) {}

  private getProviderConfig(providerId: string): OAuthProviderConfig | null {
    const endpoints = PROVIDER_ENDPOINTS[providerId];
    if (!endpoints) return null;

    const clientId = process.env[endpoints.clientIdEnv];
    const clientSecret = process.env[endpoints.clientSecretEnv];
    if (!clientId || !clientSecret) return null;

    return {
      id: providerId,
      name: providerId,
      clientId,
      clientSecret,
      authorizeUrl: endpoints.authorizeUrl,
      tokenUrl: endpoints.tokenUrl,
      userInfoUrl: endpoints.userInfoUrl,
      scope: endpoints.scope,
    };
  }

  async getAuthorizeUrl(providerId: string, redirectUri: string) {
    const config = this.getProviderConfig(providerId);
    if (!config) {
      // Mock fallback when env vars are not configured
      const state = nanoid();
      return `https://mock-oauth.com/${providerId}/authorize?client_id=mock&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
    }

    const state = nanoid();
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      state,
      scope: config.scope,
      response_type: "code",
    });
    return `${config.authorizeUrl}?${params.toString()}`;
  }

  async handleCallback(providerId: string, code: string, redirectUri?: string) {
    const config = this.getProviderConfig(providerId);
    if (!config) {
      return this.handleMockCallback(providerId);
    }

    // 1. Exchange code for access token
    const tokenResponse = await fetch(config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: redirectUri ?? "",
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`OAuth token exchange failed: ${tokenResponse.status}`);
    }

    const tokenData = (await tokenResponse.json()) as { access_token?: string; error?: string };
    if (!tokenData.access_token) {
      throw new Error(
        `OAuth token exchange returned no access_token: ${tokenData.error ?? "unknown"}`,
      );
    }

    // 2. Fetch user info
    const userInfoResponse = await fetch(config.userInfoUrl, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (!userInfoResponse.ok) {
      throw new Error(`Failed to fetch user info: ${userInfoResponse.status}`);
    }

    const userInfo = (await userInfoResponse.json()) as {
      id?: number;
      sub?: string;
      email?: string | null;
      name?: string;
      login?: string;
    };

    let email = userInfo.email ?? null;
    const providerUserId = String(userInfo.id ?? userInfo.sub ?? "");

    // 3. GitHub: fetch emails separately if email is null
    if (providerId === "github" && !email) {
      const emailsResponse = await fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      if (emailsResponse.ok) {
        const emails = (await emailsResponse.json()) as Array<{
          email: string;
          primary: boolean;
          verified: boolean;
        }>;
        const primary = emails.find((e) => e.primary && e.verified);
        email = primary?.email ?? emails[0]?.email ?? null;
      }
    }

    if (!email) {
      throw new Error("OAuth provider did not return an email address");
    }

    // 4. Find or create user with real data
    return this.findOrCreateUser(providerId, providerUserId, email);
  }

  private async handleMockCallback(providerId: string) {
    const mockExternalId = `ext_${nanoid()}`;
    const email = `oauth_${providerId}@example.com`;
    return this.findOrCreateUser(providerId, mockExternalId, email);
  }

  private async findOrCreateUser(providerId: string, providerUserId: string, email: string) {
    let user = await this.db.query.users.findFirst({
      where: (_users, { exists }) =>
        exists(
          this.db
            .select()
            .from(schema.emailAddresses)
            .where(
              and(
                eq(schema.emailAddresses.userId, schema.users.id),
                eq(schema.emailAddresses.emailAddress, email),
              ),
            ),
        ),
    });

    if (!user) {
      const userId = `user_${nanoid()}`;
      await this.db.insert(schema.users).values({ id: userId, status: "active" });
      await this.db.insert(schema.emailAddresses).values({
        id: `email_${nanoid()}`,
        userId,
        emailAddress: email,
        verificationStatus: "verified",
      });
      user = await this.db.query.users.findFirst({ where: eq(schema.users.id, userId) });
    }

    await this.db
      .insert(schema.oauthAccounts)
      .values({
        id: `oa_${nanoid()}`,
        userId: user!.id,
        provider: providerId,
        providerUserId,
        emailAddress: email,
      })
      .onConflictDoNothing();

    return { userId: user!.id };
  }
}
