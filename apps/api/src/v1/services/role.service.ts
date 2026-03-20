import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { ROLE_PERMISSIONS, type Role } from "../../lib/rbac";

export class RoleService {
  constructor(private db: BetterSQLite3Database<typeof schema>) {}

  async create(
    organizationId: string,
    data: { name: string; description?: string; permissions: string[] },
  ) {
    const id = `role_${nanoid()}`;
    await this.db.insert(schema.customRoles).values({
      id,
      organizationId,
      name: data.name,
      description: data.description ?? null,
      permissions: data.permissions,
    });
    return this.get(id);
  }

  async list(organizationId: string) {
    const defaults = (Object.keys(ROLE_PERMISSIONS) as Role[]).map((role) => ({
      id: `default_${role}`,
      name: role,
      description: `Default ${role} role`,
      permissions: ROLE_PERMISSIONS[role],
      is_default: true,
      created_at: null,
      updated_at: null,
    }));

    const custom = await this.db.query.customRoles.findMany({
      where: eq(schema.customRoles.organizationId, organizationId),
    });

    const customMapped = custom.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      permissions: r.permissions as string[],
      is_default: false,
      created_at: r.createdAt?.toISOString() ?? null,
      updated_at: r.updatedAt?.toISOString() ?? null,
    }));

    return [...defaults, ...customMapped];
  }

  async get(id: string) {
    return this.db.query.customRoles.findFirst({
      where: eq(schema.customRoles.id, id),
    });
  }

  async update(
    organizationId: string,
    roleId: string,
    data: { name?: string; description?: string; permissions?: string[] },
  ) {
    const role = await this.db.query.customRoles.findFirst({
      where: and(
        eq(schema.customRoles.id, roleId),
        eq(schema.customRoles.organizationId, organizationId),
      ),
    });
    if (!role) throw new Error("Custom role not found");

    await this.db
      .update(schema.customRoles)
      .set({
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.permissions !== undefined ? { permissions: data.permissions } : {}),
        updatedAt: new Date(),
      })
      .where(eq(schema.customRoles.id, roleId));

    return this.get(roleId);
  }

  async delete(organizationId: string, roleId: string) {
    const role = await this.db.query.customRoles.findFirst({
      where: and(
        eq(schema.customRoles.id, roleId),
        eq(schema.customRoles.organizationId, organizationId),
      ),
    });
    if (!role) throw new Error("Custom role not found");

    const membersWithRole = await this.db.query.memberships.findMany({
      where: and(
        eq(schema.memberships.organizationId, organizationId),
        eq(schema.memberships.role, role.name),
      ),
    });
    if (membersWithRole.length > 0) {
      throw new Error("Cannot delete role — members are still assigned to it");
    }

    await this.db.delete(schema.customRoles).where(eq(schema.customRoles.id, roleId));
  }

  async getPermissions(organizationId: string, roleName: string): Promise<string[]> {
    if (roleName in ROLE_PERMISSIONS) {
      return ROLE_PERMISSIONS[roleName as Role];
    }

    const customRole = await this.db.query.customRoles.findFirst({
      where: and(
        eq(schema.customRoles.organizationId, organizationId),
        eq(schema.customRoles.name, roleName),
      ),
    });

    return (customRole?.permissions as string[]) ?? [];
  }
}
