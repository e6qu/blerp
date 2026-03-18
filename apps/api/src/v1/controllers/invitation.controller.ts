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
    const invitation = await service.revoke(id);
    res.status(200).json(mapInvitation(invitation as DBInvitation));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
