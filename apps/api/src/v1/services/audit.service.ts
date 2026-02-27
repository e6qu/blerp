import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";
import { desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export class AuditLogService {
  constructor(private db: BetterSQLite3Database<typeof schema>) {}

  async create(data: {
    userId?: string;
    organizationId?: string;
    action: string;
    actor: Record<string, unknown>;
    payload?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const id = `audit_${nanoid()}`;
    await this.db.insert(schema.auditLogs).values({
      id,
      userId: data.userId,
      organizationId: data.organizationId,
      action: data.action,
      actor: data.actor,
      payload: data.payload || {},
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });
    return id;
  }

  async list(_filters?: { userId?: string; organizationId?: string }) {
    const query = this.db.select().from(schema.auditLogs).orderBy(desc(schema.auditLogs.createdAt));

    // In a real app, use where filters
    return query;
  }
}
