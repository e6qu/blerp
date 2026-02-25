import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getTenantDb, clearDbCache } from "../router";
import * as schema from "../schema";
import fs from "node:fs";
import path from "node:path";

describe("Multi-tenant Data Isolation", () => {
  const tenantA = "test_tenant_a";
  const tenantB = "test_tenant_b";

  beforeAll(() => {
    clearDbCache();
    const tenantsDir = path.resolve(process.cwd(), "tenants");
    if (!fs.existsSync(tenantsDir)) fs.mkdirSync(tenantsDir, { recursive: true });
    [tenantA, tenantB].forEach((id) => {
      const p = path.join(tenantsDir, `${id}.db`);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    });
  });

  afterAll(() => {
    clearDbCache();
    const tenantsDir = path.resolve(process.cwd(), "tenants");
    [tenantA, tenantB].forEach((id) => {
      const p = path.join(tenantsDir, `${id}.db`);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    });
  });

  it("should keep data isolated between tenants", async () => {
    const dbA = await getTenantDb(tenantA);
    const dbB = await getTenantDb(tenantB);

    // Insert user in Tenant A
    await dbA.insert(schema.users).values({
      id: "user_a",
      firstName: "User A",
    });

    // Insert user in Tenant B
    await dbB.insert(schema.users).values({
      id: "user_b",
      firstName: "User B",
    });

    // Verify Tenant A only sees user_a
    const usersA = await dbA.select().from(schema.users);
    expect(usersA).toHaveLength(1);
    expect(usersA[0].id).toBe("user_a");

    // Verify Tenant B only sees user_b
    const usersB = await dbB.select().from(schema.users);
    expect(usersB).toHaveLength(1);
    expect(usersB[0].id).toBe("user_b");
  });

  it("should handle relations correctly within a tenant", async () => {
    const dbA = await getTenantDb(tenantA);

    await dbA.insert(schema.emailAddresses).values({
      id: "email_a",
      userId: "user_a",
      emailAddress: "user@tenant-a.com",
    });

    const userWithEmails = await dbA.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, "user_a"),
      with: {
        emailAddresses: true,
      },
    });

    expect(userWithEmails?.emailAddresses).toHaveLength(1);
    expect(userWithEmails?.emailAddresses[0].emailAddress).toBe("user@tenant-a.com");
  });
});
