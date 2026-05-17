import { cookies } from "next/headers";
import * as jose from "jose";
import type { components } from "@blerp/shared";
import { getApiUrl, getSecretKey, getTenantId } from "@blerp/shared";

type User = components["schemas"]["User"];

export interface BlerpSessionPayload extends jose.JWTPayload {
  org_id?: string;
  org_role?: string;
  org_permissions?: string[];
}

let jwks: ReturnType<typeof jose.createRemoteJWKSet> | undefined;

function getJWKS(): ReturnType<typeof jose.createRemoteJWKSet> {
  if (!jwks) {
    const apiUrl = getApiUrl();
    jwks = jose.createRemoteJWKSet(new URL(`${apiUrl}/v1/jwks`));
  }
  return jwks;
}

export async function auth() {
  const cookieStore = await cookies();
  // BUG-51: accept either cookie name. `__session` is the Clerk-compat alias.
  const token = cookieStore.get("__blerp_session")?.value ?? cookieStore.get("__session")?.value;

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

    // Active-org resolution order (BUG-49 + codex-followup):
    //   1. `__blerp_org` cookie if set — reflects the user's explicit
    //      OrganizationSwitcher choice and must win over any stale JWT
    //      claim. Otherwise switching orgs mid-session would never take
    //      effect server-side.
    //   2. JWT claim if present — issued by AuthService only when the
    //      user has exactly one membership (unambiguous active org).
    //   3. null — no active org.
    const orgIdFromCookie = cookieStore.get("__blerp_org")?.value;
    const orgIdFromClaim = (sessionPayload.org_id as string) || null;
    const orgId = orgIdFromCookie || orgIdFromClaim || null;

    // Trust the JWT role / permissions only when the JWT and the cookie
    // agree on the active org. If the cookie says a different org, we
    // need fresh role + permissions for *that* org — fall through to
    // the API fetch below.
    const claimsMatchActiveOrg = orgIdFromClaim && orgIdFromClaim === orgId;
    let orgRole = claimsMatchActiveOrg ? (sessionPayload.org_role as string) || null : null;
    let orgPermissions = claimsMatchActiveOrg
      ? (sessionPayload.org_permissions as string[]) || []
      : [];

    if (orgId && !orgRole && userId && token) {
      try {
        const apiUrl = getApiUrl();
        const tenantId = getTenantId();
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
  const sessionToken =
    cookieStore.get("__blerp_session")?.value ?? cookieStore.get("__session")?.value;

  const apiUrl = getApiUrl();

  // Prefer session JWT for auth (already validated by auth()), fall back to secret key
  const bearerToken = sessionToken ?? getSecretKey() ?? "";

  const tenantId = getTenantId();
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
