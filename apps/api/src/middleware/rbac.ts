import { Request, Response, NextFunction } from "express";
import {
  Permission,
  Role,
  hasPermission,
  resolvePermissions,
  hasPermissionDynamic,
} from "../lib/rbac";

const DEFAULT_ROLES = ["owner", "admin", "member"];

export function requirePermission(permission: Permission) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.membership) {
      res.status(403).json({
        error: { code: "forbidden", message: "No membership found for this organization" },
      });
      return;
    }

    const roleName = req.membership.role;

    if (DEFAULT_ROLES.includes(roleName)) {
      if (!hasPermission(roleName as Role, permission)) {
        res.status(403).json({
          error: { code: "forbidden", message: `Missing required permission: ${permission}` },
        });
        return;
      }
      next();
      return;
    }

    const organizationId = req.params.organization_id as string;
    if (!organizationId || !req.tenantDb) {
      res.status(403).json({
        error: { code: "forbidden", message: `Missing required permission: ${permission}` },
      });
      return;
    }

    const permissions = await resolvePermissions(req.tenantDb, organizationId, roleName);
    if (!hasPermissionDynamic(permissions, permission)) {
      res.status(403).json({
        error: { code: "forbidden", message: `Missing required permission: ${permission}` },
      });
      return;
    }

    next();
  };
}
