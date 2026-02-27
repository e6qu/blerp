import { Request, Response } from "express";
import { OrganizationService } from "../services/organization.service";
import { cache } from "../../lib/redis";
import type { components } from "@blerp/shared";
import { Metadata } from "../../lib/metadata";

type Organization = components["schemas"]["Organization"];

interface DBOrg {
  id: string;
  projectId: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  publicMetadata: string | Metadata | unknown;
  privateMetadata: string | Metadata | unknown;
  createdAt: Date;
  updatedAt: Date;
}

function mapOrganization(org: DBOrg): Organization {
  return {
    id: org.id,
    project_id: org.projectId,
    name: org.name,
    slug: org.slug,
    public_metadata: org.publicMetadata as Organization["public_metadata"],
    private_metadata: org.privateMetadata as Organization["private_metadata"],
    created_at: org.createdAt.toISOString(),
  };
}

export async function createOrganization(req: Request, res: Response) {
  const { name, slug, project_id } = req.body as {
    name: string;
    slug?: string;
    project_id: string;
  };
  const service = new OrganizationService(req.tenantDb!, req.tenantId!);

  try {
    const org = await service.create({ name, slug, projectId: project_id });
    if (!org) throw new Error("Failed to create organization");

    // Invalidate list cache
    await cache.del(`blerp:orgs:${req.tenantId}`);
    res.status(201).json(mapOrganization(org));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function listOrganizations(req: Request, res: Response) {
  const { domain } = req.query as { domain?: string };
  const cacheKey = `blerp:orgs:${req.tenantId}`;

  // Bypass cache for domain filtering
  if (!domain) {
    const cached = await cache.get<{ data: Organization[] }>(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }
  }

  const service = new OrganizationService(req.tenantDb!, req.tenantId!);

  try {
    const orgs = await service.list({ domain });
    const mappedOrgs = orgs.map(mapOrganization);
    const response = { data: mappedOrgs };
    if (!domain) {
      await cache.set(cacheKey, response, 300); // Cache for 5 mins
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function getOrganization(req: Request, res: Response) {
  const id = (req.params.organization_id || req.params.id) as string;
  const service = new OrganizationService(req.tenantDb!, req.tenantId!);

  try {
    const org = await service.get(id);
    if (!org) {
      res.status(404).json({ error: { message: "Organization not found" } });
      return;
    }
    res.status(200).json(mapOrganization(org));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function updateOrganization(req: Request, res: Response) {
  const id = (req.params.organization_id || req.params.id) as string;
  const data = req.body as {
    name?: string;
    slug?: string;
    public_metadata?: Metadata;
    private_metadata?: Metadata;
  };
  const service = new OrganizationService(req.tenantDb!, req.tenantId!);

  try {
    const org = await service.update(id, {
      name: data.name,
      slug: data.slug,
      publicMetadata: data.public_metadata,
      privateMetadata: data.private_metadata,
    });
    if (!org) throw new Error("Failed to update organization");

    await cache.del(`blerp:orgs:${req.tenantId}`);
    res.status(200).json(mapOrganization(org));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function deleteOrganization(req: Request, res: Response) {
  const id = (req.params.organization_id || req.params.id) as string;
  const service = new OrganizationService(req.tenantDb!, req.tenantId!);

  try {
    await service.delete(id);
    await cache.del(`blerp:orgs:${req.tenantId}`);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
