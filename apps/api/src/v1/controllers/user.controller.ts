import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export async function listUsers(req: Request, res: Response) {
  const service = new AuthService(req.tenantDb!, req.tenantId!);
  const { status, metadata_key, metadata_value, limit, cursor } = req.query;

  try {
    const users = await service.listUsers({
      status: status as string,
      metadataKey: metadata_key as string,
      metadataValue: metadata_value as string,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      cursor: cursor as string,
    });
    res.status(200).json({ data: users });
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
