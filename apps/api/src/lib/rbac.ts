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
