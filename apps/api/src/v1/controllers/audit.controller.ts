import { Request, Response } from "express";
import { AuditLogService } from "../services/audit.service";

export async function listAuditLogs(req: Request, res: Response) {
  const service = new AuditLogService(req.tenantDb!);
  const { action, actor_id, start_date, end_date, limit, offset } = req.query;

  try {
    const result = await service.list({
      action: action as string,
      actorId: actor_id as string,
      startDate: start_date as string,
      endDate: end_date as string,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
    });
    res.json({ data: result.data, meta: { total: result.totalCount } });
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
