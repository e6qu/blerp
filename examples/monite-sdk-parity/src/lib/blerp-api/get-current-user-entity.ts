import { cookies } from "next/headers";
import { auth, currentUser } from "@blerp/nextjs/server";
import { createBlerpClient } from "@blerp/backend";

export async function getCurrentUserEntity() {
  const { userId, orgId } = await auth();
  const user = await currentUser();

  if (!userId || !orgId || !user) return null;

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("__blerp_session")?.value;
  if (!sessionToken) return null;

  const apiUrl = process.env.BLERP_API_URL ?? "http://localhost:3000";
  const blerp = createBlerpClient({
    baseUrl: apiUrl,
    secretKey: sessionToken,
    tenantId: "demo-tenant",
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
