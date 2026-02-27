import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export class WebAuthnService {
  constructor(private db: BetterSQLite3Database<typeof schema>) {}

  async generateRegistrationOptions(userId: string) {
    // Mock options
    return {
      challenge: nanoid(),
      rp: { name: "Blerp", id: "localhost" },
      user: { id: userId, name: "user@example.com", displayName: "User" },
      pubKeyCredParams: [{ alg: -7, type: "public-key" as const }],
    };
  }

  async verifyRegistration(userId: string, credential: { id?: string }) {
    // Mock verification
    const id = `pk_${nanoid()}`;
    await this.db.insert(schema.passkeys).values({
      id,
      userId,
      name: "My Passkey",
      publicKey: "mock_public_key",
      credentialId: credential.id || nanoid(),
    });
    return { success: true };
  }

  async listPasskeys(userId: string) {
    return this.db.select().from(schema.passkeys).where(eq(schema.passkeys.userId, userId));
  }

  async deletePasskey(userId: string, id: string) {
    await this.db.delete(schema.passkeys).where(eq(schema.passkeys.id, id));
  }
}
