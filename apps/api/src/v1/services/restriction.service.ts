import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export class RestrictionService {
  constructor(private db: BetterSQLite3Database<typeof schema>) {}

  async create(type: "allowlist" | "blocklist", identifierType: "email" | "domain", value: string) {
    const id = `res_${nanoid()}`;
    await this.db.insert(schema.signupRestrictions).values({
      id,
      type,
      identifierType,
      value: value.toLowerCase(),
    });
    return this.db.query.signupRestrictions.findFirst({
      where: eq(schema.signupRestrictions.id, id),
    });
  }

  async list(type?: "allowlist" | "blocklist") {
    if (type) {
      return this.db.query.signupRestrictions.findMany({
        where: eq(schema.signupRestrictions.type, type),
      });
    }
    return this.db.query.signupRestrictions.findMany();
  }

  async delete(id: string) {
    await this.db.delete(schema.signupRestrictions).where(eq(schema.signupRestrictions.id, id));
  }

  async checkSignup(email: string): Promise<{ allowed: boolean; reason?: string }> {
    const normalizedEmail = email.toLowerCase();
    const domain = normalizedEmail.split("@")[1];

    const restrictions = await this.db.query.signupRestrictions.findMany();

    const blocklist = restrictions.filter((r) => r.type === "blocklist");
    const allowlist = restrictions.filter((r) => r.type === "allowlist");

    // Blocklist takes precedence
    for (const entry of blocklist) {
      if (entry.identifierType === "email" && entry.value === normalizedEmail) {
        return { allowed: false, reason: "Email address is blocked" };
      }
      if (entry.identifierType === "domain" && domain === entry.value) {
        return { allowed: false, reason: "Email domain is blocked" };
      }
    }

    // If allowlist entries exist, email/domain must match one
    if (allowlist.length > 0) {
      const matches = allowlist.some((entry) => {
        if (entry.identifierType === "email") return entry.value === normalizedEmail;
        if (entry.identifierType === "domain") return domain === entry.value;
        return false;
      });
      if (!matches) {
        return { allowed: false, reason: "Email address is not on the allowlist" };
      }
    }

    return { allowed: true };
  }
}
