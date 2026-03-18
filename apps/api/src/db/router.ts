import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import * as schema from "./schema";
import pino from "pino";

const logger = pino({ name: "db-router" });
const tenantsDir = path.resolve(process.cwd(), "tenants");

if (!fs.existsSync(tenantsDir)) {
  fs.mkdirSync(tenantsDir, { recursive: true });
}

type TenantDb = BetterSQLite3Database<typeof schema>;
const dbCache = new Map<string, TenantDb>();

export async function getTenantDb(tenantId: string): Promise<TenantDb> {
  const cached = dbCache.get(tenantId);
  if (cached) return cached;

  const dbPath = path.join(tenantsDir, `${tenantId}.db`);
  const isNew = !fs.existsSync(dbPath);

  logger.info({ tenantId, dbPath, isNew }, "Initializing tenant database");

  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite, { schema });

  // Run migrations
  // In a real app, you might want to do this outside the hot path
  try {
    migrate(db, { migrationsFolder: path.resolve(process.cwd(), "drizzle") });
  } catch (error) {
    logger.error({ tenantId, error }, "Failed to migrate tenant database");
    throw error;
  }

  dbCache.set(tenantId, db);

  // Auto-seed new databases in development mode
  if (isNew && process.env.NODE_ENV !== "production") {
    try {
      const { seedTenant } = await import("./seed");
      await seedTenant(tenantId, db);
    } catch (error) {
      logger.warn({ tenantId, error }, "Dev auto-seed failed (non-fatal)");
    }
  }

  return db;
}

export function clearDbCache() {
  dbCache.clear();
}
