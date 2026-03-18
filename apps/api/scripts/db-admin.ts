/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";
import { getTenantDb } from "../src/db/router";
import { seedTenant } from "../src/db/seed";

const command = process.argv[2];
const tenantsDir = path.resolve(process.cwd(), "tenants");

async function main() {
  if (command === "migrate-all") {
    if (!fs.existsSync(tenantsDir)) return;
    const files = fs.readdirSync(tenantsDir).filter((f) => f.endsWith(".db"));
    for (const file of files) {
      const tenantId = path.basename(file, ".db");
      console.log(`🚀 Migrating tenant: ${tenantId}`);
      await getTenantDb(tenantId); // getTenantDb triggers migrate
    }
  } else if (command === "seed") {
    const tenantId = process.argv[3];
    if (!tenantId) {
      console.error("Missing tenantId");
      process.exit(1);
    }
    const db = await getTenantDb(tenantId);
    await seedTenant(tenantId, db);
  } else {
    console.log("Usage: bun run scripts/db-admin.ts [migrate-all|seed <tenantId>]");
  }
}

main().catch(console.error);
