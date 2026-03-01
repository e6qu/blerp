import { nanoid } from "nanoid";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";
import { eq, and } from "drizzle-orm";

export class ProjectService {
  constructor(
    private db: BetterSQLite3Database<typeof schema>,
    private tenantId: string,
  ) {}

  async getProject(projectId: string) {
    return this.db.query.projects.findFirst({
      where: eq(schema.projects.id, projectId),
    });
  }

  async updateProject(
    projectId: string,
    data: {
      name?: string;
      slug?: string;
    },
  ) {
    const project = await this.getProject(projectId);
    if (!project) throw new Error("Project not found");

    await this.db
      .update(schema.projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.projects.id, projectId));

    return this.getProject(projectId);
  }

  async deleteProject(projectId: string) {
    const project = await this.getProject(projectId);
    if (!project) throw new Error("Project not found");

    await this.db.delete(schema.projects).where(eq(schema.projects.id, projectId));
  }

  async listApiKeys(projectId: string, filters?: { environment?: string; type?: string }) {
    const whereClauses = [eq(schema.apiKeys.projectId, projectId)];

    if (filters?.environment) {
      whereClauses.push(
        eq(
          schema.apiKeys.environment,
          filters.environment as "development" | "staging" | "production",
        ),
      );
    }
    if (filters?.type) {
      whereClauses.push(eq(schema.apiKeys.type, filters.type as "publishable" | "secret"));
    }

    return this.db.query.apiKeys.findMany({
      where: and(...whereClauses),
    });
  }

  async createApiKey(data: {
    projectId: string;
    environment: "development" | "staging" | "production";
    type: "publishable" | "secret";
    label?: string;
  }) {
    const id = `key_${nanoid(12)}`;
    const prefix = data.type === "publishable" ? "pk" : "sk";
    const keyValue = `${prefix}_${this.tenantId}_${nanoid(32)}`;

    await this.db.insert(schema.apiKeys).values({
      id,
      projectId: data.projectId,
      environment: data.environment,
      type: data.type,
      key: keyValue,
      label: data.label,
      status: "active",
    });

    const key = await this.db.query.apiKeys.findFirst({
      where: eq(schema.apiKeys.id, id),
    });

    return { ...key, secret: keyValue };
  }

  async rotateApiKey(projectId: string, keyId: string) {
    const key = await this.db.query.apiKeys.findFirst({
      where: and(eq(schema.apiKeys.id, keyId), eq(schema.apiKeys.projectId, projectId)),
    });

    if (!key) throw new Error("API key not found");

    const prefix = key.type === "publishable" ? "pk" : "sk";
    const newKeyValue = `${prefix}_${this.tenantId}_${nanoid(32)}`;

    await this.db
      .update(schema.apiKeys)
      .set({ key: newKeyValue, updatedAt: new Date() })
      .where(eq(schema.apiKeys.id, keyId));

    return { ...key, secret: newKeyValue };
  }

  async revokeApiKey(projectId: string, keyId: string) {
    const key = await this.db.query.apiKeys.findFirst({
      where: and(eq(schema.apiKeys.id, keyId), eq(schema.apiKeys.projectId, projectId)),
    });

    if (!key) throw new Error("API key not found");

    await this.db
      .update(schema.apiKeys)
      .set({ status: "revoked", updatedAt: new Date() })
      .where(eq(schema.apiKeys.id, keyId));
  }
}
