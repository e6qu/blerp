import { cookies } from "next/headers";
import * as jose from "jose";
import type { components } from "@blerp/shared";

type User = components["schemas"]["User"];

export interface BlerpSessionPayload extends jose.JWTPayload {
  org_id?: string;
  org_role?: string;
  org_permissions?: string[];
}

let jwks: ReturnType<typeof jose.createRemoteJWKSet> | undefined;

function getJWKS(): ReturnType<typeof jose.createRemoteJWKSet> {
  if (!jwks) {
    const apiUrl = process.env.BLERP_API_URL ?? "http://localhost:3000";
    jwks = jose.createRemoteJWKSet(new URL(`${apiUrl}/v1/jwks`));
  }
  return jwks;
}

export async function auth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("__blerp_session")?.value;

  if (!token) {
    return {
      userId: null,
      orgId: null,
      orgRole: null,
      orgPermissions: [] as string[],
      has: () => false,
    };
  }

  try {
    const { payload } = await jose.jwtVerify(token, getJWKS(), {
      issuer: "blerp",
      audience: "blerp-api",
    });

    const sessionPayload = payload as BlerpSessionPayload;
    const userId = (sessionPayload.sub as string) || null;
    // org_id can come from JWT claims OR from the __blerp_org cookie (set by OrganizationSwitcher)
    const orgIdFromCookie = cookieStore.get("__blerp_org")?.value;
    const orgId = (sessionPayload.org_id as string) || orgIdFromCookie || null;

    // If org comes from cookie (not JWT), fetch the membership role from the API
    let orgRole = (sessionPayload.org_role as string) || null;
    let orgPermissions = (sessionPayload.org_permissions as string[]) || [];
    if (orgId && !orgRole && userId && token) {
      try {
        const apiUrl = process.env.BLERP_API_URL ?? "http://localhost:3000";
        const tenantId = process.env.BLERP_TENANT_ID ?? "demo-tenant";
        const res = await fetch(`${apiUrl}/v1/organizations/${orgId}/memberships`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Tenant-Id": tenantId,
          },
          cache: "no-store",
        });
        if (res.ok) {
          const body = await res.json();
          const membership = (body.data ?? []).find(
            (m: { user_id?: string }) => m.user_id === userId,
          );
          if (membership) {
            orgRole = membership.role ?? null;
            // Map role to permissions
            if (orgRole === "owner" || orgRole === "admin") {
              orgPermissions = ["org:read", "org:write", "org:manage_members"];
            } else {
              orgPermissions = ["org:read"];
            }
          }
        }
      } catch {
        // Membership lookup failed — continue without role
      }
    }

    return {
      userId,
      orgId,
      orgRole,
      orgPermissions,
      has: (check: { permission?: string; role?: string }) => {
        if (check.role && orgRole !== check.role) return false;
        if (check.permission && !orgPermissions.includes(check.permission)) return false;
        return true;
      },
    };
  } catch {
    return {
      userId: null,
      orgId: null,
      orgRole: null,
      orgPermissions: [] as string[],
      has: () => false,
    };
  }
}

export async function currentUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("__blerp_session")?.value;

  const apiUrl = process.env.BLERP_API_URL ?? "http://localhost:3000";

  // Prefer session JWT for auth (already validated by auth()), fall back to secret key
  const bearerToken = sessionToken ?? process.env.BLERP_SECRET_KEY ?? "";

  const tenantId = process.env.BLERP_TENANT_ID ?? "demo-tenant";
  const response = await fetch(`${apiUrl}/v1/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      "X-Tenant-Id": tenantId,
    },
    cache: "no-store",
  });

  if (!response.ok) return null;

  const user = (await response.json()) as User;
  return user;
}
