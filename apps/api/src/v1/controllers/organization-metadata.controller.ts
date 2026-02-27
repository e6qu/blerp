import { Request, Response } from "express";
import { OrganizationService } from "../services/organization.service";
import { validateMetadata, Metadata } from "../../lib/metadata";
import type { components } from "@blerp/shared";
import * as schema from "../../db/schema";

type Organization = components["schemas"]["Organization"];
type DBOrg = typeof schema.organizations.$inferSelect;

function mapOrganization(org: DBOrg): Organization {
  return {
    id: org.id,
    project_id: org.projectId,
    name: org.name,
    slug: org.slug,
    public_metadata: (org.publicMetadata as Metadata) || {},
    private_metadata: (org.privateMetadata as Metadata) || {},
    created_at: org.createdAt.toISOString(),
  };
}

export async function updateMetadata(req: Request, res: Response) {
  const id = req.params.organization_id as string;
  const { public_metadata, private_metadata } = req.body;
  const service = new OrganizationService(req.tenantDb!, req.tenantId!);

  try {
    if (public_metadata) validateMetadata(public_metadata as Metadata);
    if (private_metadata) validateMetadata(private_metadata as Metadata);

    const org = await service.update(id, {
      publicMetadata: public_metadata as Metadata,
      privateMetadata: private_metadata as Metadata,
    });
    if (!org) throw new Error("Organization not found");

    res.status(200).json(mapOrganization(org as DBOrg));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
