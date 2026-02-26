import { Router } from "express";
import * as webhookController from "../controllers/webhook.controller";
import { authMiddleware } from "../../middleware/auth";

const router = Router();

// Webhooks
router.post("/webhooks", authMiddleware, webhookController.createWebhook);
router.get("/webhooks", authMiddleware, webhookController.listWebhooks);
router.get("/webhooks/:webhook_id", authMiddleware, webhookController.getWebhook);
router.patch("/webhooks/:webhook_id", authMiddleware, webhookController.updateWebhook);
router.delete("/webhooks/:webhook_id", authMiddleware, webhookController.deleteWebhook);

export { router as webhookRoutes };
