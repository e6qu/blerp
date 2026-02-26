import { Request, Response } from "express";
import { OrganizationService } from "../services/organization.service";

export async function createOrganization(req: Request, res: Response) {
  const { name, slug, project_id } = req.body;
  const service = new OrganizationService(req.tenantDb!);

  try {
    const org = await service.create({ name, slug, projectId: project_id });
    res.status(201).json(org);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function listOrganizations(req: Request, res: Response) {
  const service = new OrganizationService(req.tenantDb!);

  try {
    const orgs = await service.list();
    res.status(200).json({ data: orgs });
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function getOrganization(req: Request, res: Response) {
  const id = (req.params.organization_id || req.params.id) as string;
  const service = new OrganizationService(req.tenantDb!);

  try {
    const org = await service.get(id);
    if (!org) {
      res.status(404).json({ error: { message: "Organization not found" } });
      return;
    }
    res.status(200).json(org);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function updateOrganization(req: Request, res: Response) {
  const id = (req.params.organization_id || req.params.id) as string;
  const data = req.body;
  const service = new OrganizationService(req.tenantDb!);

  try {
    const org = await service.update(id, data);
    res.status(200).json(org);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function deleteOrganization(req: Request, res: Response) {
  const id = (req.params.organization_id || req.params.id) as string;
  const service = new OrganizationService(req.tenantDb!);

  try {
    await service.delete(id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
