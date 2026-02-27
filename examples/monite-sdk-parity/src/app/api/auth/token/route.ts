import { getCurrentUserEntity } from "@/lib/blerp-api/get-current-user-entity";
import { NextResponse } from "next/server";

const MONITE_API_URL = process.env.MONITE_API_URL || "https://api.sandbox.monite.com";
const MONITE_CLIENT_ID = process.env.MONITE_CLIENT_ID;
const MONITE_CLIENT_SECRET = process.env.MONITE_CLIENT_SECRET;
const MONITE_VERSION = process.env.MONITE_VERSION || "2023-03-14";

export async function GET() {
  try {
    const context = await getCurrentUserEntity();

    if (!context || !context.entityUserId || !context.entityId) {
      return NextResponse.json({ error: "Missing Monite context" }, { status: 401 });
    }

    if (MONITE_CLIENT_ID && MONITE_CLIENT_SECRET) {
      const res = await fetch(`${MONITE_API_URL}/v1/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-monite-version": MONITE_VERSION,
        },
        body: JSON.stringify({
          grant_type: "client_credentials",
          entity_id: context.entityId,
          client_id: MONITE_CLIENT_ID,
          client_secret: MONITE_CLIENT_SECRET,
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        console.error("Monite token exchange failed:", error);
        return NextResponse.json(
          { error: "Monite token exchange failed", details: error },
          { status: res.status },
        );
      }

      return NextResponse.json(await res.json());
    }

    return NextResponse.json({
      access_token: `mock_token_${context.entityUserId}`,
      token_type: "Bearer",
      expires_in: 3600,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
