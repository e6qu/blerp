import { Request, Response } from "express";
import { WebhookService } from "../services/webhook.service";

interface DBWebhook {
  id: string;
  url: string;
  secret: string;
  enabled: boolean;
  eventTypes: string[];
  createdAt: Date | null;
  updatedAt: Date | null;
}

function mapWebhook(w: DBWebhook) {
  return {
    id: w.id,
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

  try {
    const webhook = await service.create({ url, eventTypes: events || event_types });
    res.status(201).json(mapWebhook(webhook as DBWebhook));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function listWebhooks(req: Request, res: Response) {
  const service = new WebhookService(req.tenantDb!);

  try {
    const webhooks = await service.list();
    res.status(200).json({ data: webhooks.map((w) => mapWebhook(w as DBWebhook)) });
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function getWebhook(req: Request, res: Response) {
  const id = (req.params.endpoint_id || req.params.id) as string;
  const service = new WebhookService(req.tenantDb!);

  try {
    const webhook = await service.get(id);
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

  try {
    const webhook = await service.update(id, data);
    res.status(200).json(mapWebhook(webhook as DBWebhook));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function deleteWebhook(req: Request, res: Response) {
  const id = (req.params.endpoint_id || req.params.id) as string;
  const service = new WebhookService(req.tenantDb!);

  try {
    await service.delete(id);
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

  try {
    const deliveries = await service.listDeliveries(endpointId, { limit, offset });
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
