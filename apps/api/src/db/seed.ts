/* eslint-disable no-console */
import { getTenantDb } from "./router";
import * as schema from "./schema";

export async function seedTenant(tenantId: string) {
  const db = await getTenantDb(tenantId);

  console.log(`🌱 Seeding tenant: ${tenantId}`);

  // Seed Project
  await db
    .insert(schema.projects)
    .values({
      id: `proj_${tenantId}`,
      name: `Project ${tenantId}`,
      slug: `project-${tenantId}`,
      ownerUserId: "user_admin",
    })
    .onConflictDoNothing();

  // Seed Admin User
  await db
    .insert(schema.users)
    .values({
      id: "user_admin",
      firstName: "Admin",
      lastName: "User",
      status: "active",
      publicMetadata: { role: "admin" },
    })
    .onConflictDoNothing();

  // Seed Email
  await db
    .insert(schema.emailAddresses)
    .values({
      id: `email_admin_${tenantId}`,
      userId: "user_admin",
      emailAddress: `admin@${tenantId}.blerp.dev`,
      verificationStatus: "verified",
    })
    .onConflictDoNothing();

  console.log(`✅ Seeded tenant: ${tenantId}`);
}
