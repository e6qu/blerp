import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export class InvitationService {
  constructor(private db: BetterSQLite3Database<typeof schema>) {}

  async create(organizationId: string, data: { emailAddress: string; role: string }) {
    const id = `inv_${nanoid()}`;
    await this.db.insert(schema.invitations).values({
      id,
      organizationId,
      emailAddress: data.emailAddress,
      role: data.role,
      status: "pending",
    });
    return this.get(id);
  }

  async list(organizationId: string) {
    return this.db.query.invitations.findMany({
      where: eq(schema.invitations.organizationId, organizationId),
    });
  }

  async get(id: string) {
    return this.db.query.invitations.findFirst({
      where: eq(schema.invitations.id, id),
    });
  }

  async revoke(id: string) {
    await this.db
      .update(schema.invitations)
      .set({ status: "revoked", updatedAt: new Date() })
      .where(eq(schema.invitations.id, id));
    return this.get(id);
  }
}
