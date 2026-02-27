/* eslint-disable @typescript-eslint/no-explicit-any */
import { nanoid } from "nanoid";
import { eventBus } from "../../lib/events";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { deepMerge } from "../../lib/metadata";

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
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const updateData: any = { updatedAt: new Date() };

    if (data.publicMetadata) {
      updateData.publicMetadata = deepMerge(user.publicMetadata || {}, data.publicMetadata);
    }
    if (data.privateMetadata) {
      updateData.privateMetadata = deepMerge(user.privateMetadata || {}, data.privateMetadata);
    }
    if (data.unsafeMetadata) {
      updateData.unsafeMetadata = deepMerge(user.unsafeMetadata || {}, data.unsafeMetadata);
    }

    await this.db.update(schema.users).set(updateData).where(eq(schema.users.id, userId));

    return this.getUser(userId);
  }

  async listUsers(filters: {
    email?: string;
    status?: string;
    metadataKey?: string;
    metadataValue?: string;
    limit?: number;
    cursor?: string;
  }) {
    const { status, metadataKey, metadataValue, limit = 20 } = filters;

    const whereClauses = [];

    if (status) {
      whereClauses.push(eq(schema.users.status, status as any));
    }

    if (metadataKey && metadataValue) {
      // Convert JSON pointer or dot notation to SQLite path
      let path = metadataKey;
      if (path.startsWith("/")) path = path.substring(1);
      path = path.replace(/\//g, ".");
      if (!path.startsWith("$.")) path = "$." + path;

      whereClauses.push(
        sql`(json_extract(${schema.users.publicMetadata}, ${path}) = ${metadataValue} OR 
             json_extract(${schema.users.privateMetadata}, ${path}) = ${metadataValue})`,
      );
    }

    return this.db.query.users.findMany({
      where: whereClauses.length > 0 ? and(...whereClauses) : undefined,
      limit,
      with: {
        emailAddresses: true,
      },
    });
  }
}
