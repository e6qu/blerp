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
    return {
      userId: (sessionPayload.sub as string) || null,
      orgId: (sessionPayload.org_id as string) || null,
      orgRole: (sessionPayload.org_role as string) || null,
      orgPermissions: (sessionPayload.org_permissions as string[]) || [],
      has: (check: { permission?: string; role?: string }) => {
        if (check.role && sessionPayload.org_role !== check.role) return false;
        if (check.permission && !sessionPayload.org_permissions?.includes(check.permission))
          return false;
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

  const response = await fetch(`${apiUrl}/v1/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) return null;

  const user = (await response.json()) as User;
  return user;
}
