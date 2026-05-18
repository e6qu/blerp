import { Request, Response } from "express";
import { AuditLogService } from "../services/audit.service";
import { isTenantRootM2M } from "../../middleware/auth";

export async function listAuditLogs(req: Request, res: Response) {
  const service = new AuditLogService(req.tenantDb!);
  const { action, actor_id, start_date, end_date, limit, offset } = req.query;

  // BUG-161 (codex r40) / BUG-205 (codex r59) / BUG-207 (codex r60):
  // tenant-root callers (sk_ secret keys, M2M with tenant-wide :admin
  // scope, or the dev shim) see the unfiltered tenant stream —
  // including NULL-project system events like `user.created` that the
  // BUG-161 project filter would otherwise hide. Project-scoped non-
  // admin M2M tokens still get the per-project filter.
  //
  // BUG-220 (cleanup, post-r67): the predicate lives in
  // middleware/auth.ts; this controller uses the default
  // `devShimIsTenantRoot: true` because audit tests rely on dev-shim
  // seeing all rows.
  const projectId = isTenantRootM2M(req) ? undefined : req.m2m?.projectId;

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
