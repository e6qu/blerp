import { Request, Response } from "express";
import { MagicLinkService } from "../services/magic-link.service";

export async function createMagicLink(req: Request, res: Response) {
  const { email } = req.body;
  const service = new MagicLinkService(req.tenantDb!);

  if (!email) {
    res.status(400).json({ error: { message: "email is required" } });
    return;
  }

  try {
    const result = await service.createToken(email);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function verifyMagicLink(req: Request, res: Response) {
  const { token } = req.body;
  const service = new MagicLinkService(req.tenantDb!);

  if (!token) {
    res.status(400).json({ error: { message: "token is required" } });
    return;
  }

  try {
    const result = await service.verifyToken(token);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
