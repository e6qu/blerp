import { Router, type Request, type Response, type NextFunction } from "express";
import { eq } from "drizzle-orm";
import * as invitationController from "../controllers/invitation.controller";
import { authMiddleware } from "../../middleware/auth";
import { requirePermission } from "../../middleware/rbac";
import * as schema from "../../db/schema";

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
// so cross-org revoke is impossible even via this flat route.
// BUG-196 (codex r55): backend SDK calls `revokeInvitation(id)`
// without an explicit org id. The controller falls back to the
// invitation row's own `organizationId` for the auth check.
// BUG-210 (codex r61): the dashboard also calls flat-revoke with
// an empty body — but the session-RBAC path needs
// `req.params.organization_id` to be set BEFORE `authMiddleware`
// runs so authMiddleware can load `req.membership`. When the
// caller doesn't supply an org id, load the invitation here and
// thread its org_id into params before auth. Best-effort: a
// missing invitation falls through to the controller's 404.
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
  async (req: Request, _res: Response, next: NextFunction) => {
    if (req.params.organization_id) return next();
    const inviteId = req.params.id;
    if (typeof inviteId !== "string") return next();
    try {
      const invitation = await req.tenantDb!.query.invitations.findFirst({
        where: eq(schema.invitations.id, inviteId),
      });
      if (invitation) {
        req.params.organization_id = invitation.organizationId;
      }
    } catch {
      // Best-effort — let the controller surface the 404 with the
      // proper error envelope if the invitation is missing.
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
