# Next.js Quickstart Example

Demonstrates basic Blerp authentication in a Next.js app.

## Running

From the monorepo root:

```bash
bun install
bun run dev
```

The example starts on the next available port (typically `http://localhost:3002`).

## Configuration

Copy `.env.example` to `.env.local` and set your Blerp API keys:

```bash
NEXT_PUBLIC_BLERP_PUBLISHABLE_KEY=pk_test_demo
BLERP_SECRET_KEY=sk_test_demo
# Default API port is 3000; override with BLERP_API_PORT
NEXT_PUBLIC_BLERP_API_URL=http://localhost:3000
BLERP_TENANT_ID=demo-project
```
