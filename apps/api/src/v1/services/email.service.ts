import { nanoid } from "nanoid";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";
import { eq, and } from "drizzle-orm";

export class EmailService {
  constructor(
    private db: BetterSQLite3Database<typeof schema>,
    private tenantId: string,
  ) {}

  async listEmails(userId: string) {
    return this.db.query.emailAddresses.findMany({
      where: eq(schema.emailAddresses.userId, userId),
    });
  }

  async getEmail(userId: string, emailId: string) {
    return this.db.query.emailAddresses.findFirst({
      where: and(eq(schema.emailAddresses.id, emailId), eq(schema.emailAddresses.userId, userId)),
    });
  }

  async addEmail(userId: string, email: string) {
    const existing = await this.db.query.emailAddresses.findFirst({
      where: eq(schema.emailAddresses.emailAddress, email.toLowerCase()),
    });

    if (existing) {
      throw new Error("Email address already in use");
    }

    const id = `email_${nanoid()}`;
    await this.db.insert(schema.emailAddresses).values({
      id,
      userId,
      emailAddress: email.toLowerCase(),
      verificationStatus: "unverified",
    });

    return this.getEmail(userId, id);
  }

  async deleteEmail(userId: string, emailId: string) {
    const email = await this.getEmail(userId, emailId);
    if (!email) {
      throw new Error("Email address not found");
    }

    await this.db.delete(schema.emailAddresses).where(eq(schema.emailAddresses.id, emailId));
  }

  async setPrimaryEmail(userId: string, emailId: string) {
    const email = await this.getEmail(userId, emailId);
    if (!email) {
      throw new Error("Email address not found");
    }

    if (email.verificationStatus !== "verified") {
      throw new Error("Email address must be verified before setting as primary");
    }

    await this.db
      .update(schema.users)
      .set({ primaryEmailAddressId: emailId, updatedAt: new Date() })
      .where(eq(schema.users.id, userId));

    return email;
  }
}
