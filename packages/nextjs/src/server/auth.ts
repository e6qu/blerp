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

    // Active-org resolution order (BUG-49 + codex r1/r5 followups):
    //   1. `__blerp_org` cookie if set — reflects the user's explicit
    //      OrganizationSwitcher choice and must win over any stale JWT
    //      claim. Otherwise switching orgs mid-session would never take
    //      effect server-side.
    //   2. JWT claim if present — issued by AuthService only when the
    //      user has exactly one membership at sign-in (unambiguous
    //      active org). Treated as a hint, not authoritative data.
    //   3. null — no active org.
    const orgIdFromCookie = cookieStore.get("__blerp_org")?.value;
    const orgIdFromClaim = (sessionPayload.org_id as string) || null;
    const orgId = orgIdFromCookie || orgIdFromClaim || null;

    // BUG-61 (codex r5): never trust `org_role` / `org_permissions` from
    // the JWT for authorization. Our session JWTs are 7-day; a demoted
    // or deleted membership would otherwise grant revoked permissions
    // for the rest of the token's lifetime because `has()` reads from
    // claims. ALWAYS re-resolve role + permissions from the API for
    // the active org. The JWT claims are still useful as a fast-path
    // hint that the user has SOME active membership, but the
    // authoritative permissions check goes back to the membership
    // table on every request. (Clerk emits the same claims because
    // Clerk's session JWTs are short-lived ~60s; ours are not.)
    let orgRole: string | null = null;
    let orgPermissions: string[] = [];

    if (orgId && userId && token) {
      try {
        const apiUrl = getApiUrl();
        const tenantId = getTenantId();
        // BUG-67 (codex r7): use the /me sub-route instead of the LIST
        // endpoint. LIST is gated by `members:read`, which a custom
        // role with only `org:read` doesn't have — so the previous
        // call 403'd for those users and left `orgPermissions` empty,
        // breaking `auth().has({ permission: "org:read" })`. /me is
        // gated only by authMiddleware so every authenticated member
        // can resolve their own permission set.
        const res = await fetch(`${apiUrl}/v1/organizations/${orgId}/memberships/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Tenant-Id": tenantId,
          },
          cache: "no-store",
        });
        if (res.ok) {
          const membership = (await res.json()) as {
            role?: string;
            permissions?: string[];
          };
          orgRole = membership.role ?? null;
          // BUG-63 (codex r6): consume API-returned `permissions`
          // verbatim — the membership controller resolves the canonical
          // permission set server-side (defaults + custom roles).
          orgPermissions = Array.isArray(membership.permissions) ? membership.permissions : [];
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
