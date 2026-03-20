import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { randomBytes, createHash } from "crypto";
import { jwt } from "../../lib/jwt";

function hashSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

export class M2MService {
  constructor(private db: BetterSQLite3Database<typeof schema>) {}

  async create(projectId: string, data: { name: string; scopes?: string[]; expiresAt?: Date }) {
    const id = `m2m_${nanoid()}`;
    const clientId = `cli_${nanoid(32)}`;
    const clientSecret = `sk_${randomBytes(32).toString("hex")}`;
    const clientSecretHash = hashSecret(clientSecret);

    await this.db.insert(schema.m2mTokens).values({
      id,
      projectId,
      name: data.name,
      clientId,
      clientSecretHash,
      scopes: data.scopes ?? [],
      expiresAt: data.expiresAt ?? null,
    });

    const token = await this.get(id);
    return {
      ...token,
      client_secret: clientSecret,
    };
  }

  async get(id: string) {
    const token = await this.db.query.m2mTokens.findFirst({
      where: eq(schema.m2mTokens.id, id),
    });
    if (!token) return null;

    return {
      id: token.id,
      project_id: token.projectId,
      name: token.name,
      client_id: token.clientId,
      scopes: token.scopes as string[],
      last_used_at: token.lastUsedAt?.toISOString() ?? null,
      expires_at: token.expiresAt?.toISOString() ?? null,
      created_at: token.createdAt.toISOString(),
      updated_at: token.updatedAt.toISOString(),
    };
  }

  async list(projectId: string) {
    const tokens = await this.db.query.m2mTokens.findMany({
      where: eq(schema.m2mTokens.projectId, projectId),
    });

    return tokens.map((t) => ({
      id: t.id,
      project_id: t.projectId,
      name: t.name,
      client_id: t.clientId,
      scopes: t.scopes as string[],
      last_used_at: t.lastUsedAt?.toISOString() ?? null,
      expires_at: t.expiresAt?.toISOString() ?? null,
      created_at: t.createdAt.toISOString(),
      updated_at: t.updatedAt.toISOString(),
    }));
  }

  async revoke(id: string) {
    await this.db.delete(schema.m2mTokens).where(eq(schema.m2mTokens.id, id));
  }

  async authenticate(clientId: string, clientSecret: string) {
    const token = await this.db.query.m2mTokens.findFirst({
      where: eq(schema.m2mTokens.clientId, clientId),
    });

    if (!token) return null;

    const candidateHash = hashSecret(clientSecret);
    if (candidateHash !== token.clientSecretHash) return null;

    if (token.expiresAt && token.expiresAt < new Date()) return null;

    await this.db
      .update(schema.m2mTokens)
      .set({ lastUsedAt: new Date() })
      .where(eq(schema.m2mTokens.id, token.id));

    return {
      id: token.id,
      projectId: token.projectId,
      scopes: token.scopes as string[],
    };
  }

  async generateJwt(clientId: string, scopes: string[], privateKey: CryptoKey): Promise<string> {
    return jwt.sign({ client_id: clientId, scope: scopes.join(" ") }, privateKey, {
      issuer: "blerp",
      audience: "blerp-api",
      expiresIn: "1h",
    });
  }
}
