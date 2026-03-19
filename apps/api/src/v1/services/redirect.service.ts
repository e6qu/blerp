import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export class RedirectService {
  constructor(private db: BetterSQLite3Database<typeof schema>) {}

  async create(data: { url: string; type?: "web" | "native" }) {
    const id = `rurl_${nanoid()}`;
    await this.db.insert(schema.redirectUrls).values({
      id,
      url: data.url,
      type: data.type ?? "web",
    });
    return this.get(id);
  }

  async list() {
    return this.db.select().from(schema.redirectUrls);
  }

  async get(id: string) {
    const [row] = await this.db
      .select()
      .from(schema.redirectUrls)
      .where(eq(schema.redirectUrls.id, id));
    return row;
  }

  async delete(id: string) {
    await this.db.delete(schema.redirectUrls).where(eq(schema.redirectUrls.id, id));
  }

  async isAllowed(url: string): Promise<boolean> {
    const all = await this.list();
    if (all.length === 0) return true; // No restrictions configured
    return all.some((r) => {
      if (r.url === url) return true;
      // Allow wildcard subdomain matching: https://*.example.com
      if (r.url.includes("*")) {
        const pattern = r.url.replace(/\*/g, "[^/]+");
        return new RegExp(`^${pattern}$`).test(url);
      }
      return false;
    });
  }
}
