import { getCurrentUserEntity } from "@/lib/blerp-api/get-current-user-entity";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const context = await getCurrentUserEntity();

    if (!context || !context.entityUserId || !context.entityId) {
      return NextResponse.json({ error: "Missing Monite context" }, { status: 401 });
    }

    // Mock Monite token exchange
    // In a real app, this would be:
    // const res = await fetch("https://api.sandbox.monite.com/v1/auth/token", { ... });
    // return NextResponse.json(await res.json());

    return NextResponse.json({
      access_token: `mock_token_${context.entityUserId}`,
      token_type: "Bearer",
      expires_in: 3600,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
