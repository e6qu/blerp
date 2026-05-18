import { cookies } from "next/headers";
import { auth, currentUser, getApiUrl, getTenantId } from "@blerp/nextjs/server";
import { createBlerpClient } from "@blerp/backend";

export async function getCurrentUserEntity() {
  const { userId, orgId } = await auth();
  const user = await currentUser();

  if (!userId || !orgId || !user) return null;

  const cookieStore = await cookies();
  // BUG-54: accept either cookie name so Clerk-compat callers setting only
  // `__session` still get a working entity helper (matches the dual-cookie
  // fix in BUG-51 on the @blerp/nextjs server side).
  const sessionToken =
    cookieStore.get("__blerp_session")?.value ?? cookieStore.get("__session")?.value;
  if (!sessionToken) return null;

  const blerp = createBlerpClient({
    baseUrl: getApiUrl(),
    secretKey: sessionToken,
    tenantId: getTenantId(),
  });

  let org;
  try {
    org = await blerp.organizations.getOrganization(orgId);
  } catch {
    return null;
  }

  // Monite-specific fields derived from Blerp metadata
  // Using the snake_case fields as mapped in the controllers
  const entityId = org?.private_metadata?.entity_id as string | undefined;

  // Find entity_user_id for this entity_id in user metadata
  const userEntities = (user?.private_metadata?.entities as Record<string, unknown>) || {};
  const entityUserData = entityId
    ? (userEntities[entityId] as { entity_user_id?: string } | undefined)
    : null;
  const entityUserId = entityUserData?.entity_user_id;

  return {
    userId,
    orgId,
    entityId,
    entityUserId,
  };
}
