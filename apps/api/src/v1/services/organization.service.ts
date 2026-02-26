/* eslint-disable @typescript-eslint/no-explicit-any */
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { eventBus } from "../../lib/events";
import * as schema from "../../db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export class OrganizationService {
  constructor(
    private db: BetterSQLite3Database<typeof schema>,
    private tenantId: string,
  ) {}

  async create(data: { name: string; slug?: string; projectId: string }) {
    const id = `org_${nanoid()}`;
    const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, "-");

    await this.db.insert(schema.organizations).values({
      id,
      projectId: data.projectId,
      name: data.name,
      slug,
    });

    await eventBus.emit("organization.created", this.tenantId, { organizationId: id });
    return this.get(id);
  }

  async list() {
    return this.db.select().from(schema.organizations);
  }

  async get(id: string) {
    return this.db.query.organizations.findFirst({
      where: eq(schema.organizations.id, id),
    });
  }

  async update(
    id: string,
    data: Partial<{ name: string; slug: string; publicMetadata: any; privateMetadata: any }>,
  ) {
    await this.db
      .update(schema.organizations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.organizations.id, id));

    return this.get(id);
  }

  async delete(id: string) {
    await this.db.delete(schema.organizations).where(eq(schema.organizations.id, id));
  }
}
