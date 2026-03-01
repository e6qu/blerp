import { Request, Response } from "express";
import { TotpService } from "../services/totp.service";

function getParam(req: Request, name: string): string {
  const val = req.params[name];
  return Array.isArray(val) ? val[0] : val;
}

export async function enrollTotp(req: Request, res: Response) {
  const userId = getParam(req, "user_id");
  const service = new TotpService(req.tenantDb!, req.tenantId!);

  try {
    const result = await service.enroll(userId);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function verifyTotp(req: Request, res: Response) {
  const userId = getParam(req, "user_id");
  const { code } = req.body;
  const service = new TotpService(req.tenantDb!, req.tenantId!);

  try {
    const result = await service.verify(userId, code);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function regenerateBackupCodes(req: Request, res: Response) {
  const userId = getParam(req, "user_id");
  const service = new TotpService(req.tenantDb!, req.tenantId!);

  try {
    const result = await service.regenerateBackupCodes(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function disableTotp(req: Request, res: Response) {
  const userId = getParam(req, "user_id");
  const service = new TotpService(req.tenantDb!, req.tenantId!);

  try {
    const result = await service.disable(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
