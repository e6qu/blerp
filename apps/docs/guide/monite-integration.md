# Monite SDK Integration Guide

Blerp provides full feature parity with the identity patterns required by the official [Monite SDK](https://github.com/team-monite/monite-sdk). This guide explains how to map your Monite entities to Blerp and configure the integration.

## 1. Metadata Schema Mapping

Monite relies on specific identity mappings stored within your user and organization metadata. Blerp supports deep merging of these complex structures.

### Organization Metadata (Monite Entity)

Every Blerp Organization corresponds to a single Monite Entity. You must store the `entity_id` in the organization's private metadata.

```json
{
  "private_metadata": {
    "entity_id": "monite_ent_123"
  }
}
```

### User Metadata (Monite Entity User)

A single Blerp User can belong to multiple Monite Entities. Blerp handles this via the `entities` record in the user's private metadata.

```json
{
  "private_metadata": {
    "entities": {
      "monite_ent_123": {
        "entity_user_id": "mu_abc1",
        "organization_id": "org_xyz"
      },
      "monite_ent_456": {
        "entity_user_id": "mu_def2",
        "organization_id": "org_uvw"
      }
    }
  }
}
```

## 2. Token Exchange Endpoint

The `@monite/sdk-react` requires a server-side endpoint to fetch a short-lived access token. With Blerp, you can construct this endpoint (e.g., `/api/auth/token`) by resolving the Blerp session.

### Example (Next.js Route Handler)

```typescript
import { auth, currentUser } from "@blerp/nextjs/server";
import { createBlerpClient } from "@blerp/backend";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId, orgId } = await auth();
  const user = await currentUser();

  if (!userId || !orgId || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Fetch organization to get the mapped Monite entity_id
  const blerp = createBlerpClient({
    baseUrl: process.env.BLERP_API_URL!,
    secretKey: process.env.BLERP_SECRET_KEY!,
  });
  const org = await blerp.organizations.getOrganization(orgId);
  const entityId = org?.private_metadata?.entity_id as string | undefined;

  // 2. Resolve the Monite entity_user_id from the user's metadata
  const userEntities = (user?.private_metadata?.entities as Record<string, any>) || {};
  const entityUserId = entityId ? userEntities[entityId]?.entity_user_id : null;

  if (!entityId || !entityUserId) {
    return NextResponse.json({ error: "Missing Monite mapping data" }, { status: 400 });
  }

  // 3. Request a token from Monite using Server-to-Server Auth
  const moniteRes = await fetch("https://api.sandbox.monite.com/v1/auth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-monite-version": "2023-03-14",
    },
    body: JSON.stringify({
      grant_type: "entity_user",
      entity_user_id: entityUserId,
      client_id: process.env.MONITE_CLIENT_ID,
      client_secret: process.env.MONITE_CLIENT_SECRET,
    }),
  });

  return NextResponse.json(await moniteRes.json());
}
```

## 3. Webhook Synchronization

To keep Blerp metadata in sync with Monite, configure your Monite server to listen to Blerp's `organization.created` and `user.created` webhooks.

When an organization is created in Blerp:

1. Create the Entity via the Monite API.
2. Update the Blerp Organization with the new `entity_id` using `blerp.organizations.updateOrganizationMetadata()`.

When a user joins an organization:

1. Create the Entity User via the Monite API.
2. Update the Blerp User's `entities` mapping using `blerp.users.updateUserMetadata()`.

## 4. Frontend Configuration

Wrap your application in both the `<BlerpProvider>` and the `<MoniteProvider>` (ensuring the Monite Provider is a child so it can access the Blerp session).

```tsx
import { BlerpProvider, OrganizationSwitcher } from "@blerp/nextjs";
import { MoniteSDK } from "@monite/sdk-api";
import { MoniteProvider } from "@monite/sdk-react";

// Initialize Monite SDK pointing to the token exchange route defined above
const monite = new MoniteSDK({
  fetchToken: async () => {
    const res = await fetch("/api/auth/token");
    return res.json();
  },
});

export default function App({ children }) {
  return (
    <BlerpProvider publishableKey="pk_...">
      <OrganizationSwitcher />
      <MoniteProvider monite={monite}>{children}</MoniteProvider>
    </BlerpProvider>
  );
}
```
