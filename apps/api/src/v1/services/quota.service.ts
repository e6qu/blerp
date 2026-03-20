import {} from "../../lib/redis";
import { logger } from "../../lib/logger";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";
import { count, eq, isNull } from "drizzle-orm";

export interface QuotaConfig {
  maxUsers: number;
  maxOrganizations: number;
  maxSessionsPerUser: number;
}

const DEFAULT_QUOTA: QuotaConfig = {
  maxUsers: 100,
  maxOrganizations: 5,
  maxSessionsPerUser: 10,
};

export class QuotaService {
  constructor(
    private tenantId: string,
    private db: BetterSQLite3Database<typeof schema>,
  ) {}

  async checkQuota(resource: keyof QuotaConfig, currentCount: number) {
    const limit = DEFAULT_QUOTA[resource];
    if (currentCount >= limit) {
      logger.warn({ tenantId: this.tenantId, resource, limit, currentCount }, "Quota exceeded");
      throw new Error(`Quota exceeded for ${resource}. Limit: ${limit}`);
    }
  }

  async getUsage() {
    const [usersResult] = await this.db
      .select({ total: count() })
      .from(schema.users)
      .where(isNull(schema.users.deletedAt));

    const [orgsResult] = await this.db.select({ total: count() }).from(schema.organizations);

    const [sessionsResult] = await this.db
      .select({ total: count() })
      .from(schema.sessions)
      .where(eq(schema.sessions.status, "active"));

    return {
      users: usersResult?.total ?? 0,
      organizations: orgsResult?.total ?? 0,
      sessions: sessionsResult?.total ?? 0,
      limits: DEFAULT_QUOTA,
    };
  }
}
