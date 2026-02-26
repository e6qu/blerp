/* eslint-disable @typescript-eslint/no-explicit-any */
import { nanoid } from "nanoid";
import { eventBus } from "../../lib/events";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";
import { eq } from "drizzle-orm";

export class AuthService {
  constructor(
    private db: BetterSQLite3Database<typeof schema>,
    private tenantId: string,
  ) {}

  async createSignup(data: { email: string; strategy: string }) {
    const signupId = `sig_${nanoid()}`;
    return {
      id: signupId,
      status: "needs_verification",
      identifier: data.email,
      strategy: data.strategy,
      verification: {
        channel: "email_code",
        expires_at: new Date(Date.now() + 15 * 60000).toISOString(),
      },
    };
  }

  async attemptSignup(signupId: string, code: string) {
    if (code !== "123456") {
      throw new Error("Invalid verification code");
    }
    const userId = `user_${nanoid()}`;
    await this.db.insert(schema.users).values({
      id: userId,
      status: "active",
    });
    await this.db.insert(schema.emailAddresses).values({
      id: `email_${nanoid()}`,
      userId,
      emailAddress: "pending@example.com",
      verificationStatus: "verified",
    });
    await eventBus.emit("user.created", this.tenantId, { userId });
    return { userId };
  }

  async getUser(id: string) {
    return this.db.query.users.findFirst({
      where: eq(schema.users.id, id),
      with: {
        emailAddresses: true,
      },
    });
  }

  async updateUserMetadata(
    userId: string,
    data: { publicMetadata?: any; privateMetadata?: any; unsafeMetadata?: any },
  ) {
    await this.db
      .update(schema.users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.users.id, userId));
    return this.getUser(userId);
  }
}
