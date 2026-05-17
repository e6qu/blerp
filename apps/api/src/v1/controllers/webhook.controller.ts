import { Request, Response } from "express";
import { WebhookService } from "../services/webhook.service";

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
function projectIdForOp(req: Request, fallback?: string): string {
  if (req.m2m && !req.m2m.clientId.startsWith("dev-shim:")) {
    return req.m2m.projectId;
  }
  return fallback ?? "default";
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
  const { url, events, event_types, project_id } = req.body;
  const service = new WebhookService(req.tenantDb!);
  const projectId = projectIdForOp(req, project_id ?? "default");

  try {
    const webhook = await service.create(projectId, { url, eventTypes: events || event_types });
    res.status(201).json(mapWebhook(webhook as DBWebhook));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function listWebhooks(req: Request, res: Response) {
  const service = new WebhookService(req.tenantDb!);
  const projectId = projectIdForOp(req);

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
  const projectId = projectIdForOp(req);

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
  const data = req.body;
  const service = new WebhookService(req.tenantDb!);
  const projectId = projectIdForOp(req);

  try {
    const webhook = await service.update(projectId, id, data);
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
  const projectId = projectIdForOp(req);

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
  const projectId = projectIdForOp(req);

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
