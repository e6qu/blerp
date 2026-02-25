import { nanoid } from "nanoid";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";

export class AuthService {
  constructor(private db: BetterSQLite3Database<typeof schema>) {}

  async createSignup(data: { email: string; strategy: string }) {
    const signupId = `sig_${nanoid()}`;

    // In a real app, you would handle strategy-specific logic
    // For now, just a placeholder
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
    // Mock successful verification
    if (code !== "123456") {
      throw new Error("Invalid verification code");
    }

    const userId = `user_${nanoid()}`;

    // Create user in tenant DB
    await this.db.insert(schema.users).values({
      id: userId,
      status: "active",
    });

    await this.db.insert(schema.emailAddresses).values({
      id: `email_${nanoid()}`,
      userId,
      emailAddress: "pending@example.com", // Should come from signup state
      verificationStatus: "verified",
    });

    return { userId };
  }
}
