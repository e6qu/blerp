import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export class WebhookService {
  constructor(private db: BetterSQLite3Database<typeof schema>) {}

  async create(data: { url: string; eventTypes?: string[] }) {
    const id = `wh_${nanoid()}`;
    const secret = `whsec_${nanoid(32)}`;

    await this.db.insert(schema.webhookEndpoints).values({
      id,
      url: data.url,
      secret,
      eventTypes: data.eventTypes || [],
    });

    return this.get(id);
  }

  async list() {
    return this.db.select().from(schema.webhookEndpoints);
  }

  async get(id: string) {
    return this.db.query.webhookEndpoints.findFirst({
      where: eq(schema.webhookEndpoints.id, id),
    });
  }

  async update(id: string, data: Partial<{ url: string; enabled: boolean; eventTypes: string[] }>) {
    await this.db
      .update(schema.webhookEndpoints)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.webhookEndpoints.id, id));

    return this.get(id);
  }

  async delete(id: string) {
    await this.db.delete(schema.webhookEndpoints).where(eq(schema.webhookEndpoints.id, id));
  }
}
