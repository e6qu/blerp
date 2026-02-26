import { Router } from "express";
import * as organizationController from "../controllers/organization.controller";
import * as membershipController from "../controllers/membership.controller";
import * as invitationController from "../controllers/invitation.controller";
import { authMiddleware } from "../../middleware/auth";
import { requirePermission } from "../../middleware/rbac";

const router = Router();

// Organizations
router.post("/organizations", organizationController.createOrganization);
router.get("/organizations", organizationController.listOrganizations);

// Resource-specific routes with RBAC
router.get(
  "/organizations/:organization_id",
  authMiddleware,
  requirePermission("org:read"),
  organizationController.getOrganization,
);
router.patch(
  "/organizations/:organization_id",
  authMiddleware,
  requirePermission("org:write"),
  organizationController.updateOrganization,
);
router.delete(
  "/organizations/:organization_id",
  authMiddleware,
  requirePermission("org:write"),
  organizationController.deleteOrganization,
);

// Memberships
router.post(
  "/organizations/:organization_id/memberships",
  authMiddleware,
  requirePermission("members:write"),
  membershipController.createMembership,
);
router.get(
  "/organizations/:organization_id/memberships",
  authMiddleware,
  requirePermission("members:read"),
  membershipController.listMemberships,
);
router.patch(
  "/organizations/:organization_id/memberships/:id",
  authMiddleware,
  requirePermission("members:write"),
  membershipController.updateMembership,
);
router.delete(
  "/organizations/:organization_id/memberships/:id",
  authMiddleware,
  requirePermission("members:write"),
  membershipController.deleteMembership,
);

// Invitations
router.post(
  "/organizations/:organization_id/invitations",
  authMiddleware,
  requirePermission("invitations:write"),
  invitationController.createInvitation,
);
router.get(
  "/organizations/:organization_id/invitations",
  authMiddleware,
  requirePermission("invitations:read"),
  invitationController.listInvitations,
);
router.post(
  "/organizations/:organization_id/invitations/:id/revoke",
  authMiddleware,
  requirePermission("invitations:write"),
  invitationController.revokeInvitation,
);

export { router as organizationRoutes };
