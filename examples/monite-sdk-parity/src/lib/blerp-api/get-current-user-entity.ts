import { auth, currentUser } from "@blerp/nextjs/server";
import { createBlerpClient } from "@blerp/backend";

export async function getCurrentUserEntity() {
  const { userId, orgId } = await auth();
  const user = await currentUser();

  if (!userId || !orgId || !user) return null;

  const blerp = createBlerpClient({
    baseUrl: process.env.BLERP_API_URL || "http://localhost:3000",
    secretKey: process.env.BLERP_SECRET_KEY!,
  });

  const org = await blerp.organizations.getOrganization(orgId);

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
