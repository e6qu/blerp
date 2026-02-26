import { Request, Response, NextFunction } from "express";
import { Permission, Role, hasPermission } from "../lib/rbac";

export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.membership) {
      res
        .status(403)
        .json({
          error: { code: "forbidden", message: "No membership found for this organization" },
        });
      return;
    }

    if (!hasPermission(req.membership.role as Role, permission)) {
      res
        .status(403)
        .json({
          error: { code: "forbidden", message: `Missing required permission: ${permission}` },
        });
      return;
    }

    next();
  };
}
