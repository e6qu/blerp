import { Router } from "express";
import * as scimController from "../controllers/scim.controller";
import { tenantMiddleware } from "../../middleware/tenant";
import { authMiddleware, requireM2M } from "../../middleware/auth";

const router = Router();

// SCIM 2.0 endpoints — BUG-165 (codex r42): pre-fix only
// tenantMiddleware applied, so any caller supplying `X-Tenant-Id`
// could list / create / read / delete SCIM users without auth.
// Per the SCIM 2.0 RFCs and Clerk parity, these are SecretKey-only.
// `users:read` for GET, `users:write` for POST/DELETE matches the
// scope split already used by /v1/users (BUG-147).
router.use(tenantMiddleware);

router.get("/Users", authMiddleware, requireM2M("users:read"), scimController.listUsers);
router.post("/Users", authMiddleware, requireM2M("users:write"), scimController.createUser);
router.get("/Users/:id", authMiddleware, requireM2M("users:read"), scimController.getUser);
router.delete("/Users/:id", authMiddleware, requireM2M("users:write"), scimController.deleteUser);

export { router as scimRoutes };
