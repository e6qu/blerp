# Monite SDK Parity Example

Demonstrates integrating Blerp with the Monite SDK, including entity mapping, token exchange, and provider configuration.

## Running

From the monorepo root:

```bash
bun install
bun run dev
```

The example starts on the next available port (typically `http://localhost:3001` or `3002`).

## Configuration

Copy `.env.example` to `.env.local` and set your keys:

```bash
NEXT_PUBLIC_BLERP_PUBLISHABLE_KEY=pk_test_demo
BLERP_SECRET_KEY=sk_test_demo
# Default API port is 3000; override with BLERP_API_PORT
NEXT_PUBLIC_BLERP_API_URL=http://localhost:3000
BLERP_TENANT_ID=demo-project
MONITE_CLIENT_ID=your-monite-client-id
MONITE_CLIENT_SECRET=your-monite-client-secret
```

See the [Monite Integration Guide](../../apps/docs/guide/monite-integration.md) for details.
