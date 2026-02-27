import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { eventBus } from "../../lib/events";
import * as schema from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { deepMerge, Metadata } from "../../lib/metadata";

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

  async list(filters?: { domain?: string }) {
    if (filters?.domain) {
      const results = await this.db
        .select({ organization: schema.organizations })
        .from(schema.organizations)
        .innerJoin(
          schema.organizationDomains,
          eq(schema.organizations.id, schema.organizationDomains.organizationId),
        )
        .where(
          and(
            eq(schema.organizationDomains.domain, filters.domain),
            eq(schema.organizationDomains.verificationStatus, "verified"),
          ),
        );
      return results.map((r) => r.organization);
    }
    return this.db.select().from(schema.organizations);
  }

  async get(id: string) {
    return this.db.query.organizations.findFirst({
      where: eq(schema.organizations.id, id),
    });
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      publicMetadata: Metadata;
      privateMetadata: Metadata;
    }>,
  ) {
    const org = await this.get(id);
    if (!org) throw new Error("Organization not found");

    const updateData: Partial<typeof schema.organizations.$inferInsert> = { updatedAt: new Date() };
    if (data.name) updateData.name = data.name;
    if (data.slug) updateData.slug = data.slug;

    if (data.publicMetadata) {
      updateData.publicMetadata = deepMerge(
        (org.publicMetadata as Metadata) || {},
        data.publicMetadata,
      );
    }
    if (data.privateMetadata) {
      updateData.privateMetadata = deepMerge(
        (org.privateMetadata as Metadata) || {},
        data.privateMetadata,
      );
    }

    await this.db
      .update(schema.organizations)
      .set(updateData)
      .where(eq(schema.organizations.id, id));

    return this.get(id);
  }

  async delete(id: string) {
    await this.db.delete(schema.organizations).where(eq(schema.organizations.id, id));
  }
}
