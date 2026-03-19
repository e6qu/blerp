import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../db/schema";
import { eq, and } from "drizzle-orm";

export type Permission =
  | "org:read"
  | "org:write"
  | "members:read"
  | "members:write"
  | "invitations:read"
  | "invitations:write";

export type Role = "owner" | "admin" | "member";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    "org:read",
    "org:write",
    "members:read",
    "members:write",
    "invitations:read",
    "invitations:write",
  ],
  admin: ["org:read", "members:read", "members:write", "invitations:read", "invitations:write"],
  member: ["org:read", "members:read", "invitations:read"],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export async function resolvePermissions(
  db: BetterSQLite3Database<typeof schema>,
  organizationId: string,
  roleName: string,
): Promise<string[]> {
  if (roleName in ROLE_PERMISSIONS) {
    return ROLE_PERMISSIONS[roleName as Role];
  }

  const customRole = await db.query.customRoles.findFirst({
    where: and(
      eq(schema.customRoles.organizationId, organizationId),
      eq(schema.customRoles.name, roleName),
    ),
  });

  return (customRole?.permissions as string[]) ?? [];
}

export function hasPermissionDynamic(permissions: string[], permission: string): boolean {
  return permissions.includes(permission);
}
