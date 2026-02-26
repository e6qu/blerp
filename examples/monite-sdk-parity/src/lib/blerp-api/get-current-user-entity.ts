/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@blerp/nextjs/server";
import { createBlerpClient } from "@blerp/backend";

export async function getCurrentUserEntity() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return null;

  const blerp = createBlerpClient({
    baseUrl: process.env.BLERP_API_URL || "http://localhost:3000",
    secretKey: process.env.BLERP_SECRET_KEY!,
  });

  const org = await blerp.organizations.getOrganization(orgId);
  // Monite-specific fields derived from Blerp metadata
  const entityId = (org as any).privateMetadata?.entity_id;

  return {
    userId,
    orgId,
    entityId,
  };
}
