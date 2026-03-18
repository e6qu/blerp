/* eslint-disable no-console */
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

type TenantDb = BetterSQLite3Database<typeof schema>;

export async function seedTenant(tenantId: string, db: TenantDb) {
  console.log(`Seeding tenant: ${tenantId}`);

  // Seed Project — ID must match dashboard's PROJECT_ID ("demo-project")
  await db
    .insert(schema.projects)
    .values({
      id: "demo-project",
      name: `Project ${tenantId}`,
      slug: `project-${tenantId}`,
      ownerUserId: "demo_user",
    })
    .onConflictDoNothing();

  // Seed Admin User — ID must match dashboard's DEMO_USER_ID ("demo_user")
  // privateMetadata.entities maps Monite entity IDs to entity_user_id + organization_id
  await db
    .insert(schema.users)
    .values({
      id: "demo_user",
      firstName: "Admin",
      lastName: "User",
      status: "active",
      publicMetadata: { role: "admin" },
      privateMetadata: {
        entities: {
          monite_ent_demo: {
            entity_user_id: "mu_demo_user",
            organization_id: "org_monite_demo",
          },
        },
      },
    })
    .onConflictDoNothing();

  // Seed Email for admin user
  await db
    .insert(schema.emailAddresses)
    .values({
      id: `email_admin_${tenantId}`,
      userId: "demo_user",
      emailAddress: `admin@${tenantId}.blerp.dev`,
      verificationStatus: "verified",
    })
    .onConflictDoNothing();

  // Seed second user for multi-user testing
  await db
    .insert(schema.users)
    .values({
      id: "monite_user",
      firstName: "Monite",
      lastName: "Demo",
      status: "active",
      publicMetadata: { role: "member" },
      privateMetadata: {
        entities: {
          monite_ent_demo: {
            entity_user_id: "mu_monite_user",
            organization_id: "org_monite_demo",
          },
        },
      },
    })
    .onConflictDoNothing();

  // Seed Email for second user
  await db
    .insert(schema.emailAddresses)
    .values({
      id: `email_monite_${tenantId}`,
      userId: "monite_user",
      emailAddress: `monite@${tenantId}.blerp.dev`,
      verificationStatus: "verified",
    })
    .onConflictDoNothing();

  // Seed Organization
  await db
    .insert(schema.organizations)
    .values({
      id: "org_demo",
      projectId: "demo-project",
      name: "Demo Organization",
      slug: "demo-org",
    })
    .onConflictDoNothing();

  // Seed Membership
  await db
    .insert(schema.memberships)
    .values({
      id: "mem_demo",
      organizationId: "org_demo",
      userId: "demo_user",
      role: "owner",
    })
    .onConflictDoNothing();

  // Seed Monite Organization — pre-configured with entity_id + default_roles + verified_domains
  await db
    .insert(schema.organizations)
    .values({
      id: "org_monite_demo",
      projectId: "demo-project",
      name: "Demo Monite Organization",
      slug: "demo-monite-org",
      privateMetadata: {
        entity_id: "monite_ent_demo",
        default_roles: {
          admin: "role_monite_admin",
          member: "role_monite_member",
        },
        verified_domains: {
          "demo-monite.example.com": {
            status: "verified",
            enrollment_mode: "auto",
          },
        },
      },
    })
    .onConflictDoNothing();

  // Seed Monite Membership — demo_user as owner
  await db
    .insert(schema.memberships)
    .values({
      id: "mem_monite_demo",
      organizationId: "org_monite_demo",
      userId: "demo_user",
      role: "owner",
    })
    .onConflictDoNothing();

  // Seed Monite Membership — monite_user as member
  await db
    .insert(schema.memberships)
    .values({
      id: "mem_monite_member",
      organizationId: "org_monite_demo",
      userId: "monite_user",
      role: "member",
    })
    .onConflictDoNothing();

  // Seed webhook endpoint for Monite event processing
  await db
    .insert(schema.webhookEndpoints)
    .values({
      id: "whep_monite_demo",
      url: "https://example.com/webhooks/monite",
      secret: "whsec_monite_demo_secret_key",
      enabled: true,
      eventTypes: ["organization.created", "user.created"],
    })
    .onConflictDoNothing();

  // Seed API key — development publishable key for the project
  await db
    .insert(schema.apiKeys)
    .values({
      id: "key_dev_pub",
      projectId: "demo-project",
      environment: "development",
      type: "publishable",
      key: "pk_dev_demo_blerp_publishable_key_001",
      label: "Development publishable",
      status: "active",
    })
    .onConflictDoNothing();

  // Seed organization domain — verified domain on Monite org
  await db
    .insert(schema.organizationDomains)
    .values({
      id: "dom_monite_demo",
      organizationId: "org_monite_demo",
      domain: "demo-monite.example.com",
      verificationStatus: "verified",
      verificationToken: "blerp_verify_monite_demo_token",
    })
    .onConflictDoNothing();

  // Seed invitation — pending invitation on Monite org
  await db
    .insert(schema.invitations)
    .values({
      id: "inv_monite_demo",
      organizationId: "org_monite_demo",
      emailAddress: "invite@demo-monite.example.com",
      role: "member",
      status: "pending",
    })
    .onConflictDoNothing();

  console.log(`Seeded tenant: ${tenantId}`);
}
