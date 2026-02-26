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

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
}
