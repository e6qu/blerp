import { Router } from "express";
import * as webhookController from "../controllers/webhook.controller";
import { authMiddleware } from "../../middleware/auth";

const router = Router();

// Webhooks
router.post("/webhooks/endpoints", authMiddleware, webhookController.createWebhook);
router.get("/webhooks/endpoints", authMiddleware, webhookController.listWebhooks);
router.get("/webhooks/endpoints/:endpoint_id", authMiddleware, webhookController.getWebhook);
router.patch("/webhooks/endpoints/:endpoint_id", authMiddleware, webhookController.updateWebhook);
router.delete("/webhooks/endpoints/:endpoint_id", authMiddleware, webhookController.deleteWebhook);
router.get(
  "/webhooks/endpoints/:endpoint_id/deliveries",
  authMiddleware,
  webhookController.listDeliveries,
);

export { router as webhookRoutes };
