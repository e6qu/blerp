import { cookies } from "next/headers";
import * as jose from "jose";

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

export async function currentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  return {
    id: userId,
    firstName: "Mock",
    lastName: "User",
    emailAddresses: [{ emailAddress: "mock@example.com" }],
  };
}
