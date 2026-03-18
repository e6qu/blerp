import { Request, Response } from "express";
import { MembershipService } from "../services/membership.service";

interface DBUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  [key: string]: unknown;
}

interface DBMembership {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  user?: DBUser;
}

function mapMembership(m: DBMembership) {
  return {
    id: m.id,
    organization_id: m.organizationId,
    user_id: m.userId,
    role: m.role,
    created_at: m.createdAt?.toISOString(),
    updated_at: m.updatedAt?.toISOString(),
    ...(m.user
      ? {
          user: {
            id: m.user.id,
            first_name: m.user.firstName,
            last_name: m.user.lastName,
            image_url: m.user.imageUrl,
          },
        }
      : {}),
  };
}

export async function createMembership(req: Request, res: Response) {
  const organization_id = req.params.organization_id as string;
  const { user_id, role } = req.body;
  const service = new MembershipService(req.tenantDb!);

  try {
    const membership = await service.create(organization_id, { userId: user_id, role });
    res.status(201).json(mapMembership(membership as DBMembership));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function listMemberships(req: Request, res: Response) {
  const organization_id = req.params.organization_id as string;
  const service = new MembershipService(req.tenantDb!);

  try {
    const memberships = await service.list(organization_id);
    res.status(200).json({ data: memberships.map((m) => mapMembership(m as DBMembership)) });
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function updateMembership(req: Request, res: Response) {
  const id = req.params.id as string;
  const { role } = req.body;
  const service = new MembershipService(req.tenantDb!);

  try {
    const membership = await service.update(id, { role });
    res.status(200).json(mapMembership(membership as DBMembership));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function deleteMembership(req: Request, res: Response) {
  const id = req.params.id as string;
  const service = new MembershipService(req.tenantDb!);

  try {
    await service.delete(id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
