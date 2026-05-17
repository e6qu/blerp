import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";
import { eq, desc, and, or } from "drizzle-orm";
import { nanoid } from "nanoid";

// BUG-162 (codex r40): every webhook admin op is project-scoped. The
// service signature takes a `projectId` that the controller passes
// from the authenticated M2M token (or dev-shim wildcard). Reads
// filter by it; writes set it on insert; updates/deletes verify the
// endpoint belongs to the project before mutating.
//
// BUG-184 (codex r50): migration 0016 stamps every pre-existing
// endpoint with `project_id = 'default'`. Production M2M tokens are
// minted for real projects (`demo-project`, `proj_xyz`, ...), never
// for `'default'`, so after the migration legacy endpoints become
// unmanageable — admins can't list/get/update/delete them even
// though the worker (BUG-182) still delivers events. Mirror BUG-182's
// wildcard pattern in the admin paths: any project-scoped admin
// caller can also see/manage `'default'`-bucket endpoints. The
// expected migration path is "list, identify, edit each to its real
// project_id once, leave the rest on `'default'` only if you actually
// want tenant-wide delivery". Per-tenant DB scoping is unaffected.
function projectIdMatch(projectId: string) {
  if (projectId === "default") {
    return eq(schema.webhookEndpoints.projectId, "default");
  }
  return or(
    eq(schema.webhookEndpoints.projectId, projectId),
    eq(schema.webhookEndpoints.projectId, "default"),
  );
}

export class WebhookService {
  constructor(private db: BetterSQLite3Database<typeof schema>) {}

  async create(projectId: string, data: { url: string; eventTypes?: string[] }) {
    const id = `wh_${nanoid()}`;
    const secret = `whsec_${nanoid(32)}`;

    await this.db.insert(schema.webhookEndpoints).values({
      id,
      projectId,
      url: data.url,
      secret,
      eventTypes: data.eventTypes || [],
    });

    return this.get(projectId, id);
  }

  async list(projectId: string) {
    return this.db.select().from(schema.webhookEndpoints).where(projectIdMatch(projectId));
  }

  async get(projectId: string, id: string) {
    return this.db.query.webhookEndpoints.findFirst({
      where: and(eq(schema.webhookEndpoints.id, id), projectIdMatch(projectId)),
    });
  }

  async update(
    projectId: string,
    id: string,
    data: Partial<{ url: string; enabled: boolean; eventTypes: string[] }>,
  ) {
    const existing = await this.get(projectId, id);
    if (!existing) return null;
    await this.db
      .update(schema.webhookEndpoints)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.webhookEndpoints.id, id));

    return this.get(projectId, id);
  }

  async delete(projectId: string, id: string): Promise<boolean> {
    const existing = await this.get(projectId, id);
    if (!existing) return false;
    await this.db.delete(schema.webhookEndpoints).where(eq(schema.webhookEndpoints.id, id));
    return true;
  }

  async listDeliveries(
    projectId: string,
    endpointId: string,
    options?: { limit?: number; offset?: number },
  ) {
    const endpoint = await this.get(projectId, endpointId);
    if (!endpoint) return [];
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;

    const deliveries = await this.db
      .select()
      .from(schema.webhookDeliveries)
      .where(eq(schema.webhookDeliveries.endpointId, endpointId))
      .orderBy(desc(schema.webhookDeliveries.deliveredAt))
      .limit(limit)
      .offset(offset);

    return deliveries;
  }
}
