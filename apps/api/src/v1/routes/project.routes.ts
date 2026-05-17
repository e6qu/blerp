import { Router, type Request } from "express";
import * as projectController from "../controllers/project.controller";
import { authMiddleware, requireProjectAccess } from "../../middleware/auth";

const router = Router();

// BUG-144 (codex r31): all project + API-key admin routes are now
// gated on `requireProjectAccess` so only the project owner (or a
// project-scoped M2M token) can manage them. Pre-fix any signed-in
// user could create/rotate/revoke API keys (including SECRET keys)
// for any project — instant lateral movement across tenants.
const fromParams = (req: Request): string | undefined =>
  typeof req.params.project_id === "string" ? req.params.project_id : undefined;

router.get("/projects/:project_id", authMiddleware, projectController.getProject);
router.put(
  "/projects/:project_id",
  authMiddleware,
  requireProjectAccess(fromParams),
  projectController.updateProject,
);
router.delete(
  "/projects/:project_id",
  authMiddleware,
  requireProjectAccess(fromParams),
  projectController.deleteProject,
);

// API Keys
router.get(
  "/projects/:project_id/keys",
  authMiddleware,
  requireProjectAccess(fromParams),
  projectController.listApiKeys,
);
router.post(
  "/projects/:project_id/keys",
  authMiddleware,
  requireProjectAccess(fromParams),
  projectController.createApiKey,
);
router.post(
  "/projects/:project_id/keys/:key_id/rotate",
  authMiddleware,
  requireProjectAccess(fromParams),
  projectController.rotateApiKey,
);
router.delete(
  "/projects/:project_id/keys/:key_id",
  authMiddleware,
  requireProjectAccess(fromParams),
  projectController.revokeApiKey,
);

export { router as projectRoutes };
