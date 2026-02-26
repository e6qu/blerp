import { Request, Response } from "express";
import { DomainService } from "../services/domain.service";

export async function addDomain(req: Request, res: Response) {
  const organizationId = req.params.organization_id as string;
  const { domain } = req.body;
  const service = new DomainService(req.tenantDb!);

  try {
    const result = await service.addDomain(organizationId, domain);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function listDomains(req: Request, res: Response) {
  const organizationId = req.params.organization_id as string;
  const service = new DomainService(req.tenantDb!);

  try {
    const domains = await service.listDomains(organizationId);
    res.json({ data: domains });
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function verifyDomain(req: Request, res: Response) {
  const id = req.params.domain_id as string;
  const service = new DomainService(req.tenantDb!);

  try {
    const result = await service.verifyDomain(id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
