import { Router } from "express";
import * as organizationController from "../controllers/organization.controller";

const router = Router();

router.post("/organizations", organizationController.createOrganization);
router.get("/organizations", organizationController.listOrganizations);
router.get("/organizations/:organization_id", organizationController.getOrganization);
router.patch("/organizations/:organization_id", organizationController.updateOrganization);
router.delete("/organizations/:organization_id", organizationController.deleteOrganization);

export { router as organizationRoutes };
