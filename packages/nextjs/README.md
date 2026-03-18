# @blerp/nextjs

Next.js SDK for integrating Blerp authentication into your application.

## Installation

```bash
bun add @blerp/nextjs
```

## Usage

Wrap your app with `BlerpProvider`:

```tsx
import { BlerpProvider } from "@blerp/nextjs";

export default function App({ children }) {
  return (
    <BlerpProvider publishableKey={process.env.NEXT_PUBLIC_BLERP_PUBLISHABLE_KEY!}>
      {children}
    </BlerpProvider>
  );
}
```

See the [Next.js Integration Tutorial](../../apps/docs/tutorials/nextjs-integration.md) for a full walkthrough.

## Development

From the monorepo root:

```bash
bun run dev          # Start all services (builds dependencies first)
bun run build        # Build all packages
```
