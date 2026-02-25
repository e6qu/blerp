import { Request, Response } from "express";
import { MembershipService } from "../services/membership.service";

export async function createMembership(req: Request, res: Response) {
  const { organization_id } = req.params;
  const { user_id, role } = req.body;
  const service = new MembershipService(req.tenantDb!);

  try {
    const membership = await service.create(organization_id, { userId: user_id, role });
    res.status(201).json(membership);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function listMemberships(req: Request, res: Response) {
  const { organization_id } = req.params;
  const service = new MembershipService(req.tenantDb!);

  try {
    const memberships = await service.list(organization_id);
    res.status(200).json({ data: memberships });
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function updateMembership(req: Request, res: Response) {
  const { id } = req.params;
  const { role } = req.body;
  const service = new MembershipService(req.tenantDb!);

  try {
    const membership = await service.update(id, { role });
    res.status(200).json(membership);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function deleteMembership(req: Request, res: Response) {
  const { id } = req.params;
  const service = new MembershipService(req.tenantDb!);

  try {
    await service.delete(id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
