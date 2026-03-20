import { test, expect, describe } from "bun:test";
import { BlerpClient, BlerpAPIError } from "../index.js";

function createMockResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function mockFetch(
  expectedMethod: string,
  expectedPath: string,
  responseBody: unknown,
  status = 200,
) {
  return async (input: Request | string | URL) => {
    const request = input instanceof Request ? input : new Request(input);
    const url = new URL(request.url);
    expect(request.method).toBe(expectedMethod);
    expect(url.pathname).toBe(expectedPath);
    return createMockResponse(status, responseBody);
  };
}

function mockErrorFetch(expectedMethod: string, expectedPath: string) {
  return async (input: Request | string | URL) => {
    const request = input instanceof Request ? input : new Request(input);
    const url = new URL(request.url);
    expect(request.method).toBe(expectedMethod);
    expect(url.pathname).toBe(expectedPath);
    return createMockResponse(400, {
      error: { code: "bad_request", message: "Invalid parameters" },
    });
  };
}

function makeClient(fetchImpl: typeof fetch): BlerpClient {
  globalThis.fetch = fetchImpl;
  return new BlerpClient({ baseUrl: "http://localhost:3000", secretKey: "sk_test_123" });
}

// ── Users ──

describe("users", () => {
  const mockUser = { id: "user_1", first_name: "Alice", email_addresses: [] };

  test("getUser", async () => {
    const client = makeClient(mockFetch("GET", "/v1/users/user_1", mockUser) as typeof fetch);
    const result = await client.users.getUser("user_1");
    expect(result).toEqual(mockUser);
  });

  test("listUsers", async () => {
    const body = { data: [mockUser], meta: { total: 1 } };
    const client = makeClient(mockFetch("GET", "/v1/users", body) as typeof fetch);
    const result = await client.users.listUsers({ limit: 10 });
    expect(result).toEqual(body);
  });

  test("createUser", async () => {
    const client = makeClient(mockFetch("POST", "/v1/users", mockUser, 201) as typeof fetch);
    const result = await client.users.createUser({ email_addresses: ["alice@example.com"] });
    expect(result).toEqual(mockUser);
  });

  test("updateUser", async () => {
    const client = makeClient(mockFetch("PATCH", "/v1/users/user_1", mockUser) as typeof fetch);
    const result = await client.users.updateUser("user_1", { first_name: "Bob" });
    expect(result).toEqual(mockUser);
  });

  test("updateUserMetadata", async () => {
    const client = makeClient(
      mockFetch("PATCH", "/v1/users/user_1/metadata", mockUser) as typeof fetch,
    );
    const result = await client.users.updateUserMetadata("user_1", {
      public_metadata: { role: "admin" },
    });
    expect(result).toEqual(mockUser);
  });

  test("deleteUser", async () => {
    const client = makeClient(
      mockFetch("DELETE", "/v1/users/user_1", { deleted: true }) as typeof fetch,
    );
    const result = await client.users.deleteUser("user_1");
    expect(result).toEqual({ deleted: true });
  });

  test("restoreUser", async () => {
    const client = makeClient(
      mockFetch("POST", "/v1/users/user_1/restore", mockUser) as typeof fetch,
    );
    const result = await client.users.restoreUser("user_1");
    expect(result).toEqual(mockUser);
  });

  test("throws BlerpAPIError on error", async () => {
    const client = makeClient(mockErrorFetch("GET", "/v1/users/bad") as typeof fetch);
    try {
      await client.users.getUser("bad");
      expect.unreachable("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(BlerpAPIError);
      const err = e as BlerpAPIError;
      expect(err.status).toBe(400);
      expect(err.code).toBe("bad_request");
      expect(err.message).toBe("Invalid parameters");
    }
  });
});

// ── Organizations ──

describe("organizations", () => {
  const mockOrg = { id: "org_1", name: "Acme" };

  test("getOrganization", async () => {
    const client = makeClient(mockFetch("GET", "/v1/organizations/org_1", mockOrg) as typeof fetch);
    const result = await client.organizations.getOrganization("org_1");
    expect(result).toEqual(mockOrg);
  });

  test("listOrganizations", async () => {
    const body = { data: [mockOrg], meta: { total: 1 } };
    const client = makeClient(mockFetch("GET", "/v1/organizations", body) as typeof fetch);
    const result = await client.organizations.listOrganizations({ limit: 10 });
    expect(result).toEqual(body);
  });

  test("createOrganization", async () => {
    const client = makeClient(mockFetch("POST", "/v1/organizations", mockOrg, 201) as typeof fetch);
    const result = await client.organizations.createOrganization({
      project_id: "proj_1",
      name: "Acme",
    });
    expect(result).toEqual(mockOrg);
  });

  test("updateOrganization", async () => {
    const client = makeClient(
      mockFetch("PATCH", "/v1/organizations/org_1", mockOrg) as typeof fetch,
    );
    const result = await client.organizations.updateOrganization("org_1", {
      metadata_public: { tier: "pro" },
    });
    expect(result).toEqual(mockOrg);
  });

  test("updateOrganizationMetadata", async () => {
    const client = makeClient(
      mockFetch("PATCH", "/v1/organizations/org_1/metadata", mockOrg) as typeof fetch,
    );
    const result = await client.organizations.updateOrganizationMetadata("org_1", {
      public_metadata: { x: 1 },
    });
    expect(result).toEqual(mockOrg);
  });

  test("deleteOrganization", async () => {
    const client = makeClient(
      mockFetch("DELETE", "/v1/organizations/org_1", { deleted: true }) as typeof fetch,
    );
    const result = await client.organizations.deleteOrganization("org_1");
    expect(result).toEqual({ deleted: true });
  });

  test("throws BlerpAPIError on error", async () => {
    const client = makeClient(mockErrorFetch("GET", "/v1/organizations/bad") as typeof fetch);
    try {
      await client.organizations.getOrganization("bad");
      expect.unreachable("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(BlerpAPIError);
      const err = e as BlerpAPIError;
      expect(err.status).toBe(400);
      expect(err.code).toBe("bad_request");
    }
  });
});

// ── Organization Memberships ──

describe("organizationMemberships", () => {
  const mockMembership = {
    id: "mem_1",
    role: "member",
    user_id: "user_1",
    organization_id: "org_1",
  };

  test("listMemberships", async () => {
    const body = { data: [mockMembership], meta: { total: 1 } };
    const client = makeClient(
      mockFetch("GET", "/v1/organizations/org_1/memberships", body) as typeof fetch,
    );
    const result = await client.organizationMemberships.listMemberships("org_1");
    expect(result).toEqual(body);
  });

  test("createMembership", async () => {
    const client = makeClient(
      mockFetch("POST", "/v1/organizations/org_1/memberships", mockMembership, 201) as typeof fetch,
    );
    const result = await client.organizationMemberships.createMembership("org_1", {
      user_id: "user_1",
      role: "member",
    });
    expect(result).toEqual(mockMembership);
  });

  test("updateMembership", async () => {
    const client = makeClient(
      mockFetch(
        "PATCH",
        "/v1/organizations/org_1/memberships/mem_1",
        mockMembership,
      ) as typeof fetch,
    );
    const result = await client.organizationMemberships.updateMembership("org_1", "mem_1", {
      role: "admin",
    });
    expect(result).toEqual(mockMembership);
  });

  test("deleteMembership", async () => {
    const client = makeClient(
      mockFetch("DELETE", "/v1/organizations/org_1/memberships/mem_1", {
        deleted: true,
      }) as typeof fetch,
    );
    const result = await client.organizationMemberships.deleteMembership("org_1", "mem_1");
    expect(result).toEqual({ deleted: true });
  });
});

// ── Invitations ──

describe("invitations", () => {
  const mockInvitation = { id: "inv_1", email: "alice@example.com", status: "pending" };

  test("listInvitations", async () => {
    const body = { data: [mockInvitation], meta: { total: 1 } };
    const client = makeClient(mockFetch("GET", "/v1/invitations", body) as typeof fetch);
    const result = await client.invitations.listInvitations({ status: "pending" });
    expect(result).toEqual(body);
  });

  test("createInvitation", async () => {
    const client = makeClient(
      mockFetch("POST", "/v1/invitations", mockInvitation, 201) as typeof fetch,
    );
    const result = await client.invitations.createInvitation({
      email: "alice@example.com",
      organization_id: "org_1",
      role: "member",
    });
    expect(result).toEqual(mockInvitation);
  });

  test("revokeInvitation", async () => {
    const revoked = { ...mockInvitation, status: "revoked" };
    const client = makeClient(
      mockFetch("POST", "/v1/invitations/inv_1/revoke", revoked) as typeof fetch,
    );
    const result = await client.invitations.revokeInvitation("inv_1");
    expect(result).toEqual(revoked);
  });
});

// ── Sessions ──

describe("sessions", () => {
  const mockSession = { id: "sess_1", user_id: "user_1", status: "active" };

  test("listSessions", async () => {
    const body = { data: [mockSession], meta: { total: 1 } };
    const client = makeClient(mockFetch("GET", "/v1/sessions", body) as typeof fetch);
    const result = await client.sessions.listSessions();
    expect(result).toEqual(body);
  });

  test("revokeSession", async () => {
    const client = makeClient(
      mockFetch("DELETE", "/v1/sessions/sess_1", { deleted: true }) as typeof fetch,
    );
    const result = await client.sessions.revokeSession("sess_1");
    expect(result).toEqual({ deleted: true });
  });
});

// ── Email Addresses ──

describe("emailAddresses", () => {
  const mockEmail = { id: "email_1", email_address: "alice@example.com", verified: true };

  test("listEmailAddresses", async () => {
    const body = { data: [mockEmail] };
    const client = makeClient(
      mockFetch("GET", "/v1/users/user_1/email_addresses", body) as typeof fetch,
    );
    const result = await client.emailAddresses.listEmailAddresses("user_1");
    expect(result).toEqual(body);
  });

  test("createEmailAddress", async () => {
    const client = makeClient(
      mockFetch("POST", "/v1/users/user_1/email_addresses", mockEmail, 201) as typeof fetch,
    );
    const result = await client.emailAddresses.createEmailAddress("user_1", {
      email: "bob@example.com",
    });
    expect(result).toEqual(mockEmail);
  });

  test("deleteEmailAddress", async () => {
    const client = makeClient(
      mockFetch("DELETE", "/v1/users/user_1/email_addresses/email_1", {
        deleted: true,
      }) as typeof fetch,
    );
    const result = await client.emailAddresses.deleteEmailAddress("user_1", "email_1");
    expect(result).toEqual({ deleted: true });
  });

  test("setPrimaryEmailAddress", async () => {
    const client = makeClient(
      mockFetch(
        "POST",
        "/v1/users/user_1/email_addresses/email_1/set_primary",
        mockEmail,
      ) as typeof fetch,
    );
    const result = await client.emailAddresses.setPrimaryEmailAddress("user_1", "email_1");
    expect(result).toEqual(mockEmail);
  });
});
