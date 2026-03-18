import { Router } from "express";
import * as invitationController from "../controllers/invitation.controller";
import { authMiddleware } from "../../middleware/auth";

const router = Router();

// Flat invitation routes (matching OpenAPI spec)
// These delegate to the same controllers as the nested org routes

router.get("/invitations", authMiddleware, (req, res) => {
  req.params.organization_id = req.query.organization_id as string;
  invitationController.listInvitations(req, res);
});

router.post("/invitations", authMiddleware, (req, res) => {
  req.params.organization_id = req.body.organization_id;
  // Map frontend field name "email" to backend "email_address"
  req.body.email_address = req.body.email_address || req.body.email;
  invitationController.createInvitation(req, res);
});

router.post("/invitations/:id/revoke", authMiddleware, (req, res) => {
  invitationController.revokeInvitation(req, res);
});

export { router as invitationRoutes };
