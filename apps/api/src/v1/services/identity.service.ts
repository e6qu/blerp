import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export class IdentityService {
  constructor(private db: BetterSQLite3Database<typeof schema>) {}

  async linkOAuthAccount(
    userId: string,
    data: { provider: string; providerUserId: string; emailAddress: string },
  ) {
    const id = `oa_${nanoid()}`;
    await this.db
      .insert(schema.oauthAccounts)
      .values({
        id,
        userId,
        provider: data.provider,
        providerUserId: data.providerUserId,
        emailAddress: data.emailAddress,
      })
      .onConflictDoNothing();
    return this.getOAuthAccount(id);
  }

  async unlinkOAuthAccount(userId: string, oauthAccountId: string) {
    await this.db
      .delete(schema.oauthAccounts)
      .where(
        and(eq(schema.oauthAccounts.id, oauthAccountId), eq(schema.oauthAccounts.userId, userId)),
      );
  }

  async getOAuthAccount(id: string) {
    return this.db.query.oauthAccounts.findFirst({
      where: eq(schema.oauthAccounts.id, id),
    });
  }

  async listUserIdentities(userId: string) {
    const oauthAccounts = await this.db
      .select()
      .from(schema.oauthAccounts)
      .where(eq(schema.oauthAccounts.userId, userId));
    const emailAddresses = await this.db
      .select()
      .from(schema.emailAddresses)
      .where(eq(schema.emailAddresses.userId, userId));

    return {
      oauth_accounts: oauthAccounts,
      email_addresses: emailAddresses,
    };
  }
}
