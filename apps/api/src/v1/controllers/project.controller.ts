import { Request, Response } from "express";
import { ProjectService } from "../services/project.service";
import type { components } from "@blerp/shared";
import * as schema from "../../db/schema";

type APIKey = components["schemas"]["APIKey"];
type Project = components["schemas"]["Project"];
type DBAPIKey = typeof schema.apiKeys.$inferSelect;
type DBProject = typeof schema.projects.$inferSelect;

function mapApiKey(key: DBAPIKey, includeSecret = false): APIKey {
  const prefix = key.key.split("_").slice(0, 2).join("_");
  return {
    id: key.id,
    project_id: key.projectId,
    environment: key.environment as "development" | "staging" | "production",
    type: key.type as "publishable" | "secret",
    prefix: `${prefix}...`,
    label: key.label ?? undefined,
    secret: includeSecret ? key.key : undefined,
    status: key.status as "active" | "revoked",
    last_used_at: key.lastUsedAt?.toISOString(),
    created_at: key.createdAt.toISOString(),
  };
}

function mapProject(project: DBProject): Project {
  return {
    id: project.id,
    name: project.name,
    slug: project.slug,
    created_at: project.createdAt.toISOString(),
    updated_at: project.updatedAt.toISOString(),
  };
}

function getParam(req: Request, name: string): string {
  const val = req.params[name];
  return Array.isArray(val) ? val[0] : val;
}

export async function getProject(req: Request, res: Response) {
  const projectId = getParam(req, "project_id");
  const service = new ProjectService(req.tenantDb!, req.tenantId!);

  try {
    const project = await service.getProject(projectId);
    if (!project) {
      res.status(404).json({ error: { message: "Project not found" } });
      return;
    }
    res.status(200).json(mapProject(project));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function updateProject(req: Request, res: Response) {
  const projectId = getParam(req, "project_id");
  const service = new ProjectService(req.tenantDb!, req.tenantId!);
  const { name } = req.body;

  try {
    const project = await service.updateProject(projectId, { name });
    res.status(200).json(mapProject(project as DBProject));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function deleteProject(req: Request, res: Response) {
  const projectId = getParam(req, "project_id");
  const service = new ProjectService(req.tenantDb!, req.tenantId!);

  try {
    await service.deleteProject(projectId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function listApiKeys(req: Request, res: Response) {
  const projectId = getParam(req, "project_id");
  const { environment, type } = req.query;
  const service = new ProjectService(req.tenantDb!, req.tenantId!);

  try {
    const envFilter = typeof environment === "string" ? environment : undefined;
    const typeFilter = typeof type === "string" ? type : undefined;
    const keys = await service.listApiKeys(projectId, {
      environment: envFilter,
      type: typeFilter,
    });
    const mappedKeys = keys.map((k) => mapApiKey(k));
    res.status(200).json({ data: mappedKeys });
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function createApiKey(req: Request, res: Response) {
  const projectId = getParam(req, "project_id");
  const { environment, type, label } = req.body;
  const service = new ProjectService(req.tenantDb!, req.tenantId!);

  try {
    const key = await service.createApiKey({
      projectId,
      environment,
      type,
      label,
    });
    res.status(201).json(mapApiKey(key as DBAPIKey, true));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function rotateApiKey(req: Request, res: Response) {
  const projectId = getParam(req, "project_id");
  const keyId = getParam(req, "key_id");
  const service = new ProjectService(req.tenantDb!, req.tenantId!);

  try {
    const key = await service.rotateApiKey(projectId, keyId);
    res.status(200).json(mapApiKey(key as DBAPIKey, true));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function revokeApiKey(req: Request, res: Response) {
  const projectId = getParam(req, "project_id");
  const keyId = getParam(req, "key_id");
  const service = new ProjectService(req.tenantDb!, req.tenantId!);

  try {
    await service.revokeApiKey(projectId, keyId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
