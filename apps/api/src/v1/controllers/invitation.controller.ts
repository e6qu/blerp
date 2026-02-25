import { Request, Response } from "express";
import { InvitationService } from "../services/invitation.service";

export async function createInvitation(req: Request, res: Response) {
  const { organization_id } = req.params;
  const { email_address, role } = req.body;
  const service = new InvitationService(req.tenantDb!);

  try {
    const invitation = await service.create(organization_id, { emailAddress: email_address, role });
    res.status(201).json(invitation);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function listInvitations(req: Request, res: Response) {
  const { organization_id } = req.params;
  const service = new InvitationService(req.tenantDb!);

  try {
    const invitations = await service.list(organization_id);
    res.status(200).json({ data: invitations });
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function revokeInvitation(req: Request, res: Response) {
  const { id } = req.params;
  const service = new InvitationService(req.tenantDb!);

  try {
    const invitation = await service.revoke(id);
    res.status(200).json(invitation);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
