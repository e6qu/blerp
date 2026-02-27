/* eslint-disable @typescript-eslint/no-unused-vars */
import { Webhook } from "@blerp/nextjs/server";
import { createBlerpClient } from "@blerp/backend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("X-Blerp-Signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const wh = new Webhook(process.env.BLERP_WEBHOOK_SECRET!);

  try {
    const event = wh.verify(payload, signature);
    const blerp = createBlerpClient({
      baseUrl: process.env.BLERP_API_URL || "http://localhost:3000",
      secretKey: process.env.BLERP_SECRET_KEY!,
    });

    if (event.type === "organization.created") {
      const { organizationId } = event.data;
      // Mock Monite entity creation and sync back to Blerp
      const entityId = `monite_ent_${Math.random().toString(36).substring(7)}`;

      await blerp.organizations.updateOrganizationMetadata(organizationId, {
        private_metadata: { entity_id: entityId },
      });
    }

    if (event.type === "user.created") {
      const { userId } = event.data;
      // Mock finding or creating an entity user in Monite
      // and mapping it to a specific entity
      const entityId = "monite_ent_default"; // Hardcoded for this mock
      const entityUserId = `mu_${Math.random().toString(36).substring(7)}`;

      await blerp.users.updateUserMetadata(userId, {
        private_metadata: {
          entities: {
            [entityId]: {
              entity_user_id: entityUserId,
              organization_id: "org_default",
            },
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
}
