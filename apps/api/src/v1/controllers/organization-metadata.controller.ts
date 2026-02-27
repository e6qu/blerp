/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { OrganizationService } from "../services/organization.service";
import { validateMetadata } from "../../lib/metadata";

function mapOrganization(org: any) {
  if (!org) return org;
  const { publicMetadata, privateMetadata, ...rest } = org;
  return {
    ...rest,
    metadata_public: publicMetadata,
    metadata_private: privateMetadata,
  };
}

export async function updateMetadata(req: Request, res: Response) {
  const id = req.params.organization_id as string;
  const { public_metadata, private_metadata } = req.body;
  const service = new OrganizationService(req.tenantDb!, req.tenantId!);

  try {
    if (public_metadata) validateMetadata(public_metadata);
    if (private_metadata) validateMetadata(private_metadata);

    const org = await service.update(id, {
      publicMetadata: public_metadata,
      privateMetadata: private_metadata,
    });
    res.status(200).json(mapOrganization(org));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
