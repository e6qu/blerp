import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export class MagicLinkService {
  constructor(private db: BetterSQLite3Database<typeof schema>) {}

  async createToken(email: string) {
    const emailRecord = await this.db.query.emailAddresses.findFirst({
      where: eq(schema.emailAddresses.emailAddress, email),
    });

    if (!emailRecord) {
      throw new Error("No account found with that email address");
    }

    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, emailRecord.userId),
    });

    if (!user || user.status !== "active") {
      throw new Error("Account is not active");
    }

    const id = `sit_${nanoid()}`;
    const token = nanoid(48);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.db.insert(schema.signInTokens).values({
      id,
      userId: user.id,
      token,
      status: "pending",
      expiresAt,
    });

    return { id, token, expires_at: expiresAt.toISOString() };
  }

  async verifyToken(token: string) {
    const record = await this.db.query.signInTokens.findFirst({
      where: eq(schema.signInTokens.token, token),
    });

    if (!record) {
      throw new Error("Invalid sign-in token");
    }

    if (record.status !== "pending") {
      throw new Error("Token has already been used or revoked");
    }

    if (record.expiresAt < new Date()) {
      await this.db
        .update(schema.signInTokens)
        .set({ status: "expired" })
        .where(eq(schema.signInTokens.id, record.id));
      throw new Error("Token has expired");
    }

    // Mark token as accepted
    await this.db
      .update(schema.signInTokens)
      .set({ status: "accepted" })
      .where(eq(schema.signInTokens.id, record.id));

    // Create session
    const sessionId = `ses_${nanoid()}`;
    const expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const abandonAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await this.db.insert(schema.sessions).values({
      id: sessionId,
      userId: record.userId,
      status: "active",
      expireAt,
      abandonAt,
    });

    // Update last sign in
    await this.db
      .update(schema.users)
      .set({ lastSignInAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.users.id, record.userId));

    return {
      session: {
        id: sessionId,
        user_id: record.userId,
        status: "active" as const,
        created_at: new Date().toISOString(),
      },
      tokens: {
        access_token: `tok_${nanoid()}`,
        refresh_token: `ref_${nanoid()}`,
        expires_in: 3600,
        session_id: sessionId,
      },
    };
  }
}
