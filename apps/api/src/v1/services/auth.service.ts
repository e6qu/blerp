import { nanoid } from "nanoid";
import { eventBus } from "../../lib/events";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { deepMerge, Metadata } from "../../lib/metadata";

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

  async attemptSignup(signupId: string, code: string, email: string = "pending@example.com") {
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
      emailAddress: email,
      verificationStatus: "verified",
    });

    // Domain Auto-enrollment
    const domain = email.split("@")[1];
    if (domain) {
      const verifiedDomain = await this.db.query.organizationDomains.findFirst({
        where: and(
          eq(schema.organizationDomains.domain, domain),
          eq(schema.organizationDomains.verificationStatus, "verified"),
        ),
      });

      if (verifiedDomain) {
        await this.db.insert(schema.memberships).values({
          id: `mem_${nanoid()}`,
          organizationId: verifiedDomain.organizationId,
          userId,
          role: "member",
        });
      }
    }

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
    data: { publicMetadata?: Metadata; privateMetadata?: Metadata; unsafeMetadata?: Metadata },
  ) {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const updateData: Partial<typeof schema.users.$inferInsert> = { updatedAt: new Date() };

    if (data.publicMetadata) {
      updateData.publicMetadata = deepMerge(
        (user.publicMetadata as Metadata) || {},
        data.publicMetadata,
      );
    }
    if (data.privateMetadata) {
      updateData.privateMetadata = deepMerge(
        (user.privateMetadata as Metadata) || {},
        data.privateMetadata,
      );
    }
    if (data.unsafeMetadata) {
      updateData.unsafeMetadata = deepMerge(
        (user.unsafeMetadata as Metadata) || {},
        data.unsafeMetadata,
      );
    }

    await this.db.update(schema.users).set(updateData).where(eq(schema.users.id, userId));

    return this.getUser(userId);
  }

  async listUsers(filters: {
    email?: string;
    status?: "active" | "inactive" | "banned";
    metadataKey?: string;
    metadataValue?: string;
    limit?: number;
    cursor?: string;
  }) {
    const { status, metadataKey, metadataValue, limit = 20 } = filters;

    const whereClauses = [];

    if (status) {
      whereClauses.push(eq(schema.users.status, status));
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
