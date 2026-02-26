import { Request, Response } from "express";
import { WebAuthnService } from "../services/webauthn.service";

export async function getRegistrationOptions(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const service = new WebAuthnService(req.tenantDb!);
  try {
    const options = await service.generateRegistrationOptions(userId);
    res.json(options);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function verifyRegistration(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const service = new WebAuthnService(req.tenantDb!);
  try {
    const result = await service.verifyRegistration(userId, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function listPasskeys(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const service = new WebAuthnService(req.tenantDb!);
  try {
    const passkeys = await service.listPasskeys(userId);
    res.json({ data: passkeys });
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
