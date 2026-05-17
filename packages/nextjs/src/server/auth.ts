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

    // Active-org resolution (BUG-49 → BUG-77 [codex r1/r5/r13]):
    //
    //   1. Try the `__blerp_org` cookie first (reflects the user's
    //      explicit OrganizationSwitcher choice). The cookie is
    //      client-writable — never trust it as an `orgId` for server
    //      code without verifying the user actually has a membership
    //      there. Validate via /memberships/me; only commit the cookie
    //      org if validation succeeds.
    //   2. If cookie validation fails OR no cookie, fall back to the
    //      signed JWT `org_id` claim. Validate that one too (a
    //      membership might have been deleted since sign-in).
    //   3. Otherwise null — no active org.
    //
    // BUG-77 (codex r13): the previous version returned the cookie
    // value to callers even when /memberships/me 404'd, letting a
    // forged or stale cookie hijack `auth().orgId`. Now `orgId` is
    // only set after a successful membership lookup. Same applies to
    // `orgRole` / `orgPermissions`: they only return for the verified
    // org (BUG-61 — never trust JWT claims for authorization).
    const orgIdFromCookie = cookieStore.get("__blerp_org")?.value || null;
    const orgIdFromClaim = (sessionPayload.org_id as string) || null;

    let orgId: string | null = null;
    let orgRole: string | null = null;
    let orgPermissions: string[] = [];

    async function tryResolveMembership(candidateOrgId: string): Promise<boolean> {
      if (!userId || !token) return false;
      try {
        const apiUrl = getApiUrl();
        const tenantId = getTenantId();
        const res = await fetch(`${apiUrl}/v1/organizations/${candidateOrgId}/memberships/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Tenant-Id": tenantId,
          },
          cache: "no-store",
        });
        if (!res.ok) return false;
        const membership = (await res.json()) as {
          role?: string;
          permissions?: string[];
        };
        orgId = candidateOrgId;
        orgRole = membership.role ?? null;
        // BUG-63 (codex r6): consume API-returned `permissions`
        // verbatim — the membership controller resolves the canonical
        // permission set server-side (defaults + custom roles).
        orgPermissions = Array.isArray(membership.permissions) ? membership.permissions : [];
        return true;
      } catch {
        return false;
      }
    }

    if (orgIdFromCookie) {
      const ok = await tryResolveMembership(orgIdFromCookie);
      if (!ok && orgIdFromClaim && orgIdFromClaim !== orgIdFromCookie) {
        await tryResolveMembership(orgIdFromClaim);
      }
    } else if (orgIdFromClaim) {
      await tryResolveMembership(orgIdFromClaim);
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
