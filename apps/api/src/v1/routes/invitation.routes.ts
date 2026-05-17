import { Router } from "express";
import * as invitationController from "../controllers/invitation.controller";
import { authMiddleware } from "../../middleware/auth";
import { requirePermission } from "../../middleware/rbac";

const router = Router();

// Flat invitation routes (matching OpenAPI spec)
// These delegate to the same controllers as the nested org routes.
//
// BUG-156 (codex r37): pre-fix these flat routes were on bare
// authMiddleware so any signed-in tenant user could list / create /
// revoke invitations for any organization — bypassing the
// invitations:read / invitations:write RBAC that the nested
// /v1/organizations/:id/invitations routes enforce. Now share the
// same gate. requirePermission also accepts M2M tokens carrying the
// matching scope (BUG-154 fix), so backend / Monite use cases keep
// working.
//
// The org id is moved from query/body to req.params.organization_id
// BEFORE requirePermission runs, since requirePermission reads
// req.params.organization_id to resolve membership.

router.get(
  "/invitations",
  authMiddleware,
  (req, _res, next) => {
    req.params.organization_id = req.query.organization_id as string;
    next();
  },
  requirePermission("invitations:read"),
  (req, res) => {
    invitationController.listInvitations(req, res);
  },
);

router.post(
  "/invitations",
  authMiddleware,
  (req, _res, next) => {
    req.params.organization_id = req.body.organization_id;
    req.body.email_address = req.body.email_address || req.body.email;
    next();
  },
  requirePermission("invitations:write"),
  (req, res) => {
    invitationController.createInvitation(req, res);
  },
);

router.post(
  "/invitations/:id/revoke",
  authMiddleware,
  requirePermission("invitations:write"),
  (req, res) => {
    invitationController.revokeInvitation(req, res);
  },
);

export { router as invitationRoutes };
