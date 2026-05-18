import { Request, Response } from "express";
import { RoleService } from "../services/role.service";

interface CustomRoleRow {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  permissions: unknown;
  createdAt: Date | null;
  updatedAt: Date | null;
}

// snake_case projection for the Role wire shape. RoleService.create / update
// return raw Drizzle rows (camelCase) — without this the dashboard would read
// `role.organization_id` as undefined (BUG-3 / BUG-52 lineage).
function mapRole(row: CustomRoleRow) {
  return {
    id: row.id,
    organization_id: row.organizationId,
    name: row.name,
    description: row.description,
    permissions: (row.permissions as string[]) ?? [],
    is_default: false,
    created_at: row.createdAt ? row.createdAt.toISOString() : null,
    updated_at: row.updatedAt ? row.updatedAt.toISOString() : null,
  };
}

export async function listRoles(req: Request, res: Response) {
  const organizationId = req.params.organization_id as string;
  const roleService = new RoleService(req.tenantDb!);

  // service.list already emits snake_case for both defaults and custom rows.
  const roles = await roleService.list(organizationId);
  res.json({ data: roles });
}

export async function createRole(req: Request, res: Response) {
  const organizationId = req.params.organization_id as string;
  const { name, description, permissions } = req.body as {
    name?: string;
    description?: string;
    permissions?: string[];
  };

  if (!name) {
    res.status(400).json({ error: { message: "name is required" } });
    return;
  }
  if (!permissions || !Array.isArray(permissions)) {
    res.status(400).json({ error: { message: "permissions must be an array" } });
    return;
  }

  const roleService = new RoleService(req.tenantDb!);

  try {
    const role = await roleService.create(organizationId, { name, description, permissions });
    if (!role) {
      res.status(500).json({ error: { message: "Role created but lookup failed" } });
      return;
    }
    res.status(201).json(mapRole(role));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function updateRole(req: Request, res: Response) {
  const organizationId = req.params.organization_id as string;
  const roleId = req.params.role_id as string;
  const { name, description, permissions } = req.body as {
    name?: string;
    description?: string;
    permissions?: string[];
  };

  const roleService = new RoleService(req.tenantDb!);

  try {
    const role = await roleService.update(organizationId, roleId, {
      name,
      description,
      permissions,
    });
    if (!role) {
      res.status(404).json({ error: { message: "Custom role not found" } });
      return;
    }
    res.json(mapRole(role));
  } catch (error) {
    res.status(404).json({ error: { message: (error as Error).message } });
  }
}

export async function deleteRole(req: Request, res: Response) {
  const organizationId = req.params.organization_id as string;
  const roleId = req.params.role_id as string;

  const roleService = new RoleService(req.tenantDb!);

  try {
    await roleService.delete(organizationId, roleId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
