import { Request, Response } from "express";
import { RoleService } from "../services/role.service";

export async function listRoles(req: Request, res: Response) {
  const organizationId = req.params.organization_id as string;
  const roleService = new RoleService(req.tenantDb!);

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
    res.status(201).json(role);
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
    res.json(role);
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
