import { Request, Response } from "express";
import { InvitationService } from "../services/invitation.service";

interface DBInvitation {
  id: string;
  organizationId: string;
  emailAddress: string;
  role: string;
  status: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

function mapInvitation(inv: DBInvitation) {
  return {
    id: inv.id,
    organization_id: inv.organizationId,
    email: inv.emailAddress,
    role: inv.role,
    status: inv.status,
    created_at: inv.createdAt?.toISOString(),
    updated_at: inv.updatedAt?.toISOString(),
  };
}

export async function createInvitation(req: Request, res: Response) {
  const organization_id = req.params.organization_id as string;
  const { email_address, email, role } = req.body;
  const service = new InvitationService(req.tenantDb!);

  try {
    const invitation = await service.create(organization_id, {
      emailAddress: email_address || email,
      role,
    });
    res.status(201).json(mapInvitation(invitation as DBInvitation));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function listInvitations(req: Request, res: Response) {
  const organization_id = req.params.organization_id as string;
  const service = new InvitationService(req.tenantDb!);

  try {
    const invitations = await service.list(organization_id);
    res.status(200).json({ data: invitations.map((i) => mapInvitation(i as DBInvitation)) });
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function revokeInvitation(req: Request, res: Response) {
  const id = req.params.id as string;
  const service = new InvitationService(req.tenantDb!);

  try {
    // BUG-157 (codex r38): verify the invitation belongs to the org
    // from the path BEFORE revoking. Pre-fix the controller revoked
    // by id alone, so a user with `invitations:write` in org A could
    // revoke org B's invitations by hitting org A's nested revoke
    // route with org B's invitation id (or by hitting the flat
    // /v1/invitations/:id/revoke route which has no org context at
    // all). Now: 404 when the invitation doesn't exist; 403 when it
    // belongs to a different org than the request scope.
    const existing = await service.get(id);
    if (!existing) {
      res.status(404).json({ error: { message: "Invitation not found" } });
      return;
    }
    // The nested route puts organization_id in params; the flat route
    // doesn't have it in scope, so fall back to req.body.organization_id
    // / req.query.organization_id when present, and require the request
    // to identify the org. M2M tokens with project-wide invitations:write
    // can supply the org via body/query.
    const requestedOrgId =
      (req.params.organization_id as string | undefined) ??
      (req.body?.organization_id as string | undefined) ??
      (req.query?.organization_id as string | undefined);
    if (!requestedOrgId) {
      res.status(400).json({
        error: {
          message: "organization_id is required (path, body, or query) to scope the revoke.",
        },
      });
      return;
    }
    if (existing.organizationId !== requestedOrgId) {
      res.status(403).json({
        error: { message: "Invitation does not belong to the specified organization." },
      });
      return;
    }
    const invitation = await service.revoke(id);
    res.status(200).json(mapInvitation(invitation as DBInvitation));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
