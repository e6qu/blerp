import { Request, Response } from "express";
import { DomainService } from "../services/domain.service";

interface DBDomain {
  id: string;
  organizationId: string;
  domain: string;
  verificationStatus: string;
  verificationToken: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

function mapDomain(d: DBDomain) {
  return {
    id: d.id,
    organization_id: d.organizationId,
    domain: d.domain,
    verification_status: d.verificationStatus,
    verification_token: d.verificationToken,
    created_at: d.createdAt?.toISOString(),
    updated_at: d.updatedAt?.toISOString(),
  };
}

export async function addDomain(req: Request, res: Response) {
  const organizationId = req.params.organization_id as string;
  const { domain } = req.body;
  const service = new DomainService(req.tenantDb!);

  try {
    const result = await service.addDomain(organizationId, domain);
    res.status(201).json(mapDomain(result as DBDomain));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function listDomains(req: Request, res: Response) {
  const organizationId = req.params.organization_id as string;
  const service = new DomainService(req.tenantDb!);

  try {
    const domains = await service.listDomains(organizationId);
    res.json({ data: domains.map((d) => mapDomain(d as DBDomain)) });
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function verifyDomain(req: Request, res: Response) {
  const id = req.params.domain_id as string;
  const service = new DomainService(req.tenantDb!);

  try {
    const result = await service.verifyDomain(id);
    res.json(mapDomain(result as DBDomain));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function deleteDomain(req: Request, res: Response) {
  const id = req.params.domain_id as string;
  const service = new DomainService(req.tenantDb!);

  try {
    await service.deleteDomain(id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
