import { Request, Response } from "express";
import { OrganizationService } from "../services/organization.service";

export async function updateMetadata(req: Request, res: Response) {
  const id = req.params.organization_id as string;
  const { public_metadata, private_metadata } = req.body;
  const service = new OrganizationService(req.tenantDb!, req.tenantId!);

  try {
    const org = await service.update(id, {
      publicMetadata: public_metadata,
      privateMetadata: private_metadata,
    });
    res.status(200).json(org);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
