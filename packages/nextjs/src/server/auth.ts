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

  // In a real implementation, this would fetch from the Blerp API
  return {
    id: userId,
    status: "active",
    email_addresses: [
      {
        id: "email_mock",
        email: "mock@example.com",
        verification: { status: "verified" },
      },
    ],
    public_metadata: {},
    private_metadata: {},
    unsafe_metadata: {},
    created_at: new Date().toISOString(),
  };
}
