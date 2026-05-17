import { Router, type Request, type Response, type NextFunction } from "express";
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

// BUG-158 (codex r38): set `req.params.organization_id` BEFORE
// authMiddleware so authMiddleware can load `req.membership` for the
// session-RBAC path. The previous order ran authMiddleware first with
// an empty organization_id, so req.membership stayed unset and
// requirePermission's session path rejected every caller — flat
// invitations were effectively M2M-only.
const projectOrgIdFromQuery = (req: Request, _res: Response, next: NextFunction) => {
  if (typeof req.query.organization_id === "string") {
    req.params.organization_id = req.query.organization_id;
  }
  next();
};
const projectOrgIdFromBody = (req: Request, _res: Response, next: NextFunction) => {
  if (typeof req.body?.organization_id === "string") {
    req.params.organization_id = req.body.organization_id;
  }
  if (req.body) {
    req.body.email_address = req.body.email_address ?? req.body.email;
  }
  next();
};

router.get(
  "/invitations",
  projectOrgIdFromQuery,
  authMiddleware,
  requirePermission("invitations:read"),
  (req, res) => {
    invitationController.listInvitations(req, res);
  },
);

router.post(
  "/invitations",
  projectOrgIdFromBody,
  authMiddleware,
  requirePermission("invitations:write"),
  (req, res) => {
    invitationController.createInvitation(req, res);
  },
);

// BUG-157 (codex r38): the controller now verifies that the
// invitation belongs to the org from path/body/query before revoking,
// so cross-org revoke is impossible even via this flat route. The
// caller must supply `organization_id` in body or query; the
// controller 400s otherwise.
router.post(
  "/invitations/:id/revoke",
  (req: Request, _res: Response, next: NextFunction) => {
    if (typeof req.body?.organization_id === "string") {
      req.params.organization_id = req.body.organization_id;
    } else if (typeof req.query?.organization_id === "string") {
      req.params.organization_id = req.query.organization_id;
    }
    next();
  },
  authMiddleware,
  requirePermission("invitations:write"),
  (req, res) => {
    invitationController.revokeInvitation(req, res);
  },
);

export { router as invitationRoutes };
