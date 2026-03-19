import { Request, Response } from "express";
import { RedirectService } from "../services/redirect.service";
import { BadRequestError } from "../../lib/errors";

export async function createRedirectUrl(req: Request, res: Response) {
  const { url, type } = req.body as { url: string; type?: "web" | "native" };
  if (!url) {
    throw new BadRequestError("url is required");
  }

  const service = new RedirectService(req.tenantDb!);
  const redirect = await service.create({ url, type });
  res.status(201).json(redirect);
}

export async function listRedirectUrls(req: Request, res: Response) {
  const service = new RedirectService(req.tenantDb!);
  const redirects = await service.list();
  res.status(200).json({ data: redirects });
}

export async function deleteRedirectUrl(req: Request, res: Response) {
  const id = req.params.id as string;
  const service = new RedirectService(req.tenantDb!);

  const existing = await service.get(id);
  if (!existing) {
    res.status(404).json({ error: { message: "Redirect URL not found" } });
    return;
  }

  await service.delete(id);
  res.status(204).send();
}
