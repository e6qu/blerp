import { Router } from "express";
import * as webhookController from "../controllers/webhook.controller";
import { authMiddleware, requireScopeOrTenantAdmin } from "../../middleware/auth";

const router = Router();

// BUG-156 (codex r37): webhook admin routes are M2M-only (matches
// Clerk: webhook endpoint mgmt is SecretKey-only). Pre-fix any
// tenant session could create / list / update / delete webhook
// endpoints — list responses even leak the signing `secret`. Scope:
// `webhooks:read` for GET, `webhooks:write` for create/update/delete.
//
// BUG-226 (codex r71): admit session tenant admins (project owners,
// see BUG-209 / BUG-218) here too. The in-repo dashboard's
// `useWebhooks` / `useCreateWebhook` / `useDeleteWebhook` /
// `useWebhookDeliveries` hooks send the user's session JWT — they
// have no M2M token in the browser. Pre-r71 the dashboard's
// Webhooks UI 403'd in production (masked in dev by the X-User-Id
// shim). `requireScopeOrTenantAdmin` admits both an M2M with the
// scope AND a session user who owns every project in the tenant.
const webhooksRead = requireScopeOrTenantAdmin("webhooks:read");
const webhooksWrite = requireScopeOrTenantAdmin("webhooks:write");

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
