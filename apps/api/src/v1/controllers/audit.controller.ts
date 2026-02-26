import { Request, Response } from "express";
import { AuditLogService } from "../services/audit.service";

export async function listAuditLogs(req: Request, res: Response) {
  const service = new AuditLogService(req.tenantDb!);
  try {
    const logs = await service.list();
    res.json({ data: logs });
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
