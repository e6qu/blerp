import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";
import { eq } from "drizzle-orm";
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
}
