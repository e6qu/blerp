# @blerp/backend

Server-side SDK for interacting with the Blerp Identity Service API.

## Installation

```bash
bun add @blerp/backend
```

## Usage

```typescript
import { createBlerpClient } from "@blerp/backend";

const blerp = createBlerpClient({
  secretKey: process.env.BLERP_SECRET_KEY!,
  baseUrl: process.env.BLERP_API_URL!,
});

const users = await blerp.users.getUserList();
```

## Development

From the monorepo root:

```bash
bun run dev          # Start all services
bun run build        # Build all packages
```
