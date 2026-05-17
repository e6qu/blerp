import { Request, Response, NextFunction } from "express";
import {
  Permission,
  Role,
  hasPermission,
  resolvePermissions,
  hasPermissionDynamic,
} from "../lib/rbac";
import { ForbiddenError } from "../lib/errors";

const DEFAULT_ROLES = ["owner", "admin", "member"];

export function requirePermission(permission: Permission) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    // BUG-47: route the forbidden responses through ForbiddenError so the
    // central errorHandler emits the dual { error, errors[] } envelope
    // (Clerk-compat plural plus legacy singular). Was previously
    // hand-rolling `{ error: { code, message } }` here, which bypassed
    // BlerpError.toJSON() and skipped the new errors[] array.
    if (!req.membership) {
      return next(new ForbiddenError("No membership found for this organization"));
    }

    const roleName = req.membership.role;

    if (DEFAULT_ROLES.includes(roleName)) {
      if (!hasPermission(roleName as Role, permission)) {
        return next(new ForbiddenError(`Missing required permission: ${permission}`));
      }
      next();
      return;
    }

    const organizationId = req.params.organization_id as string;
    if (!organizationId || !req.tenantDb) {
      return next(new ForbiddenError(`Missing required permission: ${permission}`));
    }

    const permissions = await resolvePermissions(req.tenantDb, organizationId, roleName);
    if (!hasPermissionDynamic(permissions, permission)) {
      return next(new ForbiddenError(`Missing required permission: ${permission}`));
    }

    next();
  };
}
