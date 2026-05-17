import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { eventBus } from "../../lib/events";
import * as schema from "../../db/schema";
import { eq, and, count, like, or } from "drizzle-orm";
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

    // BUG-166 (codex r41+r42): pass project_id so the webhook worker
    // can route this event only to endpoints in this project. Without
    // it the worker fell through to the "default" bucket and the
    // event went to the wrong project's endpoints.
    await eventBus.emit(
      "organization.created",
      this.tenantId,
      { organizationId: id },
      data.projectId,
    );
    return this.get(id);
  }

  async list(filters?: {
    domain?: string;
    query?: string;
    // BUG-170 (codex r44): scope the list to a project. The route's
    // requireProjectAccess gate validated the caller's access to the
    // requested project but the service then ignored it — anyone with
    // access to ANY project could list ALL projects' orgs.
    projectId?: string;
    limit?: number;
    offset?: number;
  }) {
    const limit = filters?.limit ?? 20;
    const offset = filters?.offset ?? 0;

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
      return { data: results.map((r) => r.organization), totalCount: results.length };
    }

    const conditions: ReturnType<typeof eq>[] = [];
    if (filters?.projectId) {
      conditions.push(eq(schema.organizations.projectId, filters.projectId));
    }
    if (filters?.query) {
      const pattern = `%${filters.query}%`;
      conditions.push(
        or(like(schema.organizations.name, pattern), like(schema.organizations.slug, pattern))!,
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await this.db
      .select({ total: count() })
      .from(schema.organizations)
      .where(whereClause);
    const totalCount = totalResult?.total ?? 0;

    const data = await this.db
      .select()
      .from(schema.organizations)
      .where(whereClause)
      .limit(limit)
      .offset(offset);
    return { data, totalCount };
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
