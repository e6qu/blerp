import { Router } from "express";
import * as scimController from "../controllers/scim.controller";
import { tenantMiddleware } from "../../middleware/tenant";

const router = Router();

// SCIM 2.0 endpoints
// Usually SCIM expects Bearer token (Secret Key) and tenant context
router.use(tenantMiddleware);

router.get("/Users", scimController.listUsers);
router.post("/Users", scimController.createUser);
router.get("/Users/:id", scimController.getUser);
router.delete("/Users/:id", scimController.deleteUser);

export { router as scimRoutes };
