import { Router } from "express";
import * as projectController from "../controllers/project.controller";
import { authMiddleware } from "../../middleware/auth";

const router = Router();

// Project
router.get("/projects/:project_id", authMiddleware, projectController.getProject);
router.put("/projects/:project_id", authMiddleware, projectController.updateProject);
router.delete("/projects/:project_id", authMiddleware, projectController.deleteProject);

// API Keys
router.get("/projects/:project_id/keys", authMiddleware, projectController.listApiKeys);
router.post("/projects/:project_id/keys", authMiddleware, projectController.createApiKey);
router.post(
  "/projects/:project_id/keys/:key_id/rotate",
  authMiddleware,
  projectController.rotateApiKey,
);
router.delete("/projects/:project_id/keys/:key_id", authMiddleware, projectController.revokeApiKey);

export { router as projectRoutes };
