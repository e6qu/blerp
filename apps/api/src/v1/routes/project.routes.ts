import { Router, type Request } from "express";
import * as projectController from "../controllers/project.controller";
import { authMiddleware, requireProjectAccess } from "../../middleware/auth";

const router = Router();

// BUG-144 (codex r31): all project + API-key admin routes are now
// gated on `requireProjectAccess` so only the project owner (or a
// project-scoped M2M token) can manage them. Pre-fix any signed-in
// user could create/rotate/revoke API keys (including SECRET keys)
// for any project — instant lateral movement across tenants.
//
// BUG-188 (codex r52): also require an explicit scope on the M2M
// branch. Pre-r52 any M2M with a matching project_id passed, so a
// `webhooks:read` token could rotate API keys or delete the project.
// Project-owner sessions still pass (full project authority); only
// M2M tokens need the scope.
const fromParams = (req: Request): string | undefined =>
  typeof req.params.project_id === "string" ? req.params.project_id : undefined;

// BUG-168 (codex r43): GET also needs project access — pre-fix any
// signed-in tenant user could read another project's config.
router.get(
  "/projects/:project_id",
  authMiddleware,
  requireProjectAccess(fromParams, "projects:read"),
  projectController.getProject,
);
router.put(
  "/projects/:project_id",
  authMiddleware,
  requireProjectAccess(fromParams, "projects:write"),
  projectController.updateProject,
);
router.delete(
  "/projects/:project_id",
  authMiddleware,
  requireProjectAccess(fromParams, "projects:write"),
  projectController.deleteProject,
);

// API Keys — mutate paths are credential-issuing, so they need
// `api_keys:write`. Read can use `api_keys:read` so a read-only
// audit token can list (without secrets — see the controller).
router.get(
  "/projects/:project_id/keys",
  authMiddleware,
  requireProjectAccess(fromParams, "api_keys:read"),
  projectController.listApiKeys,
);
router.post(
  "/projects/:project_id/keys",
  authMiddleware,
  requireProjectAccess(fromParams, "api_keys:write"),
  projectController.createApiKey,
);
router.post(
  "/projects/:project_id/keys/:key_id/rotate",
  authMiddleware,
  requireProjectAccess(fromParams, "api_keys:write"),
  projectController.rotateApiKey,
);
router.delete(
  "/projects/:project_id/keys/:key_id",
  authMiddleware,
  requireProjectAccess(fromParams, "api_keys:write"),
  projectController.revokeApiKey,
);

export { router as projectRoutes };
