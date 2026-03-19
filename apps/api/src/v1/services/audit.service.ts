import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";
import { desc, eq, and, gte, lte, sql, count } from "drizzle-orm";
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

  async list(filters?: {
    userId?: string;
    organizationId?: string;
    action?: string;
    actorId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) {
    const whereClauses = [];

    if (filters?.userId) {
      whereClauses.push(eq(schema.auditLogs.userId, filters.userId));
    }
    if (filters?.organizationId) {
      whereClauses.push(eq(schema.auditLogs.organizationId, filters.organizationId));
    }
    if (filters?.action) {
      whereClauses.push(eq(schema.auditLogs.action, filters.action));
    }
    if (filters?.actorId) {
      whereClauses.push(sql`json_extract(${schema.auditLogs.actor}, '$.id') = ${filters.actorId}`);
    }
    if (filters?.startDate) {
      const startTimestamp = Math.floor(new Date(filters.startDate).getTime() / 1000);
      whereClauses.push(gte(schema.auditLogs.createdAt, new Date(startTimestamp * 1000)));
    }
    if (filters?.endDate) {
      const endTimestamp = Math.floor(new Date(filters.endDate).getTime() / 1000);
      whereClauses.push(lte(schema.auditLogs.createdAt, new Date(endTimestamp * 1000)));
    }

    const whereClause = whereClauses.length > 0 ? and(...whereClauses) : undefined;
    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;

    const [totalResult] = await this.db
      .select({ total: count() })
      .from(schema.auditLogs)
      .where(whereClause);

    const data = await this.db
      .select()
      .from(schema.auditLogs)
      .where(whereClause)
      .orderBy(desc(schema.auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return { data, totalCount: totalResult?.total ?? 0 };
  }
}
