/* eslint-disable @typescript-eslint/no-explicit-any */
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface SCIMUser {
  schemas: string[];
  id: string;
  userName: string;
  name?: {
    givenName?: string;
    familyName?: string;
  };
  emails: {
    value: string;
    type: string;
    primary: boolean;
  }[];
  active: boolean;
}

export class SCIMService {
  constructor(private db: BetterSQLite3Database<typeof schema>) {}

  async createUser(data: any): Promise<SCIMUser> {
    const userId = `user_${nanoid()}`;
    const email = data.emails?.[0]?.value;

    await this.db.insert(schema.users).values({
      id: userId,
      firstName: data.name?.givenName,
      lastName: data.name?.familyName,
      status: data.active ? "active" : "inactive",
    });

    if (email) {
      await this.db.insert(schema.emailAddresses).values({
        id: `email_${nanoid()}`,
        userId,
        emailAddress: email,
        verificationStatus: "verified",
      });
    }

    return this.getUser(userId) as Promise<SCIMUser>;
  }

  async getUser(id: string): Promise<SCIMUser | null> {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, id),
      with: {
        emailAddresses: true,
      },
    });

    if (!user) return null;

    return {
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
      id: user.id,
      userName: user.emailAddresses[0]?.emailAddress || user.id,
      name: {
        givenName: user.firstName || undefined,
        familyName: user.lastName || undefined,
      },
      emails: user.emailAddresses.map((e) => ({
        value: e.emailAddress,
        type: "work",
        primary: true,
      })),
      active: user.status === "active",
    };
  }

  async listUsers() {
    const users = await this.db.query.users.findMany({
      with: {
        emailAddresses: true,
      },
    });

    return {
      schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
      totalResults: users.length,
      Resources: await Promise.all(users.map((u) => this.getUser(u.id))),
    };
  }

  async deleteUser(id: string) {
    await this.db.delete(schema.users).where(eq(schema.users.id, id));
  }
}
