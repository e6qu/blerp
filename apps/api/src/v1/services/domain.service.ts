import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export class DomainService {
  constructor(private db: BetterSQLite3Database<typeof schema>) {}

  async addDomain(organizationId: string, domain: string) {
    const id = `dom_${nanoid()}`;
    const verificationToken = `blerp-verify-${nanoid(32)}`;

    await this.db.insert(schema.organizationDomains).values({
      id,
      organizationId,
      domain,
      verificationToken,
    });

    return this.getDomain(id);
  }

  async getDomain(id: string) {
    return this.db.query.organizationDomains.findFirst({
      where: eq(schema.organizationDomains.id, id),
    });
  }

  async listDomains(organizationId: string) {
    return this.db
      .select()
      .from(schema.organizationDomains)
      .where(eq(schema.organizationDomains.organizationId, organizationId));
  }

  async verifyDomain(id: string) {
    // Mock successful verification
    await this.db
      .update(schema.organizationDomains)
      .set({ verificationStatus: "verified", updatedAt: new Date() })
      .where(eq(schema.organizationDomains.id, id));

    return this.getDomain(id);
  }

  async deleteDomain(id: string) {
    await this.db.delete(schema.organizationDomains).where(eq(schema.organizationDomains.id, id));
  }
}
