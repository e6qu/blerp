import { Request, Response } from "express";
import { AuditLogService } from "../services/audit.service";

export async function listAuditLogs(req: Request, res: Response) {
  const service = new AuditLogService(req.tenantDb!);
  const { action, actor_id, start_date, end_date, limit, offset } = req.query;

  // BUG-161 (codex r40): scope audit reads to the token's project so
  // a project-A M2M can't see project-B events. The dev X-User-Id
  // shim sees the full tenant stream (project_id undefined → no
  // filter applied).
  //
  // BUG-205 (codex r59): tenant-root callers should see the full
  // tenant stream. Pre-r59 their `req.m2m.projectId` was the api
  // key's bound project, so the filter hid every NULL-project row
  // (system/tenant events like `user.created`). Detect tenant-root
  // callers and skip the filter.
  //
  // BUG-207 (codex r60): narrow the tenant-root predicate. Pre-r60
  // any `:admin` scope qualified, but `projects:admin` and
  // `api_keys:admin` are project-bound (they let you mint M2M
  // tokens WITHIN your project — BUG-186/187 chain-of-trust). A
  // project-A token with `audit_logs:read` + `projects:admin` was
  // wrongly classified as tenant-root and saw cross-project audit
  // rows. Only the truly tenant-wide admin scopes (users/scim/
  // signup_restrictions/redirect_urls/usage — same families as
  // BUG-186's TENANT_WIDE_PREFIXES) gate routes with no project
  // boundary, so only they imply tenant-root authority.
  const TENANT_ROOT_ADMIN_SCOPES = new Set([
    "users:admin",
    "signup_restrictions:admin",
    "redirect_urls:admin",
    "usage:admin",
  ]);
  function isTenantRootM2M(): boolean {
    const m2m = req.m2m;
    if (!m2m) return false;
    if (m2m.clientId.startsWith("dev-shim")) return true;
    if (m2m.clientId.startsWith("api_key:")) return true; // sk_ secret key — BUG-195
    if (m2m.scopes.some((s) => TENANT_ROOT_ADMIN_SCOPES.has(s))) return true;
    return false;
  }
  const projectId = isTenantRootM2M() ? undefined : req.m2m?.projectId;

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
