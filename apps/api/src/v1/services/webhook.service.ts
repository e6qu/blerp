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
// unmanageable — admins couldn't list/get/update/delete them even
// though the worker (BUG-182) still delivered events.
//
// BUG-241 (codex r81): only tenant-root callers get the `'default'`
// wildcard. Pre-r81 every project-scoped admin call also saw the
// `'default'` bucket — which meant a project-A `webhooks:read` token
// could read every other project's legacy endpoints INCLUDING their
// signing secrets (mapWebhook returns `secret`). The migration moves
// ALL legacy endpoints into that bucket, so the leak covered the
// entire tenant. Restrict the wildcard to tenant-root credentials
// (the controller passes `includeDefault: true` only when
// `isTenantRootM2M(req)`); project-scoped callers see only their own
// project's endpoints and must edit each legacy row to their real
// `project_id` to manage it.
function projectIdMatch(projectId: string, includeDefault: boolean) {
  if (projectId === "default") {
    return eq(schema.webhookEndpoints.projectId, "default");
  }
  if (includeDefault) {
    return or(
      eq(schema.webhookEndpoints.projectId, projectId),
      eq(schema.webhookEndpoints.projectId, "default"),
    );
  }
  return eq(schema.webhookEndpoints.projectId, projectId);
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

  async list(projectId: string, includeDefault = false) {
    return this.db
      .select()
      .from(schema.webhookEndpoints)
      .where(projectIdMatch(projectId, includeDefault));
  }

  async get(projectId: string, id: string, includeDefault = false) {
    return this.db.query.webhookEndpoints.findFirst({
      where: and(eq(schema.webhookEndpoints.id, id), projectIdMatch(projectId, includeDefault)),
    });
  }

  async update(
    projectId: string,
    id: string,
    data: Partial<{ url: string; enabled: boolean; eventTypes: string[] }>,
    includeDefault = false,
  ) {
    const existing = await this.get(projectId, id, includeDefault);
    if (!existing) return null;
    await this.db
      .update(schema.webhookEndpoints)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.webhookEndpoints.id, id));

    return this.get(projectId, id, includeDefault);
  }

  async delete(projectId: string, id: string, includeDefault = false): Promise<boolean> {
    const existing = await this.get(projectId, id, includeDefault);
    if (!existing) return false;
    await this.db.delete(schema.webhookEndpoints).where(eq(schema.webhookEndpoints.id, id));
    return true;
  }

  async listDeliveries(
    projectId: string,
    endpointId: string,
    options?: { limit?: number; offset?: number; includeDefault?: boolean },
  ) {
    const endpoint = await this.get(projectId, endpointId, options?.includeDefault ?? false);
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
