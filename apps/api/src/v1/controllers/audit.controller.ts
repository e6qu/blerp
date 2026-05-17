import { Request, Response } from "express";
import { AuditLogService } from "../services/audit.service";

export async function listAuditLogs(req: Request, res: Response) {
  const service = new AuditLogService(req.tenantDb!);
  const { action, actor_id, start_date, end_date, limit, offset } = req.query;

  // BUG-161 (codex r40): scope audit reads to the token's project so
  // a project-A M2M can't see project-B events. The dev X-User-Id
  // shim sees the full tenant stream (project_id undefined → no
  // filter applied).
  const projectId =
    req.m2m && !req.m2m.clientId.startsWith("dev-shim") ? req.m2m.projectId : undefined;

  try {
    const result = await service.list({
      projectId,
      action: action as string,
      actorId: actor_id as string,
      startDate: start_date as string,
      endDate: end_date as string,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
    });
    // BUG-48: Clerk's paginated shape is { data, total_count }; keep
    // `meta.total` as a legacy alias for one release.
    res.json({
      data: result.data,
      total_count: result.totalCount,
      meta: { total: result.totalCount },
    });
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
