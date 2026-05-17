import { Router } from "express";
import * as webhookController from "../controllers/webhook.controller";
import { authMiddleware, requireM2M } from "../../middleware/auth";

const router = Router();

// BUG-156 (codex r37): webhook admin routes are M2M-only (matches
// Clerk: webhook endpoint mgmt is SecretKey-only). Pre-fix any
// tenant session could create / list / update / delete webhook
// endpoints — list responses even leak the signing `secret`. Scope:
// `webhooks:read` for GET, `webhooks:write` for create/update/delete.
const webhooksRead = requireM2M("webhooks:read");
const webhooksWrite = requireM2M("webhooks:write");

router.post("/webhooks/endpoints", authMiddleware, webhooksWrite, webhookController.createWebhook);
router.get("/webhooks/endpoints", authMiddleware, webhooksRead, webhookController.listWebhooks);
router.get(
  "/webhooks/endpoints/:endpoint_id",
  authMiddleware,
  webhooksRead,
  webhookController.getWebhook,
);
router.patch(
  "/webhooks/endpoints/:endpoint_id",
  authMiddleware,
  webhooksWrite,
  webhookController.updateWebhook,
);
router.delete(
  "/webhooks/endpoints/:endpoint_id",
  authMiddleware,
  webhooksWrite,
  webhookController.deleteWebhook,
);
router.get(
  "/webhooks/endpoints/:endpoint_id/deliveries",
  authMiddleware,
  webhooksRead,
  webhookController.listDeliveries,
);

export { router as webhookRoutes };
