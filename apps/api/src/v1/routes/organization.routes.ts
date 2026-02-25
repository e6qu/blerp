import { Router } from "express";
import * as organizationController from "../controllers/organization.controller";
import * as membershipController from "../controllers/membership.controller";
import * as invitationController from "../controllers/invitation.controller";

const router = Router();

router.post("/organizations", organizationController.createOrganization);
router.get("/organizations", organizationController.listOrganizations);
router.get("/organizations/:organization_id", organizationController.getOrganization);
router.patch("/organizations/:organization_id", organizationController.updateOrganization);
router.delete("/organizations/:organization_id", organizationController.deleteOrganization);

// Memberships
router.post("/organizations/:organization_id/memberships", membershipController.createMembership);
router.get("/organizations/:organization_id/memberships", membershipController.listMemberships);
router.patch(
  "/organizations/:organization_id/memberships/:id",
  membershipController.updateMembership,
);
router.delete(
  "/organizations/:organization_id/memberships/:id",
  membershipController.deleteMembership,
);

// Invitations
router.post("/organizations/:organization_id/invitations", invitationController.createInvitation);
router.get("/organizations/:organization_id/invitations", invitationController.listInvitations);
router.post(
  "/organizations/:organization_id/invitations/:id/revoke",
  invitationController.revokeInvitation,
);

export { router as organizationRoutes };
