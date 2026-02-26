import { Request, Response } from "express";
import { WebhookService } from "../services/webhook.service";

export async function createWebhook(req: Request, res: Response) {
  const { url, event_types } = req.body;
  const service = new WebhookService(req.tenantDb!);

  try {
    const webhook = await service.create({ url, eventTypes: event_types });
    res.status(201).json(webhook);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function listWebhooks(req: Request, res: Response) {
  const service = new WebhookService(req.tenantDb!);

  try {
    const webhooks = await service.list();
    res.status(200).json({ data: webhooks });
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
    res.status(200).json(webhook);
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
    res.status(200).json(webhook);
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
