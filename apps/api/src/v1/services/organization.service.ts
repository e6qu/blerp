import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export class OrganizationService {
  constructor(private db: BetterSQLite3Database<typeof schema>) {}

  async create(data: { name: string; slug?: string; projectId: string }) {
    const id = `org_${nanoid()}`;
    const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, "-");

    await this.db.insert(schema.organizations).values({
      id,
      projectId: data.projectId,
      name: data.name,
      slug,
    });

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

  async update(id: string, data: Partial<{ name: string; slug: string }>) {
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
