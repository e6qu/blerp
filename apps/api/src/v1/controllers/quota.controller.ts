import { Request, Response } from "express";
import { QuotaService } from "../services/quota.service";

export async function getUsage(req: Request, res: Response) {
  const service = new QuotaService(req.tenantId!);
  try {
    const usage = await service.getUsage();
    res.json(usage);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
