import {} from "../../lib/redis";
import { logger } from "../../lib/logger";

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
  constructor(private tenantId: string) {}

  async checkQuota(resource: keyof QuotaConfig, currentCount: number) {
    const limit = DEFAULT_QUOTA[resource];
    if (currentCount >= limit) {
      logger.warn({ tenantId: this.tenantId, resource, limit, currentCount }, "Quota exceeded");
      throw new Error(`Quota exceeded for ${resource}. Limit: ${limit}`);
    }
  }

  async getUsage() {
    // In a real app, you would fetch these from the tenant DB
    return {
      users: 10, // Mock
      organizations: 2, // Mock
      sessions: 5, // Mock
      limits: DEFAULT_QUOTA,
    };
  }
}
