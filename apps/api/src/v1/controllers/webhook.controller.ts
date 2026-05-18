import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { WebhookService } from "../services/webhook.service";
import * as schema from "../../db/schema";
import { isTenantRootM2M } from "../../middleware/auth";

interface DBWebhook {
  id: string;
  projectId: string;
  url: string;
  secret: string;
  enabled: boolean;
  eventTypes: string[];
  createdAt: Date | null;
  updatedAt: Date | null;
}

// BUG-162 (codex r40): all webhook routes are gated by
// `requireM2M("webhooks:*")` (BUG-156). The token's `project_id` is
// the scope every read/write uses. The dev X-User-Id shim's
// project_id "dev-shim" is treated as a wildcard so legacy / tests
// keep working — we honor whatever project the request supplies via
// `req.body.project_id` (create only) for the shim, falling back to
// "default" so existing data without project_id remains accessible.
//
// BUG-229 (codex r72): BUG-226 admits session tenant admins on these
// routes. Sessions have no `req.m2m`, so the pre-r72 helper returned
// "default" for them — dashboard only saw legacy / default-bucket
// endpoints and couldn't manage real-project endpoints. Derive the
// scope from the session user's first owned project (same pattern as
// BUG-212's <CreateOrganization>). Explicit `project_id` in the body
// (create path) still wins.
//
// BUG-230 (codex r73): explicit `project_id` from the caller — either
// body (create) or `?project_id=` query (read/update/delete) — wins
// for callers with multi-project authority.
//
// BUG-232 (codex r74): scoped M2M tokens MUST NOT be able to override
// their bound project via body / query. Pre-r74's explicit-first
// ordering let a project-A `webhooks:read` token pass
// `?project_id=proj_B` and read project-B's signing secrets. Now:
// real project-scoped M2M (non-dev-shim, non-tenant-root) stays
// pinned to `req.m2m.projectId` — the body/query is ignored. Only
// tenant-root credentials (sk_ via BUG-195, M2M with tenant-wide
// `:admin` scope via BUG-186/207) and dev-shim/session callers can
// supply an override.
async function projectIdForOp(req: Request, fallback?: string): Promise<string> {
  // Project-scoped M2M is BOUND to its project. Refuse override.
  if (
    req.m2m &&
    !req.m2m.clientId.startsWith("dev-shim") &&
    !isTenantRootM2M(req, { devShimIsTenantRoot: false })
  ) {
    return req.m2m.projectId;
  }
  // Tenant-root / dev-shim / session: honor caller-supplied project.
  const explicit =
    fallback ??
    (typeof req.body?.project_id === "string" ? req.body.project_id : undefined) ??
    (typeof req.query?.project_id === "string" ? req.query.project_id : undefined);
  if (explicit) return explicit;
  // No explicit project. Tenant-root M2M defaults to its bound
  // project (api keys are minted under a real project); session
  // tenant admin → first owned project; dev-shim → "default".
  if (req.m2m && !req.m2m.clientId.startsWith("dev-shim")) {
    return req.m2m.projectId;
  }
  if (req.user && req.tenantDb) {
    const owned = await req.tenantDb.query.projects.findFirst({
      where: eq(schema.projects.ownerUserId, req.user.id),
    });
    if (owned) return owned.id;
  }
  return "default";
}

function mapWebhook(w: DBWebhook) {
  return {
    id: w.id,
    project_id: w.projectId,
    url: w.url,
    secret: w.secret,
    events: w.eventTypes,
    status: w.enabled ? "active" : "paused",
    created_at: w.createdAt?.toISOString(),
  };
}

export async function createWebhook(req: Request, res: Response) {
  const { url, events, event_types } = req.body;
  const service = new WebhookService(req.tenantDb!);
  // BUG-230 (codex r73): projectIdForOp now reads body.project_id /
  // query.project_id itself with precedence over derivation, so
  // there's no need to pass the body value as a fallback (which would
  // shadow query-based callers).
  const projectId = await projectIdForOp(req);

  try {
    const webhook = await service.create(projectId, { url, eventTypes: events || event_types });
    res.status(201).json(mapWebhook(webhook as DBWebhook));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function listWebhooks(req: Request, res: Response) {
  const service = new WebhookService(req.tenantDb!);
  const projectId = await projectIdForOp(req);

  try {
    const webhooks = await service.list(projectId);
    res.status(200).json({ data: webhooks.map((w) => mapWebhook(w as DBWebhook)) });
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function getWebhook(req: Request, res: Response) {
  const id = (req.params.endpoint_id || req.params.id) as string;
  const service = new WebhookService(req.tenantDb!);
  const projectId = await projectIdForOp(req);

  try {
    const webhook = await service.get(projectId, id);
    if (!webhook) {
      res.status(404).json({ error: { message: "Webhook not found" } });
      return;
    }
    res.status(200).json(mapWebhook(webhook as DBWebhook));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function updateWebhook(req: Request, res: Response) {
  const id = (req.params.endpoint_id || req.params.id) as string;
  const service = new WebhookService(req.tenantDb!);
  const projectId = await projectIdForOp(req);

  // BUG-164 (codex r41): only allow updates to the documented fields.
  // Spreading raw req.body into service.update let a caller include
  // `projectId` in the body and move their endpoint into a different
  // project (the scoped pre-check still found it in their project,
  // then the .set({...data}) overwrote project_id during the same SQL
  // statement). Now we extract a fixed allow-list.
  const body = req.body as Partial<{
    url?: string;
    enabled?: boolean;
    events?: string[];
    event_types?: string[];
  }>;
  const safe: Partial<{ url: string; enabled: boolean; eventTypes: string[] }> = {};
  if (typeof body.url === "string") safe.url = body.url;
  if (typeof body.enabled === "boolean") safe.enabled = body.enabled;
  const eventTypes = body.events ?? body.event_types;
  if (Array.isArray(eventTypes)) safe.eventTypes = eventTypes;

  try {
    const webhook = await service.update(projectId, id, safe);
    if (!webhook) {
      res.status(404).json({ error: { message: "Webhook not found" } });
      return;
    }
    res.status(200).json(mapWebhook(webhook as DBWebhook));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function deleteWebhook(req: Request, res: Response) {
  const id = (req.params.endpoint_id || req.params.id) as string;
  const service = new WebhookService(req.tenantDb!);
  const projectId = await projectIdForOp(req);

  try {
    const ok = await service.delete(projectId, id);
    if (!ok) {
      res.status(404).json({ error: { message: "Webhook not found" } });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function listDeliveries(req: Request, res: Response) {
  const endpointId = req.params.endpoint_id as string;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
  const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
  const service = new WebhookService(req.tenantDb!);
  const projectId = await projectIdForOp(req);

  try {
    const deliveries = await service.listDeliveries(projectId, endpointId, { limit, offset });
    res.json({
      data: deliveries.map((d) => ({
        id: d.id,
        endpoint_id: d.endpointId,
        event_type: d.eventType,
        status: d.status,
        http_status: d.httpStatus,
        error_message: d.errorMessage,
        attempt_number: d.attemptNumber,
        delivered_at: d.deliveredAt?.toISOString(),
      })),
    });
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
