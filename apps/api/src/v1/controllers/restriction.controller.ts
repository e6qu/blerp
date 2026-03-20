import { Request, Response } from "express";
import { RestrictionService } from "../services/restriction.service";

export async function createRestriction(req: Request, res: Response) {
  const { type, identifier_type, value } = req.body;
  const service = new RestrictionService(req.tenantDb!);

  if (!type || !identifier_type || !value) {
    res.status(400).json({ error: { message: "type, identifier_type, and value are required" } });
    return;
  }

  if (!["allowlist", "blocklist"].includes(type)) {
    res.status(400).json({ error: { message: "type must be 'allowlist' or 'blocklist'" } });
    return;
  }

  if (!["email", "domain"].includes(identifier_type)) {
    res.status(400).json({ error: { message: "identifier_type must be 'email' or 'domain'" } });
    return;
  }

  try {
    const restriction = await service.create(type, identifier_type, value);
    res.status(201).json(restriction);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function listRestrictions(req: Request, res: Response) {
  const type = req.query.type as "allowlist" | "blocklist" | undefined;
  const service = new RestrictionService(req.tenantDb!);

  try {
    const restrictions = await service.list(type);
    res.json({ data: restrictions });
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function deleteRestriction(req: Request, res: Response) {
  const id = req.params.id as string;
  const service = new RestrictionService(req.tenantDb!);

  try {
    await service.delete(id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
