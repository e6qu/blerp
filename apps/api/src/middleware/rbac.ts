import { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import {
  Permission,
  Role,
  hasPermission,
  resolvePermissions,
  hasPermissionDynamic,
} from "../lib/rbac";
import { ForbiddenError } from "../lib/errors";
import * as schema from "../db/schema";

const DEFAULT_ROLES = ["owner", "admin", "member"];

export function requirePermission(permission: Permission) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    // BUG-47: route the forbidden responses through ForbiddenError so the
    // central errorHandler emits the dual { error, errors[] } envelope.
    //
    // BUG-154 (codex r37): M2M tokens that carry the same permission
    // string as a scope satisfy the gate. Without this, backend / Monite
    // callers using SecretKey auth get blocked from every org-scoped
    // endpoint because they have no `req.membership`. The scope check
    // is exact-match on the permission string (e.g. an M2M token with
    // `org:write` scope can pass `requirePermission("org:write")`),
    // matching Clerk's backend-secret-key model where SecretKey
    // effectively holds every permission its owner granted it.
    // BUG-154 (codex r37): real M2M tokens with the matching scope
    // pass. The dev X-User-Id shim sets req.m2m too but we want it to
    // go through membership — otherwise the RBAC tests for "member
    // can't do owner things" pass trivially since the shim grants
    // every scope. Filter the shim out so RBAC behavior is faithful
    // in dev.
    if (req.m2m && !req.m2m.clientId.startsWith("dev-shim:")) {
      if (!req.m2m.scopes.includes(permission)) {
        return next(new ForbiddenError(`M2M token is missing the required scope: ${permission}`));
      }
      // BUG-159 (codex r39): also verify project binding. M2M tokens
      // are project-scoped (BUG-142). Orgs live inside projects, so a
      // token minted for project A must NOT act on project B's orgs
      // even when both share the same tenant. When the route has an
      // `organization_id` in path/body/query (set by the route's
      // own middleware before this runs), resolve the org's project
      // and require it equal the token's project.
      const orgId =
        (req.params.organization_id as string | undefined) ??
        (req.body?.organization_id as string | undefined) ??
        (req.query?.organization_id as string | undefined);
      if (orgId && req.tenantDb) {
        const org = await req.tenantDb.query.organizations.findFirst({
          where: eq(schema.organizations.id, orgId),
        });
        if (!org) {
          return next(new ForbiddenError("Organization not found"));
        }
        if (org.projectId !== req.m2m.projectId) {
          return next(
            new ForbiddenError(
              "M2M token is scoped to a different project than this organization.",
            ),
          );
        }
      }
      next();
      return;
    }

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
