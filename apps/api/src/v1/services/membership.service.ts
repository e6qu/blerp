import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export class MembershipService {
  constructor(private db: BetterSQLite3Database<typeof schema>) {}

  async create(organizationId: string, data: { userId: string; role: string }) {
    const id = `mem_${nanoid()}`;
    await this.db.insert(schema.memberships).values({
      id,
      organizationId,
      userId: data.userId,
      role: data.role,
    });
    return this.get(id);
  }

  async list(organizationId: string) {
    return this.db.query.memberships.findMany({
      where: eq(schema.memberships.organizationId, organizationId),
      with: {
        user: true,
      },
    });
  }

  async get(id: string) {
    return this.db.query.memberships.findFirst({
      where: eq(schema.memberships.id, id),
      with: {
        user: true,
      },
    });
  }

  async update(id: string, data: { role: string }) {
    await this.db
      .update(schema.memberships)
      .set({ role: data.role, updatedAt: new Date() })
      .where(eq(schema.memberships.id, id));
    return this.get(id);
  }

  async delete(id: string) {
    await this.db.delete(schema.memberships).where(eq(schema.memberships.id, id));
  }

  async leaveOrganization(organizationId: string, userId: string) {
    const membership = await this.db.query.memberships.findFirst({
      where: and(
        eq(schema.memberships.organizationId, organizationId),
        eq(schema.memberships.userId, userId),
      ),
    });
    if (!membership) {
      throw new Error("Membership not found");
    }

    if (membership.role === "owner") {
      const owners = await this.db.query.memberships.findMany({
        where: and(
          eq(schema.memberships.organizationId, organizationId),
          eq(schema.memberships.role, "owner"),
        ),
      });
      if (owners.length <= 1) {
        throw new Error(
          "Cannot leave organization — you are the last owner. Transfer ownership first.",
        );
      }
    }

    await this.db.delete(schema.memberships).where(eq(schema.memberships.id, membership.id));
  }
}
