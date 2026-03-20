import { cookies } from "next/headers";
import * as jose from "jose";
import type { components } from "@blerp/shared";

type User = components["schemas"]["User"];

export interface BlerpSessionPayload extends jose.JWTPayload {
  org_id?: string;
  org_role?: string;
  org_permissions?: string[];
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
    const payload = jose.decodeJwt(token) as BlerpSessionPayload;
    return {
      userId: (payload.sub as string) || null,
      orgId: (payload.org_id as string) || null,
      orgRole: (payload.org_role as string) || null,
      orgPermissions: (payload.org_permissions as string[]) || [],
      has: (check: { permission?: string; role?: string }) => {
        if (check.role && payload.org_role !== check.role) return false;
        if (check.permission && !payload.org_permissions?.includes(check.permission)) return false;
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

  const apiUrl = process.env.BLERP_API_URL ?? "http://localhost:3000";
  const secretKey = process.env.BLERP_SECRET_KEY ?? "";

  const response = await fetch(`${apiUrl}/v1/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "X-User-Id": userId,
    },
    cache: "no-store",
  });

  if (!response.ok) return null;

  const user = (await response.json()) as User;
  return user;
}
