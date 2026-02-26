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
}

export class OAuthService {
  constructor(
    private db: BetterSQLite3Database<typeof schema>,
    private tenantId: string,
  ) {}

  async getAuthorizeUrl(providerId: string, redirectUri: string) {
    // Mock URL generation
    const state = nanoid();
    return `https://mock-oauth.com/${providerId}/authorize?client_id=mock&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
  }

  async handleCallback(providerId: string, _code: string) {
    // Mock token exchange and user info fetching
    const mockExternalId = `ext_${nanoid()}`;
    const email = `oauth_${providerId}@example.com`;

    // 1. Find or create user
    let user = await this.db.query.users.findFirst({
      where: (users, { exists }) =>
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

    // 2. Link OAuth account
    await this.db
      .insert(schema.oauthAccounts)
      .values({
        id: `oa_${nanoid()}`,
        userId: user!.id,
        provider: providerId,
        providerUserId: mockExternalId,
        emailAddress: email,
      })
      .onConflictDoNothing();

    return { userId: user!.id };
  }
}
